import { assert } from 'console'
import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Roles, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreatePostDto, createPostSchema, deletePostSchema, getPostSchema, getPostsSchema, updatePostSchema } from './entities'
import { PostService } from './service'


export function createPostApi(host: Host) {
    const postService = host.container.resolve(PostService.name) as PostService
    const userService = host.container.resolve(UserService.name) as UserService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const routes = host.container.resolve('routes') as RouteHelper
    const cachedValues = {
        'site': null
    } as { [key: string]: Promise<string> | null }

    lazy(cachedValues, 'site', async () => {
        const index = { group: Settings.System._group, name: Settings.System.site }
        return (await settingService.getItem(index))?.value ?? ''
    })

    routes.new().minRole(Roles.Author).handle('post', 'createPost', createPostSchema, async (req) => {
        const dto = req.body! as CreatePostDto
        assert(req.user?.id, 'user id is not defined')
        const user = await userService.getUser({ id: parseInt(req.user!.id) })
        assert(user !== null)
        dto.site = await cachedValues['site'] as string
        assert(dto.site !== '')
        dto.author_site = await cachedValues['site'] as string
        dto.author_uuid = user!.uuid
        dto.attachment_vids = []
        dto.slug = dto.slug ?? ''
        dto.custom = dto.custom ?? {}
        return await postService.createPost(dto)
    })

    routes.new().minRole(Roles.Author).handle('post', 'updatePost', updatePostSchema, async (req) => {
        return await postService.updatePost(req.body!)
    })

    routes.new().minRole(Roles.Author).handle('post', 'deletePost', deletePostSchema, async (req) => {
        return await postService.deletePost(req.body!)
    })

    routes.new().handle('post', 'getPost', getPostSchema, async (req) => {
        return await postService.getPost(req.body!)
    })

    routes.new().handle('post', 'getPosts', getPostsSchema, async (req) => {
        return await postService.getPosts(req.body!)
    })
}