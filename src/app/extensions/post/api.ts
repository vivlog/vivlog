import { Host } from '../../../host/types'
import { RouteHelper } from '../../helper/route_helper'
import { createPostSchema, deletePostSchema, getPostSchema, getPostsSchema, updatePostSchema } from './entities'
import { PostService } from './service'


export function createPostApi(host: Host) {
    const postService = host.container.resolve(PostService.name) as PostService
    const routes = host.container.resolve('routes') as RouteHelper

    routes.new().handle('post', 'createPost', createPostSchema, async (req) => {
        return await postService.createPost(req.body!)
    })

    routes.new().handle('post', 'updatePost', updatePostSchema, async (req) => {
        return await postService.updatePost(req.body!)
    })

    routes.new().handle('post', 'deletePost', deletePostSchema, async (req) => {
        return await postService.deletePost(req.body!)
    })

    routes.new().handle('post', 'getPost', getPostSchema, async (req) => {
        return await postService.getPost(req.body!)
    })

    routes.new().handle('post', 'getPosts', getPostsSchema, async (req) => {
        return await postService.getPosts(req.body!)
    })
}
