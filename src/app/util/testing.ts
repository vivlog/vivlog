import assert from 'assert'
import { InjectPayload } from 'light-my-request'
import { Host } from '../../host/types'
import { inject, injectWithAuth } from '../../utils/testing'

export type AdminSession = Awaited<ReturnType<typeof createNewAdminSession>>

export async function createNewAdminSession(s: Host) {
    const username = 'demo-admin'
    const password = `admin-${Date.now()}`

    const initRet = await inject(s, 'setting', 'initSettings', [
        { group: 'system', name: 'site', value: 'test.example.com' }
    ])

    assert(initRet.statusCode === 200)

    const registerRet = await inject(s, 'user', 'registerUser', {
        username,
        password
    })

    assert(registerRet.statusCode === 200)

    const loginRet = await inject(s, 'user', 'loginUser', {
        username,
        password
    })

    assert(loginRet.statusCode === 200)

    const data = JSON.parse(loginRet.body)
    const user = data.data.user
    const token = data.data.token as string

    return {
        user,
        inject: (api: string, method: string, payload: InjectPayload) => {
            return injectWithAuth(s, api, method, payload, token)
        }
    }
}
