import { useQuery } from '@tanstack/react-query'
import { setRouter, setToken } from 'app/services/api'
import { fetchLocalToken } from 'app/services/local'
import { useRouter } from 'solito/router'
export const InitLocal = () => {
    console.log('InitLocal')

    const tokenQuery = useQuery(['token'], fetchLocalToken)
    console.log('InitLocal', tokenQuery.status)
    const router = useRouter()
    if (tokenQuery.data) {
        console.log('InitLocal', 'tokenQuery.data', tokenQuery.data)
        setToken(tokenQuery.data)
        setRouter(router)
    }

    return null
}
