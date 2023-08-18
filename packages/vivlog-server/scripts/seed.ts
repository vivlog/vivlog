import { loremIpsum } from 'lorem-ipsum'
import { CombinedSession, createNewSession, createSite } from '../src/app/util/testing'
import { repeat } from '../src/utils/data'
import { defer, finalize, injectWithAuth, removeFile } from '../src/utils/testing'

export type Options = {
    stop: boolean
    multipleSite: boolean
}

const seed = (async ({ stop, multipleSite }: Options) => {
    const createPost = (sess: CombinedSession) => {
        const content = loremIpsum({ count: 1, units: 'paragraphs' })
        const token = sess.admin.token
        return injectWithAuth(host1, 'post', 'createPost', { content }, token)
    }

    removeFile('db.sqlite')

    const { host: host1, siteName: siteName1 } = await createSite({
        name: 'site1',
        dbPath: 'db.sqlite',
        port: '9009',
        sitePath: '/site1'
    })
    defer(host1, h => stop && h.stop())
    const sess1 = await createNewSession(host1, true, ['admin'])

    await Promise.all(repeat(5, () => createPost(sess1)))
    host1.logger.info('password for admin:' + sess1.admin.password)

    !multipleSite && finalize()

    const { host: host2, siteName: siteName2 } = await createSite({
        name: 'site2',
        dbPath: 'db2.sqlite',
        port: '9009',
        sitePath: '/site1'
    })
    defer(host2, h => stop && h.stop())
    const sess2 = await createNewSession(host1, true, ['admin'])
    await Promise.all(repeat(5, () => createPost(sess2)))

    host1.logger.info(`password for ${siteName1} admin: + ${sess1.admin.password}`)
    host2.logger.info(`password for ${siteName2} admin: + ${sess2.admin.password}`)
})

try {
    const args = process.argv.slice(2)
    seed({
        stop: !args.includes('--boot'),
        multipleSite: args.includes('--multiple-site')
    })
} catch (error) {
    console.error(error)
}
