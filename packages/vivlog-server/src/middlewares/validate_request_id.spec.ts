/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import { describe, it } from 'mocha'
import sinon from 'sinon'
import { validateRequestId } from './validate_request_id'

describe('validateRequestId middleware', () => {
  it('should set x-vivlog-request-id header if it is valid', async () => {
    const req = {
      headers: {
        'x-vivlog-request-id': '12345678-1234-4123-8123-123456789012',
      },
    } as any
    const res = {
      header: sinon.stub(),
    } as any

    await validateRequestId(req, res, () => { })

    assert(res.header.calledWith('x-vivlog-request-id', '12345678-1234-4123-8123-123456789012'))
  })

  it('should set x-forwarded-request-id header if it is valid', async () => {
    const req = {
      headers: {
        'x-forwarded-request-id': '12345678-1234-4123-8123-123456789012',
      },
    } as any
    const res = {
      header: sinon.stub(),
    } as any

    await validateRequestId(req, res, () => { })

    assert(res.header.calledWith('x-forwarded-request-id', '12345678-1234-4123-8123-123456789012'))
  })

  it('should not set headers if they are invalid', async () => {
    const req = {
      headers: {
        'x-vivlog-request-id': 'invalid',
        'x-forwarded-request-id': 'also-invalid',
      },
    } as any
    const res = {
      header: sinon.stub(),
    } as any

    await validateRequestId(req, res, () => { })

    assert(res.header.notCalled)
  })
})
