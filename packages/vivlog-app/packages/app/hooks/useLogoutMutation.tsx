import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearLocalToken, clearLocalUser } from 'app/services/local'

export const useLogoutMutation = () => {
    const queryClient = useQueryClient()
    return useMutation(
        () => Promise.all([clearLocalToken(), clearLocalUser()]),
        {
            onSuccess: async () => await Promise.all([
                await queryClient.invalidateQueries({ queryKey: ['user'] }),
                await queryClient.invalidateQueries({ queryKey: ['token'] })
            ])
        })
}
