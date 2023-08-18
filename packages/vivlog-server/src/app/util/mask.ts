export function mask<T>(obj: T | undefined, fields: (keyof T)[]): T | undefined {
    if (!obj) return obj
    const newObj = { ...obj }
    fields.forEach(field => {
        delete newObj[field]
    })
    return newObj
}

export function maskAll<T>(objs: (T | undefined)[], fields: (keyof T)[]): (T | undefined)[] {
    if (!objs) return objs
    if (objs.length === 0) return objs
    const r = objs.map(ent => mask(ent, fields))
    return r
}

export function maskProp<O, T>(obj: O, prop: keyof O, fields: (keyof T)[]) {
    if (!obj) return
    // if objs don't have prop, return original objs
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) return obj
    const newObj = { ...obj }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newObj[prop] = mask<T>(newObj[prop] as T | undefined, fields) as any
    return newObj
}

export function maskAllProp<O, T>(objs: O[], prop: keyof O, fields: (keyof T)[]) {
    if (!objs) return objs
    if (objs.length === 0) return objs
    const r = objs.map(ent => maskProp<O, T>(ent, prop, fields))
    return r
}

export class Masker<T> {
    objs: T[]

    constructor(objs: T[]) {
        this.objs = objs
    }

    static of<T>(objs: T[]) {
        return new Masker(objs)
    }

    mask(prop: string, fields: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.objs = maskAllProp(this.objs, prop as any, fields) as any
        return this
    }

    get() {
        return this.objs
    }
}
