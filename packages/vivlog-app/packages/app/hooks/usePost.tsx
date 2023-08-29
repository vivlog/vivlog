import { useQuery } from '@tanstack/react-query'
import { post } from 'app/services/api'

export const usePost = (id: string | undefined) => {
    const query = useQuery(['post', id], async () => await post.getPost(Number(id)), {
        enabled: !!id,
    })
    return { ...query, post: query.data }
}
