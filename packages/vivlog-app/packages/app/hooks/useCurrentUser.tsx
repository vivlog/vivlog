import { useQuery } from '@tanstack/react-query'
import { LoginRes } from 'app/services/api'
import { fetchLocalUser } from 'app/services/local'

export const useCurrentUser = () => {
    const query = useQuery<null | LoginRes['user']>(['user'], fetchLocalUser)
    return { ...query, user: query.data, isLogin: !!query.data }
}
