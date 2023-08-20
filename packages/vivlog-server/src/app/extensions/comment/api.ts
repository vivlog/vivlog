import { assert } from 'console'
import { ForbiddenError, Host } from '../../../host/types'
import { RouteHelper } from '../../helper/route_helper'
import { Roles, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreateCommentDto, createCommentSchema, deleteCommentSchema, getCommentSchema, getCommentsSchema, updateCommentSchema } from './entities'
import { CommentService } from './service'


export function createCommentApi(host: Host) {
    const commentService = host.container.resolve(CommentService.name) as CommentService
    const userService = host.container.resolve(UserService.name) as UserService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const routes = host.container.resolve('routes') as RouteHelper

    routes.new().minRole(Roles.Author).handle('comment', 'createComment', createCommentSchema, async (req) => {
        const site = await settingService.getValueOrDefault(Settings.System._group, Settings.System.site, '')
        const allowGuest = await settingService.getValueOrDefault(Settings.Comment._group, Settings.Comment.allow_guest, false)
        const dto = req.body! as CreateCommentDto
        if (req.user === undefined && !allowGuest) {
            throw new ForbiddenError('Guest comment is not allowed')
        }
        const user = await userService.getUser({ id: parseInt(req.user!.id) })
        assert(user !== null)
        dto.site = site as string
        assert(dto.site)
        dto.author_site = site as string
        assert(dto.author_site)
        dto.author_uuid = user!.uuid
        return await commentService.createComment(dto)
    })

    routes.new().minRole(Roles.Author).handle('comment', 'updateComment', updateCommentSchema, async (req) => {
        return await commentService.updateComment(req.body!)
    })

    routes.new().minRole(Roles.Author).handle('comment', 'deleteComment', deleteCommentSchema, async (req) => {
        return await commentService.deleteComment(req.body!)
    })

    routes.new().handle('comment', 'getComment', getCommentSchema, async (req) => {
        return await commentService.getComment(req.body!)
    })

    routes.new().handle('comment', 'getComments', getCommentsSchema, async (req) => {
        return await commentService.getComments(req.body!)
    })
}
