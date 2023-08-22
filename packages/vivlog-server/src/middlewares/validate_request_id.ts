import { Middleware } from '../host/types'

const re = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i

export const validateRequestId: Middleware = async (req, res) => {
  const requestId = req.headers['x-vivlog-request-id']
  if (requestId && typeof requestId === 'string' && re.test(requestId)) {
    res.header('x-vivlog-request-id', requestId)
  }

  const forwardedRequestId = req.headers['x-forwarded-request-id']
  if (forwardedRequestId && typeof forwardedRequestId === 'string' && re.test(forwardedRequestId)) {
    res.header('x-forwarded-request-id', forwardedRequestId)
  }
}
