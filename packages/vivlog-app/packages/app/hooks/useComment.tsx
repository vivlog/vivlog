import { useQuery } from '@tanstack/react-query'
import { comment } from 'app/services/api'
import { Resource } from 'app/typing/entities'

export const useComment = (resource: Resource | undefined) => {
    const query = useQuery(['comment', resource?.type, resource?.uuid], async () => await comment.getComment(resource!), {
        enabled: !!resource,
    })
    return { ...query, comment: query.data }
}
