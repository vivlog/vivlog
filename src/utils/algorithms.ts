
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
            indegree[nameToIndex.get(dep)]++
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
            indegree[nameToIndex.get(dep)]--
            if (indegree[nameToIndex.get(dep)] === 0) {
                queue.push(nameToIndex.get(dep))
            }
        }
    }

    if (result.length !== items.length) {
        throw new Error('Graph has at least one cycle')
    }

    return result
}
