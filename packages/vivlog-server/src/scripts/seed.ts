import assert from 'assert'
import { loremIpsum } from 'lorem-ipsum'
import { CreateConnectionDto } from '../app/extensions/connection/entities'
import { PostDto } from '../app/extensions/post/entities'
import { Role } from '../app/types'
import { CombinedSession, createNewSession, createSite } from '../app/util/testing'
import { toRepeatAsync } from '../utils/data'
import { defer, finalize, removeFile } from '../utils/testing'

export type Options = {
    stop: boolean
    multipleSite: boolean
}

const seed = (async (opts: Options) => {
    const { stop, multipleSite } = opts
    console.log('options', opts)

    const createPost = (sess: CombinedSession) => {
        const content = loremIpsum({ count: 1, units: 'paragraphs' })
        return sess.injectAs(Role.Admin, 'post', 'createPost', { content })
    }

    removeFile('db.sqlite')

    const { host: host1, siteName: siteName1 } = await createSite({
        name: 'site1',
        dbPath: 'db.sqlite',
        port: '9000',
        sitePath: ''
    })
    defer(host1, h => stop && h.stop())
    const sess1 = await createNewSession(host1, false, [Role.Admin])

    await Promise.all(toRepeatAsync(5, () => createPost(sess1)))
    host1.logger.info('password for admin:' + sess1.admin.password)

    if (!multipleSite) {
        await finalize()
        return
    }

    removeFile('db2.sqlite')

    const { host: host2, siteName: siteName2 } = await createSite({
        name: 'site2',
        dbPath: 'db2.sqlite',
        port: '9010',
        sitePath: ''
    })
    defer(host2, h => stop && h.stop())
    const sess2 = await createNewSession(host2, false, [Role.Admin])
    await Promise.all(toRepeatAsync(5, () => createPost(sess2)))

    host1.logger.info(`password for ${siteName1} demo-admin: ${sess1.admin.password}`)
    host2.logger.info(`password for ${siteName2} demo-admin: ${sess2.admin.password}`)

    const crRet = await sess1.inject('connection', 'createConnection', {
        remote_site: siteName2
    } as CreateConnectionDto)

    assert.strictEqual(crRet.statusCode, 200, crRet.body)

    // create comments for all posts
    const resp = await sess1.inject('post', 'getPosts', { type: 'thread' })
    assert.strictEqual(resp.statusCode, 200, resp.body)
    const posts1 = resp.json().data.posts as PostDto[]
    await posts1.forEach(async ({ uuid }) => await sess1.injectAs(Role.Admin, 'comment', 'createComment', {
        resource: {
            type: 'post',
            uuid,
            site: siteName1
        },
        content: loremIpsum({ count: 1, units: 'paragraphs' })
    }))

    if (stop) {
        await finalize()
    }
})

try {
    const args = process.argv.slice(2)
    seed({
        stop: !args.includes('--boot'),
        multipleSite: args.includes('--multiple-site')
    })
} catch (error) {
    console.error(error)
} finally {
    console.log('done')
}
