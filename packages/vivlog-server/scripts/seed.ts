import assert from 'assert'
import { randomUUID } from 'crypto'
import { RegisterDto, UserLoginResponse } from '../src/app/extensions/user/entities'
import { rpc } from '../src/utils/rpc'

const f = (async () => {
    console.log('Seeding...')

    const request = rpc('http://127.0.0.1:9000')
    {
        const ret = await request<boolean, null>('status', 'ready', null)
        assert(ret)
    }

    const userRegInfo = {
        username: 'admin',
        password: randomUUID()
    }

    let token: string
    {
        const ret = await request<UserLoginResponse, RegisterDto>('user', 'registerUser', userRegInfo)
        token = ret.token
    }

    const createPost = (content: string) => {
        return request('post', 'createPost', { content }, { token })
    }
    {
        createPost('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sit amet ligula pulvinar, porttitor ligula at, efficitur nisi.')
        createPost('Donec egestas molestie neque nec convallis. Donec pulvinar faucibus arcu eget lacinia. Ut rutrum odio tortor, quis aliquet lacus eleifend.')
        createPost('Sed tristique vitae neque a iaculis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi at.')
        createPost('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In ut volutpat eros. Aenean vitae vestibulum.')
    }

})

try {
    f()
} catch (error) {
    console.error(error)
}
