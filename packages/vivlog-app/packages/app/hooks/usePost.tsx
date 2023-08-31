import { useQuery } from '@tanstack/react-query'
import { post } from 'app/services/api'

export const usePost = (uuid: string | undefined) => {
    const query = useQuery(['post', uuid], async () => await post.getPost(uuid!), {
        enabled: !!uuid,
    })
    return { ...query, post: query.data }
}
