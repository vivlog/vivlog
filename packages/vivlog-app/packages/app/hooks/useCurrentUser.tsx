import { useQuery } from '@tanstack/react-query'
import { LoginRes, router } from 'app/services/api'
import { fetchLocalUser } from 'app/services/local'

export type UseCurrentUserProps = {
    redirect?: boolean // default: false, if true, redirect to login page if not logged in
}

export const useCurrentUser = (props?: UseCurrentUserProps) => {
    const redirect = props?.redirect ?? false

    const query = useQuery<null | LoginRes['user']>(['user'], fetchLocalUser)
    if (query.data === null && redirect) {
        console.log('redirect to login', router)

        router?.push('/auth/login')
    }
    return { ...query, user: query.data, isLogin: !!query.data }
}
