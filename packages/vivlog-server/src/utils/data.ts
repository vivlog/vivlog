/* eslint-disable @typescript-eslint/no-explicit-any */
export function omit(obj: any, keys: string[]) {
    const result = Object.create(null)
    for (const key in obj) {
        if (keys.includes(key)) {
            continue
        }
        result[key] = obj[key]
    }
    return result
}

export function parseBool(value: string | undefined) {
    if (value === undefined) {
        return false
    }
    value = value.toLowerCase()
    return value === 'true' || value === '1'
}
