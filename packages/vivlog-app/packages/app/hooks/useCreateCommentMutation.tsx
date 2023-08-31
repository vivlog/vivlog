import { useMutation, useQueryClient } from '@tanstack/react-query'
import { comment } from 'app/services/api'
import { Resource } from 'app/typing/entities'

export function useCreateCommentMutation(resource: Resource) {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: comment.createComment,
        onSuccess: async () => {

            const queryKey = ['comments', resource?.type, resource?.uuid]
            await queryClient.invalidateQueries({
                queryKey
            })
            console.log('create comment success', queryKey)
        }
    })

    return mutation
}
