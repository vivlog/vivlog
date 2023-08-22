import { assert } from 'console'
import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Role, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreatePostDto, browsePostsSchema, createPostSchema, deletePostSchema, getPostSchema, getPostsSchema, syncPostsSchema, updatePostSchema } from './entities'
import { PostService } from './service'


export function createPostApi(host: Host) {
    const postService = host.container.resolve(PostService.name) as PostService
    const userService = host.container.resolve(UserService.name) as UserService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const routes = host.container.resolve('routes') as RouteHelper
    const cachedValues = {
        'site': undefined
    } as { [key: string]: Promise<string> | undefined }

    lazy(cachedValues, 'site', async () => {
        const index = { group: Settings.System._group, name: Settings.System.site }
        return (await settingService.getItem(index))?.value ?? ''
    })

    routes.new().minRole(Role.Author)
        .handle('post', 'createPost', createPostSchema, async (req) => {
            const dto = req.body! as CreatePostDto
            if (!req.agent) {
                throw new Error('user is not defined')
            }
            if (!req.agent.id) {
                throw new Error('user id is not defined')
            }
            const user = await userService.getUser({ id: parseInt(req.agent.id) })
            assert(user !== null)
            dto.site = await cachedValues['site'] as string
            assert(dto.site)
            dto.author_site = await cachedValues['site'] as string
            assert(dto.author_site)
            dto.author_uuid = user!.uuid
            dto.attachment_vids = []
            dto.slug = dto.slug ?? ''
            dto.custom = dto.custom ?? {}
            return await postService.createPost(dto)
        })

    routes.new().minRole(Role.Author)
        .handle('post', 'updatePost', updatePostSchema, async (req) => {
            return await postService.updatePost(req.body!)
        })

    routes.new().minRole(Role.Author)
        .handle('post', 'deletePost', deletePostSchema, async (req) => {
            return await postService.deletePost(req.body!)
        })

    routes.new()
        .handle('post', 'getPost', getPostSchema, async (req) => {
            return await postService.getPost(req.body!)
        })

    routes.new()
        .handle('post', 'getPosts', getPostsSchema, async (req) => {
            return await postService.getPosts(req.body!)
        })

    routes.new().minRole(Role.Reader)
        .handle('post', 'browsePosts', browsePostsSchema, async (req) => {
            return await postService.browsePosts(req.body!)
        })

    routes.new()
        .handle('post', 'syncPosts', syncPostsSchema, async (req) => {
            return await postService.syncPosts(req.body!)
        })
}
