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

export function base64Encode<T>(input: T): string {
    const isStr = typeof input === 'string'
    const str = isStr ? input as string : JSON.stringify(input)
    return Buffer.from(str).toString('base64')
}

export function base64Decode<T>(str: string, isObject = true): T | null {
    let decoded: string
    try {
        decoded = Buffer.from(str, 'base64').toString()
    } catch (error) {
        return null
    }

    if (!isObject) {
        return decoded as T
    }

    try {
        return JSON.parse(decoded) as T
    }
    catch (error) {
        return null
    }
}

export function removePrefix(str: string, prefix: string) {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    }
    return str
}
