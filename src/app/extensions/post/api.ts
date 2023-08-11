import { Host } from '../../../host/types'
import { createPostSchema, deletePostSchema, getPostSchema, getPostsSchema, updatePostSchema } from './entities'
import { PostService } from './service'


export function createPostApi(host: Host) {
    const postService = host.container.resolve(PostService.name) as PostService

    host.addRoute('post', 'createPost', createPostSchema, async (req) => {
        return await postService.createPost(req.body)
    })

    host.addRoute('post', 'updatePost', updatePostSchema, async (req) => {
        return await postService.updatePost(req.body)
    })

    host.addRoute('post', 'deletePost', deletePostSchema, async (req) => {
        return await postService.deletePost(req.body)
    })

    host.addRoute('post', 'getPost', getPostSchema, async (req) => {
        return await postService.getPost(req.body)
    })

    host.addRoute('post', 'getPosts', getPostsSchema, async (req) => {
        return await postService.getPosts(req.body)
    })
}
