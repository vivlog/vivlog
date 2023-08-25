import { ForbiddenError, Host } from '../../../host/types'
import { RouteHelper } from '../../helper/route_helper'
import { Role } from '../../types'
import { CreateCommentDto, createCommentSchema, deleteCommentSchema, getCommentSchema, getCommentsSchema, updateCommentSchema } from './entities'
import { CommentService } from './service'


export function createCommentApi(host: Host) {
    const commentService = host.container.resolve(CommentService.name) as CommentService

    const routes = host.container.resolve('routes') as RouteHelper

    routes.new().handle('comment', 'createComment', createCommentSchema, async (req) => {
        // const allowGuest = await settingService.getValueOrDefault(Settings.Comment._group, Settings.Comment.allow_guest, false)
        const dto = req.body! as CreateCommentDto
        if (req.agent === undefined) {
            throw new ForbiddenError('Should contain commentator info')
        }
        return await commentService.createComment(dto, req.agent)
    })

    routes.new().minRole(Role.Author).handle('comment', 'updateComment', updateCommentSchema, async (req) => {
        return await commentService.updateComment(req.body!)
    })

    routes.new().minRole(Role.Author).handle('comment', 'deleteComment', deleteCommentSchema, async (req) => {
        return await commentService.deleteComment(req.body!)
    })

    routes.new().handle('comment', 'getComment', getCommentSchema, async (req) => {
        return await commentService.getComment(req.body!)
    })

    routes.new().handle('comment', 'getComments', getCommentsSchema, async (req) => {
        return await commentService.getComments(req.body!)
    })
}
