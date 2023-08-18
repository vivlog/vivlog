export function parseBool(value: string | undefined) {
    if (value === undefined) {
        return false
    }
    value = value.toLowerCase()
    return value === 'true' || value === '1'
}

export function toRepeat<T>(times: number, func: T): T[] {
    const ret = [] as T[]
    for (let i = 0; i < times; i++) {
        ret.push(func)
    }
    return ret
}

export function toRepeatAsync<T>(times: number, func: () => Promise<T>): Promise<T>[] {

    const ret = []

    for (let i = 0; i < times; i++) {
        ret.push(func())
    }

    return ret
}
