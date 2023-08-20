import assert from 'assert'
import { loremIpsum } from 'lorem-ipsum'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { ServerHost } from '../../../host/host'
import { defer, finalize, getNextAvailablePort, removeFile } from '../../../utils/testing'
import { Roles } from '../../types'
import { CombinedSession, createNewSession, createSite } from '../../util/testing'
import { CreateConnectionDto } from '../connection/entities'
import { PostTypeEnum } from '../post/entities'
import { Resource } from './entities'

describe.skip('Post + Connection + Comment API', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let siteName1: string, siteName2: string
    let host1: ServerHost, host2: ServerHost
    let sess1: CombinedSession, sess2: CombinedSession
    const N = 5

    before(async () => {
        const host1ret = await createSite({
            name: 'site1',
            dbPath: defer('site1.sqlite', removeFile),
            sitePath: '/site1'
        })
        host1 = defer(host1ret.host, h => h.stop())
        siteName1 = host1ret.siteName
        const host2ret = await createSite({
            name: 'site2',
            dbPath: defer('site2.sqlite', removeFile),
            port: (await getNextAvailablePort(parseInt(host1ret.port) + 1)).toString(),
            sitePath: '/site2'
        })
        host2 = defer(host2ret.host, h => h.stop())
        siteName2 = host2ret.siteName
    })

    after(async () => {
        finalize()
    })

    step('create admin sessions', async () => {
        sess1 = await createNewSession(host1, false, [Roles.Admin, Roles.Reader])
        sess2 = await createNewSession(host2, false, [Roles.Admin, Roles.Reader])
    })

    step('create a connection from site1 to site 2', async () => {
        const crRet = await sess1.inject('connection', 'createConnection', {
            remote_site: siteName2
        } as CreateConnectionDto)

        assert.strictEqual(crRet.statusCode, 200, crRet.body)
    })
    let site1Posts: Resource[]
    let site2Posts: Resource[]

    step('create posts on site1 & site2', async () => {
        for (let i = 0; i < N; i++) {
            let res: Awaited<ReturnType<CombinedSession['inject']>>
            res = await sess1.inject('post', 'createPost', {
                content: loremIpsum({ count: 1, units: 'paragraphs' }),
                type: PostTypeEnum.Thread
            })
            assert.strictEqual(res.statusCode, 200, res.body)

            res = await sess2.inject('post', 'createPost', {
                content: loremIpsum({ count: 1, units: 'paragraphs' }),
                type: PostTypeEnum.Thread
            })
            assert.strictEqual(res.statusCode, 200, res.body)
        }

        // make sure they're created
        const ret1 = await sess1.inject('post', 'getPosts', {})
        assert.strictEqual(ret1.statusCode, 200, ret1.body)
        const data1 = ret1.json()
        assert.strictEqual(data1.data.posts.length, N)

        const ret2 = await sess2.inject('post', 'getPosts', {})
        assert.strictEqual(ret2.statusCode, 200, ret2.body)
        const data2 = ret2.json()
        assert.strictEqual(data2.data.posts.length, N)

        site1Posts = data1.data.posts
        site2Posts = data2.data.posts
    })

    step('sync posts on site1', async () => {
        const ret = await sess1.inject('post', 'syncPosts', {})
        assert.strictEqual(ret.statusCode, 200, ret.body)
        // should have N posts returned
        const posts = ret.json().data.posts
        assert.strictEqual(posts.length, N)
    })

    step('on site1, create comments on posts from site1', async () => {
        for (const post of site1Posts) {
            const res = await sess1.inject('comment', 'createComment', {
                resource: {
                    type: 'post',
                    uuid: post.uuid,
                    site: post.site
                },
                content: loremIpsum({ count: 1, units: 'paragraphs' })
            })
            assert.strictEqual(res.statusCode, 200, res.body)
        }
    })

    step('on site1, create comments on posts from site2', async () => {
        for (const post of site2Posts) {
            const res = await sess1.inject('comment', 'createComment', {
                resource: {
                    type: 'post',
                    uuid: post.uuid,
                    site: post.site
                },
                content: loremIpsum({ count: 1, units: 'paragraphs' })
            })
            assert.strictEqual(res.statusCode, 200, res.body)
        }
    })

    // step('browsePosts on site1, expect 2*N posts', async () => {
    //     const ret = await sess1.inject('post', 'browsePosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, 2 * N)
    // })

    // step('browsePosts on site2, expect N posts', async () => {
    //     const ret = await sess2.inject('post', 'browsePosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, N)
    // })

    // step('getPosts on site1, expect N posts', async () => {
    //     const ret = await sess1.inject('post', 'getPosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, N)
    // })

    // step('create a connection from site2 to site 1', async () => {
    //     const crRet = await sess2.inject('connection', 'createConnection', {
    //         remote_site: siteName1
    //     } as CreateConnectionDto)

    //     assert.strictEqual(crRet.statusCode, 200, crRet.body)
    // })

    // step('sync posts on site2', async () => {
    //     const ret = await sess2.inject('post', 'syncPosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    // })

    // step('browsePosts on site1, expect 2*N posts', async () => {
    //     const ret = await sess1.inject('post', 'browsePosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, 2 * N)
    // })

    // step('browsePosts on site2, expect 2*N posts', async () => {
    //     const ret = await sess2.inject('post', 'browsePosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, 2 * N)
    // })

    // step('getPosts on site2, expect N posts', async () => {
    //     const ret = await sess2.inject('post', 'getPosts', {})
    //     assert.strictEqual(ret.statusCode, 200, ret.body)
    //     const data = ret.json()
    //     assert.strictEqual(data.data.posts.length, N)
    // })

})
