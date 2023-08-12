import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { defaultSettings } from '../../types'
import { AdminSession, createNewSession } from '../../util/testing'
import { PostDto, PostTypeEnum } from './entities'

describe('Posts API', () => {
    let host: ServerHost
    let sess: AdminSession
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        host = await bootstrap()
    })
    step('create a post while not logged in, expect permission denied', async () => {
        const ret = await inject(host, 'post', 'createPost', {
            title: 'test',
            content: 'test',
            type: PostTypeEnum.Thread
        })
        assert.strictEqual(ret.statusCode, 401, ret.body)
    })
    step('create a new admin session', async () => {
        sess = await createNewSession(host)
    })

    step('create a post', async () => {
        const ret = await sess.inject('post', 'createPost', {
            title: 'test',
            content: 'test',
            type: PostTypeEnum.Thread
        })
        assert.strictEqual(ret.statusCode, 200, ret.body)
        const data = ret.json()
        const post = data.data as PostDto
        assert.strictEqual(post.id, 1)
        assert.strictEqual(post.title, 'test')
        assert.strictEqual(post.content, 'test')
        assert.strictEqual(post.type, PostTypeEnum.Thread)
        assert.strictEqual(post.author_site, defaultSettings.find(ent => ent.group == 'system' && ent.name == 'site')?.value)
        assert.strictEqual(post.author_uuid, sess.admin.uuid)
        assert.strictEqual(post.slug, '')
        assert.deepStrictEqual(post.attachment_vids, [])
        assert.deepStrictEqual(post.custom, {})
    })

    step('get post', async () => {
        const ret = await sess.inject('post', 'getPost', {
            id: 1
        })
        assert.strictEqual(ret.statusCode, 200, ret.body)
        const data = ret.json()
        const post = data.data as PostDto
        assert.strictEqual(post.id, 1)
        assert.strictEqual(post.title, 'test')
        assert.strictEqual(post.content, 'test')
        assert.strictEqual(post.type, PostTypeEnum.Thread)
        assert.strictEqual(post.author_site, defaultSettings.find(ent => ent.group == 'system' && ent.name == 'site')?.value)
        assert.strictEqual(post.author_uuid, sess.admin.uuid)
        assert.strictEqual(post.slug, '')
        assert.deepStrictEqual(post.attachment_vids, [])
        assert.deepStrictEqual(post.custom, {})
    })


    after(async () => {
        await host.stop()
    })
})
