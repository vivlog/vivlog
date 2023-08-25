import { SettingService } from '../app/extensions/setting/service'
import { UserService } from '../app/extensions/user/service'
import { GuestInfo, Role, Settings, SourceType, ajv, guestInfoValidator, roleList } from '../app/types'
import { Container } from '../container'
import { AgentInfo, AgentType, BadRequestError, ExHeaders, Middleware, UnauthorizedError } from '../host/types'
import { base64Decode } from '../utils/data'
import { lazy } from '../utils/lazy'

export const inflateAgent: (container: Container) => Middleware = (container: Container) => {
    const userAgentInflatorInstance = userAgentInflator(container)
    return async (...args) => {
        const inflators = [userAgentInflatorInstance, siteAgentInflator, guestAgentInflator]
        for (const inflator of inflators) {
            await inflator(...args)
        }
    }
}

export const userAgentInflator: (container: Container) => Middleware = (container: Container) => {

    const userService = container.resolve(UserService.name) as UserService
    const settingService = container.resolve(SettingService.name) as SettingService
    // const site = await settingService.getValue<string>(Settings.System._group, Settings.System.site)
    const cachedValues = {
        site: undefined as string | undefined,
    }
    lazy(cachedValues, 'site', async () => await settingService.getValue<string>(Settings.System._group, Settings.System.site))

    return async (req) => {
        if (!req.source) {
            return
        }

        if (req.source.type !== SourceType.User) {
            return
        }

        const user = await userService.getUser({ id: parseInt(req.source.sub) })

        if (!user) {
            return
        }

        if (!roleList.filter((role) => role === user.role).length) {
            throw new UnauthorizedError('invalid role')
        }

        if (user.role == Role.Agent) {
            throw new UnauthorizedError('invalid role, agent is not allowed to login as a user')
        }

        const agent: AgentInfo = {
            type: AgentType.User,
            id: user.id.toString(),
            trusted: true,
            uuid: user.uuid,
            local: true,
            email: user.email,
            username: user.username,
            role: user.role as Role,
            site: cachedValues.site,
        }

        req.agent = agent
    }
}

export const siteAgentInflator: Middleware = async (req) => {
    if (!req.source) {
        return
    }

    if (req.source.type !== SourceType.Site) {
        return
    }

    const agent: AgentInfo = {
        type: AgentType.Site,
        site: req.source.sub,
        role: Role.Agent,
        local: false,
        trusted: false, // means the agent is current site or a user on current site
    }

    req.agent = agent
}

export const guestAgentInflator: Middleware = async (req) => {
    if (req.source) {
        return
    }

    const guestBase64 = req.headers[ExHeaders.Guest]
    if (!guestBase64) {
        return
    }
    if (typeof guestBase64 !== 'string') {
        throw new BadRequestError('invalid guest info, not a string')
    }

    const guest = base64Decode<GuestInfo>(guestBase64)
    if (!guest) {
        throw new BadRequestError('invalid guest info, not base64')
    }
    if (!guestInfoValidator(guest)) {
        const errors = ajv.errorsText(guestInfoValidator.errors)
        throw new BadRequestError('invalid guest info: ' + errors)
    }
    req.agent = {
        email: guest.email,
        id: undefined,
        local: false,
        role: Role.Guest,
        site: guest.site,
        trusted: false,
        type: AgentType.Guest,
        username: guest.name,
        uuid: undefined,
    }
}
