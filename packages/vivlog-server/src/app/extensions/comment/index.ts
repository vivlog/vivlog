import { Extension, Host, Logger } from '../../../host/types'
import { createCommentApi } from './api'
import { Comment } from './entities'
import { CommentService } from './service'

function onActivate(host: Host) {
    host.container.register('commentableEntities', [])
    host.container.register(CommentService.name, new CommentService(host.container))
}

function onAllActivated(host: Host) {
    const logger = host.container.resolve('logger') as Logger
    createCommentApi(host)
    logger.info('Comment module activated')
}

const meta = {
    name: 'comment-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'connection-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Comment]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

