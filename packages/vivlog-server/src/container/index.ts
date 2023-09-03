/* eslint-disable @typescript-eslint/no-explicit-any */
export class DefaultContainer {
    items: Map<any, any>

    constructor() {
        this.items = new Map()
    }
    register<T>(token: string, item: T) {
        console.log(`register ${token}`)

        if (this.items.has(token)) {
            throw new Error(`Key ${token} already registered`)
        }
        this.items.set(token, item)
    }
    resolve<T>(key: any): T {
        const r = this.items.get(key)
        if (r === undefined) {
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
    mutate<T>(token: any, f: (item: T) => T, default_?: any): void {
        let r = this.items.get(token)
        if (r === undefined) {
            if (default_ === undefined) {
                throw new Error(`Cannot resolve ${token}`)
            }
            r = f(default_)
            this.register(token, r)
            return
        }
        const newItem = f(r as T)
        this.items.set(token, newItem)
    }
}

export interface Container {
    register<T>(token: string, item: T): void
    resolve<T>(key: any): T
}
