import assert from 'assert'
import { InjectPayload } from 'light-my-request'
import { defaultRawConfig } from '../../config/types'
import { Host } from '../../host/types'
import { bootstrap } from '../../server'
import { getNextAvailablePort, inject, injectWithAuth, removeAllFiles } from '../../utils/testing'
import { SettingService } from '../extensions/setting/service'
import { User } from '../extensions/user/entities'
import { LocalRole, Role, Settings } from '../types'

export type CombinedSession = Awaited<ReturnType<typeof createNewSession>>

const defaultUsers = {
    [Role.Admin]: { username: 'admin', password: '12345678', role: Role.Admin },
    [Role.Reader]: { username: 'reader', password: '12345678', role: Role.Reader },
    [Role.Editor]: { username: 'editor', password: '12345678', role: Role.Editor },
    [Role.Author]: { username: 'author', password: '12345678', role: Role.Author }
}


type CreateSiteOptions = {
    name: string
    port?: string
    dbPath: string
    sitePath: string
}

export const createSite = async ({ dbPath, sitePath, port }: CreateSiteOptions) => {
    port = port || (await getNextAvailablePort()).toString()
    const siteUrl = `localhost:${port}${sitePath}`
    defaultRawConfig.dbPath = dbPath
    removeAllFiles([defaultRawConfig.dbPath])
    defaultRawConfig.port = port
    defaultRawConfig.sitePath = sitePath
    const site = await bootstrap()
    const settingService = site.container.resolve(SettingService.name) as SettingService
    settingService.setItem({ group: Settings.System._group, name: Settings.System.site, value: siteUrl })
    return { siteName: siteUrl, port, host: site }
}

async function initSiteSettings(host: Host) {
    const response = await inject(host, 'setting', 'initSettings', [
        { group: 'system', name: 'site', value: 'test.example.com' }
    ])

    assert.strictEqual(response.statusCode, 200, response.body)
}

async function registerUser(host: Host, user: { username: string; password: string; role: Role }) {
    const registerResponse = await inject(host, 'user', 'registerUser', {
        username: user.username,
        email: user.username + '@example.com',
        password: user.password
    })

    assert.strictEqual(registerResponse.statusCode, 200, registerResponse.body)

    const loginResponse = await inject(host, 'user', 'loginUser', {
        username: user.username,
        password: user.password
    })

    assert.strictEqual(loginResponse.statusCode, 200, loginResponse.body)

    const jsonData = loginResponse.json()
    const userData = jsonData.data.user as User

    // here userData.role, user.role can be different, because the user's role
    // will be set after by the admin

    return {
        token: jsonData.data.token,
        role: user.role,
        user: userData
    }
}

type UserSession = {
    user: User
    role: LocalRole
    token: string
    password: string
};

type RoleSessionMap = {
    [role: string]: UserSession
};

export async function createNewSession(host: Host, initSite = true, rolesToCreate?: LocalRole[]) {
    const roleSessions: RoleSessionMap = {}

    if (initSite) {
        await initSiteSettings(host)
    }

    const createUserByRole = async (role: LocalRole) => {
        // skip if already created
        if (roleSessions[role]) {
            return
        }
        const sess = await registerUser(host, defaultUsers[role])
        roleSessions[role] = { ...sess, password: defaultUsers[role].password }

        // the first user created will automatically be the admin
        if (role == Role.Admin) {
            return
        }
        // update user's role
        const updateResponse = await injectWithAuth(host, 'user', 'updateUser', {
            id: sess.user.id,
            role: sess.role,
        }, roleSessions[Role.Admin].token)

        assert.strictEqual(updateResponse.statusCode, 200, updateResponse.body)

        const jsonData = updateResponse.json()

        roleSessions[role].user.role = jsonData.data.role
    }

    const defaultRoles = [Role.Admin, Role.Reader, Role.Editor, Role.Author]
    const rolesToCreateOrDefault = rolesToCreate ?? defaultRoles

    assert(rolesToCreateOrDefault[0] === Role.Admin, 'first role must be admin')

    await createUserByRole(Role.Admin)
    await Promise.all(rolesToCreateOrDefault.map(createUserByRole))

    return {
        admin: roleSessions[Role.Admin] || undefined,
        reader: roleSessions[Role.Reader] || undefined,
        editor: roleSessions[Role.Editor] || undefined,
        author: roleSessions[Role.Author] || undefined,
        inject: (api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(host, api, method, payload, roleSessions[Role.Admin].token)
        },
        injectAs: (role: Role, api: string, method: string, payload: InjectPayload) => {
            if (!roleSessions[role]) {
                throw new Error(`role ${role} not initialized for this session`)
            }
            return injectWithAuth(host, api, method, payload, roleSessions[role].token)
        },
    }
}
