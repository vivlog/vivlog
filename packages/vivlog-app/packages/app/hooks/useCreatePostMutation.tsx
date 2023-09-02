import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from 'app/services/api'

export function useCreatePostMutation() {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: post.createPost,
        onSuccess: async () => {
            await queryClient.invalidateQueries(['posts'])
        },
    })

    return mutation
}
