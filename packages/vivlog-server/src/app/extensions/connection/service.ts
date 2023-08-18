import * as jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'
import { ConfigProvider } from '../../../config'
import { Container } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { rpc } from '../../../utils/rpc'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { AgentType } from '../user/entities'
import { Connection, ConnectionDirections, CreateConnectionDto, DeleteConnectionDto, GetConnectionDto, GetConnectionsDto, RequestConnectionDto, ValidateConnectionRequestDto } from './entities'

export class ConnectionService {
    private db: DataSource
    private logger: Logger
    private config: ConfigProvider
    private settingService: SettingService
    // tokens signed for remote_sites. key: remote_site, value: {local_token, expired_at}
    private pendingConnections: Map<string, { local_token: string; remote_token?: string }> = new Map()
    get currentSite(): Promise<string> {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'config', () => container.resolve('config') as ConfigProvider)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
    }

    async createConnection(dto: CreateConnectionDto) {
        this.logger.info('[%s] createConnection %o', await this.currentSite, dto)
        const { remote_site } = dto
        const request = rpc(remote_site)
        const secret = this.config.get('jwtSecret', 'secret')!
        const local_token = jwt.sign({ sub: remote_site, type: AgentType.ConnectionRequest }, secret, { expiresIn: '1h' })
        try {
            this.pendingConnections.set(remote_site, { local_token })
            const ret = await request<unknown, RequestConnectionDto>('connection', 'requestConnection', {
                local_site: await this.currentSite,
                local_token,
                remote_site: remote_site
            })
            if (ret != null) {
                throw new BadRequestError('Failed to createConnection when calling requestConnection: ' + JSON.stringify(ret))
            }
        } catch (error) {
            let emsg = ''
            console.error(error)
            if (error instanceof Error) {
                emsg = error.message
            }
            throw new BadRequestError('Failed to request connection: ' + emsg)
        }

        if (!this.pendingConnections.has(remote_site)) {
            throw new BadRequestError('Failed to request connection: not a pending connection')
        }
        const remote_token = this.pendingConnections.get(remote_site)!.remote_token
        if (!remote_token) {
            throw new BadRequestError('Failed to request connection: remote_token is null')
        }

        const existingConnection = await this.db.getRepository(Connection).findOneBy({ remote_site })

        if (existingConnection) {
            if (existingConnection.direction == 'incoming') {
                existingConnection.direction = ConnectionDirections.Both
            }
            existingConnection.remote_token = remote_token
            this.logger.info('[%s] upgrade connection %o', await this.currentSite, existingConnection)
            await this.db.getRepository(Connection).update(existingConnection.id, existingConnection)
            this.pendingConnections.delete(remote_site)
            return existingConnection
        }
        else {

            const connection = this.db.getRepository(Connection).create({
                remote_site,
                remote_token,
                active_at: new Date(),
                direction: ConnectionDirections.Outgoing
            })
            await this.db.getRepository(Connection).save(connection)
            this.pendingConnections.delete(remote_site)
            return connection
        }
    }

    // async updateConnection(dto: UpdateConnectionDto) {
    //     const connection = await this.db.getRepository(Connection).findOneBy({ uuid: dto.uuid })
    //     if (!connection) {
    //         throw new Error('Connection not found')
    //     }
    //     return this.getConnection({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    // }

    async deleteConnection(dto: DeleteConnectionDto) {
        await this.db.getRepository(Connection).delete(dto.id)
        return { deleted: true }
    }

    async getConnection(dto: GetConnectionDto) {
        return this.db.getRepository(Connection).findOneBy(dto)
    }

    async getConnections(dto: GetConnectionsDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Connection)
            .createQueryBuilder('connection')

        if (filters) {
            if (filters.remote_site) {
                query.andWhere('connection.remote_site like :remote_site', { remote_site: `%${filters.remote_site}%` })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [connections, total] = await query.getManyAndCount()
            return {
                connections,
                total
            }
        }

        const connections = await query.getMany()
        return {
            connections
        }
    }

    async requestConnection(dto: RequestConnectionDto) {
        this.logger.info('[%s] requestConnection %o', await this.currentSite, dto)
        const { local_site, local_token, remote_site } = dto
        if (remote_site != await this.currentSite) {
            throw new BadRequestError('Remote site is not current site')
        }
        const secret = this.config.get('jwtSecret', 'secret')!
        const remote_token = jwt.sign({ sub: local_site, type: AgentType.ConnectionReader }, secret, { expiresIn: '1h' })
        const request = rpc(local_site)
        try {
            await request<unknown, ValidateConnectionRequestDto>('connection', 'validateConnectionRequest', { local_token, remote_token, local_site, remote_site })
        } catch (error) {
            let emsg = ''
            console.error(error)
            if (error instanceof Error) {
                emsg = error.message
            }
            throw new BadRequestError('Failed to validate connection request: ' + emsg)
        }

        // if outgoing connection already exists, upgrade it to both
        const existingConnection = await this.db.getRepository(Connection).findOneBy({ remote_site: local_site })

        if (existingConnection) {
            if (existingConnection.direction == 'outgoing') {
                existingConnection.direction = ConnectionDirections.Both
            }
            existingConnection.remote_token = local_token
            this.logger.info('[%s] upgrade connection %o', await this.currentSite, existingConnection)
            await this.db.getRepository(Connection).update(existingConnection.id, existingConnection)
        }
        else {
            this.logger.info('[%s] create connection %o', await this.currentSite, dto)
            const connection = this.db.getRepository(Connection).create({
                remote_site: local_site,
                remote_token: local_token,
                direction: ConnectionDirections.Incoming,
                active_at: new Date()
            })
            await this.db.getRepository(Connection).save(connection)
        }
        return null
    }

    async validateConnectionRequest(dto: ValidateConnectionRequestDto) {
        this.logger.info('[%s] validateConnectionRequest %o', await this.currentSite, dto)
        const { local_token, remote_token, local_site, remote_site } = dto
        const pendingItem = this.pendingConnections.get(remote_site)
        if (!pendingItem) {
            throw new BadRequestError('Connection request not found')
        }
        const { local_token: expected_local_token, remote_token: undefined_remote_token } = pendingItem

        if (undefined_remote_token) {
            throw new BadRequestError('Connection request already validated')
        }
        if (local_site != await this.currentSite) {
            throw new BadRequestError('Local site is not current site')
        }

        if (!expected_local_token) {
            throw new BadRequestError('Connection request not found')
        }

        if (expected_local_token != local_token) {
            throw new BadRequestError('Invalid local token')
        }

        this.pendingConnections.set(remote_site, { local_token, remote_token })
        return null
    }
}
