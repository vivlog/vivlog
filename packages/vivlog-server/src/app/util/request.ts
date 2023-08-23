/* eslint-disable @typescript-eslint/no-explicit-any */
export function mustDefined(value: any) {
    if (value === undefined) {
        throw new Error('must be defined')
    }
    return value
}
