import { useQuery } from '@tanstack/react-query'
import { comment } from 'app/services/api'
import { Resource } from 'app/typing/entities'

export const useComments = (resource: Resource | undefined) => {
    const queryKey = ['comments', resource?.type, resource?.uuid]
    const query = useQuery(queryKey, async () => await comment.getComments({ resource: resource! }), {
        enabled: !!resource,
    })
    console.log('comments', query.data?.comments, queryKey)

    return { ...query, comments: query.data?.comments }
}
