/* eslint-disable @typescript-eslint/no-explicit-any */
export class Container {
    items: Map<any, any>

    constructor() {
        this.items = new Map()
    }
    register<T>(token: string, item: T) {
        if (this.items.has(token)) {
            throw new Error(`Key ${token} already registered`)
        }
        this.items.set(token, item)
    }
    resolve<T>(key: any): T {
        const r = this.items.get(key)
        if (!r) {
            let msg
            if (key.name) {
                msg = key.name
            } else {
                msg = key
            }
            throw new Error(`Cannot resolve ${msg}`)
        }
        return r as T
    }
}
