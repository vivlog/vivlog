import { createNewSession } from '../src/app/util/testing'
import { bootstrap } from '../src/server'
import { injectWithAuth, removeFile } from '../src/utils/testing'

const f = (async () => {
    console.log('Unlink Database...')
    removeFile('db.sqlite')

    console.log('Start server...')
    const host = await bootstrap()

    console.log('Seeding...')
    const sess = await createNewSession(host, true, ['admin'])
    const createPost = (content: string) => {
        return injectWithAuth(host, 'post', 'createPost', { content }, sess.admin.token)
    }
    await Promise.all([
        createPost('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sit amet ligula pulvinar, porttitor ligula at, efficitur nisi.'),
        createPost('Donec egestas molestie neque nec convallis. Donec pulvinar faucibus arcu eget lacinia. Ut rutrum odio tortor, quis aliquet lacus eleifend.'),
        createPost('Sed tristique vitae neque a iaculis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi at.'),
        createPost('Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In ut volutpat eros. Aenean vitae vestibulum.'),
    ])
    await host.stop()

    host.logger.info('password for admin:' + sess.admin.password)

})

try {
    f()
} catch (error) {
    console.error(error)
}
