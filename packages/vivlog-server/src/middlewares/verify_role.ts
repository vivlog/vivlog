import { Middleware, UnauthorizedError } from '../host/types'

const verifier: Record<string, Middleware> = {}
// 该方法用于检查用户角色是否满足要求
export const verifyRole: (allowRoles: string[]) => Middleware = (allowRoles: string[]) => {
    const cacheKey = allowRoles.join(',')
    if (verifier[cacheKey]) {
        return verifier[cacheKey]
    }
    verifier[cacheKey] = async (req) => {
        const { agent } = req
        if (!agent) {
            throw new UnauthorizedError('not logged in')
        }

        if (allowRoles.length > 0) {
            if (!allowRoles.includes(agent.role)) {
                throw new Error('Forbidden')
            }
        }
    }

    return verifier[cacheKey]
}
