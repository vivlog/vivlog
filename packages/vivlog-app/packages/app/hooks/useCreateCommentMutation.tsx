import { useMutation, useQueryClient } from '@tanstack/react-query'
import { comment } from 'app/services/api'
import { CreateCommentDto, GuestInfo, Resource, createGuestHeader } from 'app/typing/entities'

export function useCreateCommentMutation(resource: Resource | undefined) {
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: ({ dto, guestInfo }: { dto: CreateCommentDto; guestInfo?: GuestInfo }) => {
            return comment.createComment(dto, guestInfo ? {
                headers: createGuestHeader(guestInfo)
            } : {})
        },
        onSuccess: async () => {
            const queryKey = ['comments', resource?.type, resource?.uuid]
            await queryClient.invalidateQueries(queryKey)
        },
    })

    return mutation
}
