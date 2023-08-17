import assert from 'assert'
import { randomUUID } from 'crypto'
import { InjectPayload } from 'light-my-request'
import { defaultRawConfig } from '../../config/types'
import { Host } from '../../host/types'
import { bootstrap } from '../../server'
import { getNextAvailablePort, inject, injectWithAuth, removeAllFiles } from '../../utils/testing'
import { SettingService } from '../extensions/setting/service'
import { User } from '../extensions/user/entities'
import { Role, Roles, Settings } from '../types'

export type CombinedSession = Awaited<ReturnType<typeof createNewSession>>

const defaultUsers = {
    [Roles.Admin]: { username: 'demo-admin', password: randomUUID(), role: Roles.Admin },
    [Roles.Reader]: { username: 'demo-reader', password: randomUUID(), role: Roles.Reader },
    [Roles.Editor]: { username: 'demo-editor', password: randomUUID(), role: Roles.Editor },
    [Roles.Author]: { username: 'demo-author', password: randomUUID(), role: Roles.Author }
}


type CreateSiteOptions = {
    name: string
    dbPath: string
    sitePath: string
}

export const createSite = async ({ dbPath, sitePath }: CreateSiteOptions) => {
    const port = (await getNextAvailablePort()).toString()
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

async function registerUser(host: Host, user: { username: string; password: string; role: Roles }) {
    const registerResponse = await inject(host, 'user', 'registerUser', {
        username: user.username,
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
    role: Role
    token: string
    password: string
};

type RoleSessionMap = {
    [role: string]: UserSession
};

export async function createNewSession(host: Host, initSite = true, rolesToCreate?: Role[]) {
    const roleSessions: RoleSessionMap = {}

    if (initSite) {
        await initSiteSettings(host)
    }

    const createUserByRole = async (role: Role) => {
        // skip if already created
        if (roleSessions[role]) {
            return
        }
        const sess = await registerUser(host, defaultUsers[role])
        roleSessions[role] = { ...sess, password: defaultUsers[role].password }

        // the first user created will automatically be the admin
        if (role == Roles.Admin) {
            return
        }
        // update user's role
        const updateResponse = await injectWithAuth(host, 'user', 'updateUser', {
            id: sess.user.id,
            role: sess.role,
        }, roleSessions[Roles.Admin].token)

        assert.strictEqual(updateResponse.statusCode, 200, updateResponse.body)

        const jsonData = updateResponse.json()

        roleSessions[role].user.role = jsonData.data.role
    }

    const defaultRoles = [Roles.Admin, Roles.Reader, Roles.Editor, Roles.Author]
    const rolesToCreateOrDefault = rolesToCreate ?? defaultRoles

    assert(rolesToCreateOrDefault[0] === Roles.Admin, 'first role must be admin')

    await createUserByRole(Roles.Admin)
    await Promise.all(rolesToCreateOrDefault.map(createUserByRole))

    return {
        admin: roleSessions[Roles.Admin] || undefined,
        reader: roleSessions[Roles.Reader] || undefined,
        editor: roleSessions[Roles.Editor] || undefined,
        author: roleSessions[Roles.Author] || undefined,
        inject: (api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(host, api, method, payload, roleSessions[Roles.Admin].token)
        },
        injectAs: (role: Roles, api: string, method: string, payload: InjectPayload) => {
            if (!roleSessions[role]) {
                throw new Error(`role ${role} not initialized for this session`)
            }
            return injectWithAuth(host, api, method, payload, roleSessions[role].token)
        },
    }
}
