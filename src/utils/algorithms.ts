
export function topoSort<NameType, ItemType>(
    items: ItemType[],
    nameGetter: (idx: number) => NameType,
    dependsGetter: (idx: number) => NameType[]
): number[] {

    const nameToIndex = new Map()
    for (let i = 0; i < items.length; i++) {
        nameToIndex.set(nameGetter(i), i)
    }

    const indegree = new Array(items.length).fill(0)
    for (let i = 0; i < items.length; i++) {
        for (const dep of dependsGetter(i)) {
            const dep_idx = nameToIndex.get(dep)
            if (dep_idx === undefined) {
                throw new Error(`Cannot find dependency item ${dep}`)
            }
            indegree[dep_idx]++
        }
    }

    const queue: number[] = []
    for (let i = 0; i < indegree.length; i++) {
        if (indegree[i] === 0) {
            queue.push(i)
        }
    }

    const result: number[] = []
    while (queue.length > 0) {
        const i = queue.shift()!
        result.push(i)
        for (const dep of dependsGetter(i)) {
            const dep_idx = nameToIndex.get(dep)!
            indegree[dep_idx]--
            if (indegree[dep_idx] === 0) {
                queue.push(dep_idx)
            }
        }
    }

    if (result.length !== items.length) {
        throw new Error('Graph has at least one cycle')
    }

    return result
}
