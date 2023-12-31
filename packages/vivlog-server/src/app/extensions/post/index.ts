import { Extension, Host, Logger } from '../../../host/types'
import { createPostApi } from './api'
import { Post } from './entities'
import { PostService } from './service'

function onActivate(host: Host) {
    host.container.register(PostService.name, new PostService(host.container))
}

function onAllActivated(host: Host) {
    host.container.resolve<string[]>('CommentService::commentableEntities').push('post')
    const logger = host.container.resolve('logger') as Logger
    createPostApi(host)
    logger.info('Post module activated')
}

const meta = {
    name: 'post-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Post]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

