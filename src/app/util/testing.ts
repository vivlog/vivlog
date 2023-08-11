import assert from 'assert'
import { InjectPayload } from 'light-my-request'
import { Host } from '../../host/types'
import { inject, injectWithAuth } from '../../utils/testing'
import { Roles } from '../types'

export type AdminSession = Awaited<ReturnType<typeof createNewAdminSession>>

export async function createNewAdminSession(s: Host, initSite = true) {
    const username = 'demo-admin'
    const password = `admin-${Date.now()}`

    if (initSite) {
        const initRet = await inject(s, 'setting', 'initSettings', [
            { group: 'system', name: 'site', value: 'test.example.com' }
        ])

        assert.strictEqual(initRet.statusCode, 200, initRet.body)
    }

    const registerRet = await inject(s, 'user', 'registerUser', {
        username,
        password
    })

    assert.strictEqual(registerRet.statusCode, 200, registerRet.body)

    const loginRet = await inject(s, 'user', 'loginUser', {
        username,
        password
    })

    assert.strictEqual(loginRet.statusCode, 200, loginRet.body)

    const data = JSON.parse(loginRet.body)
    const user = data.data.user

    assert.strictEqual(user.role, Roles.Admin)
    const token = data.data.token as string

    return {
        user,
        inject: (api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(s, api, method, payload, token)
        }
    }
}
