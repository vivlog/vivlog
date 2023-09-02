import { useQuery } from '@tanstack/react-query'
import { post } from 'app/services/api'

export const usePost = (uuid: string | undefined) => {
    const enabled = uuid !== undefined
    console.log('usePost', enabled, uuid)

    const query = useQuery({
        queryKey: ['post', uuid],
        queryFn: async () => await post.getPost(uuid!),
        enabled: enabled,
    })

    return { ...query, post: query.data }
}
