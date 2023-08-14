import { topoSort } from './algorithms'

import * as assert from 'assert'

describe('topoSort', () => {

  it('should sort nodes with no dependencies', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = topoSort(items, i => items[i].id, () => [])
    assert.deepEqual(result, [0, 1, 2])
  })

  it('should handle dependencies', () => {
    const items = [
      { id: 'a' },
      { id: 'b', deps: ['a'] },
      { id: 'c', deps: ['a'] },
      { id: 'd', deps: ['b', 'c'] }
    ]
    /*
    a -> b -> d
     \-> c -> d
    */

    const result = topoSort(items, i => items[i].id, i => items[i].deps || [])
    assert.deepEqual(result, [3, 1, 2, 0])
  })

  it('should handle chain dependencies', () => {
    const items = [
      { id: 'a' },
      { id: 'b', deps: ['a'] },
      { id: 'c', deps: ['b'] },
      { id: 'd', deps: ['c'] }
    ]

    const result = topoSort(items, i => items[i].id, i => items[i].deps || [])

    assert.deepEqual(result, [3, 2, 1, 0])
  })

  it('should throw error on cycle', () => {
    const items = [
      { id: 'a', deps: ['b'] },
      { id: 'b', deps: ['a'] },
    ]

    assert.throws(() => {
      topoSort(items, i => items[i].id, i => items[i].deps || [])
    }, /cycle/)
  })

})
