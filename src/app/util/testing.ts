import assert from 'assert'
import { randomUUID } from 'crypto'
import { InjectPayload } from 'light-my-request'
import { Host } from '../../host/types'
import { inject, injectWithAuth } from '../../utils/testing'
import { UserDto } from '../extensions/user/entities'
import { Roles } from '../types'

export type AdminSession = Awaited<ReturnType<typeof createNewSession>>

const defaultUsers = [
    { username: 'demo-admin', password: randomUUID(), role: Roles.Admin },
    { username: 'demo-reader', password: randomUUID(), role: Roles.Reader },
    { username: 'demo-editor', password: randomUUID(), role: Roles.Editor },
    { username: 'demo-author', password: randomUUID(), role: Roles.Author }
]

async function initSiteSettings(host: Host) {
    const response = await inject(host, 'setting', 'initSettings', [
        { group: 'system', name: 'site', value: 'test.example.com' }
    ])

    assert.strictEqual(response.statusCode, 200, response.body)
}

async function registerUser(host: Host, user: { username: string; password: string }) {
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
    const userData = jsonData.data.user as UserDto

    assert.strictEqual(userData.role, user.role)

    return {
        token: jsonData.data.token,
        role: user.role,
        user: userData
    }
}

export async function createNewSession(host: Host, initSite = true) {
    if (initSite) {
        await initSiteSettings(host)
    }

    const tokens = defaultUsers.map(user => registerUser(host, user))

    const [admin, reader, editor, author] = await Promise.all(tokens);

    [reader, editor, author].forEach(async (user) => {
        assert(user.user.role !== Roles.Admin)

        const updateResponse = await injectWithAuth(host, 'user', 'updateUser', {
            id: user.user.id,
            role: user.role
        }, admin.token)

        assert.strictEqual(updateResponse.statusCode, 200, updateResponse.body)

        const jsonData = updateResponse.json()
        user.role = jsonData.data.role
    })

    const roles = {
        [Roles.Admin]: admin,
        [Roles.Reader]: reader,
        [Roles.Editor]: editor,
        [Roles.Author]: author,
    }

    return {
        admin,
        reader,
        editor,
        author,
        inject: (api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(host, api, method, payload, admin.token)
        },
        injectAs: (role: Roles, api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(host, api, method, payload, roles[role].token)
        }
    }
}
