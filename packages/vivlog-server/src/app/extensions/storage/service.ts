import { FastifyRequest } from 'fastify'
import * as fs from 'fs'
import { pipeline } from 'stream'
import { DataSource, Repository } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { Attachment } from './entities'

import path from 'path'
import { promisify } from 'util'
import { ConfigProvider } from '../../../config'

const pump = promisify(pipeline)
export class StorageService {
    public db: DataSource
    public logger: Logger
    public config: ConfigProvider
    public settingService: SettingService
    public attachmentRepository: Repository<Attachment>
    get defaultSite() {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: DefaultContainer) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'config', () => container.resolve('config') as ConfigProvider)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
        lazy(this, 'attachmentRepository', () => this.db.getRepository('Attachment'))
    }


    async uploadFile(request: FastifyRequest, options: { comment?: string; uploader_uuid?: string }): Promise<Attachment> {
        const file = await request.file()
        if (!file) {
            throw new BadRequestError('No file uploaded')
        }
        const maxUploadSize = await this.settingService.getValue<number>(Settings.Storage._group, Settings.Storage.max_upload_size)
        // check content-length
        if (file.file.readableLength > maxUploadSize) {
            throw new BadRequestError('File too large')
        }

        const attachment = new Attachment()

        attachment.filename = file.filename
        attachment.mime_type = file.mimetype
        attachment.size = 0
        attachment.comment = options.comment
        attachment.uploader_uuid = options.uploader_uuid
        attachment.is_local = true
        attachment.path = path.join(this.config.get('storagePath') ?? '/tmp', file.filename)

        await pump(file.file, fs.createWriteStream(attachment.path))

        attachment.size = fs.statSync(attachment.path).size

        return attachment
    }
    // vid example: vivlog://example.com/siteB?r=attachment&id=short_id
    async resolveFile(vid: string): Promise<Buffer> {
        const parsed = new URL(vid)
        const site = 'https' + parsed.host + parsed.pathname
        const resourceType = parsed.searchParams.get('r')
        const resourceId = parsed.searchParams.get('id')
        if (!resourceType || !resourceId) {
            throw new BadRequestError('Invalid vid')
        }
        const url = `${site}/api/storage/${resourceType}/${resourceId}`
        const response = await fetch(url)
        return response.data
    }

    async deleteFile(attachment: Attachment): Promise<void> {
        // 如果文件是本地的，删除文件
        if (attachment.is_local) {
            fs.unlinkSync(attachment.path)
        }

        // 删除数据库中的记录
        await this.attachmentRepository.delete(attachment.id)
    }

    async downloadFile(attachment: Attachment): Promise<Buffer> {
        // 如果文件是本地的，直接读取文件
        if (attachment.is_local) {
            return fs.readFileSync(attachment.path)
        } else {
            // 否则，解析文件
            return this.resolveFile(attachment.url)
        }
    }
}
