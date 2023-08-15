import { useQuery } from '@tanstack/react-query'
import { setToken } from 'app/services/api'
import { fetchLocalToken } from 'app/services/local'
export const InitLocal = ()=> {
    console.log('InitLocal')

    const tokenQuery = useQuery(['token'], fetchLocalToken)
    console.log(tokenQuery.status)

    if (tokenQuery.data) {
        console.log('tokenQuery.data', tokenQuery.data)
        setToken(tokenQuery.data)
    }
    return null
}
