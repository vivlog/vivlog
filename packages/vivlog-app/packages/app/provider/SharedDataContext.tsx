import React, { createContext, useEffect } from 'react'

class ContainerError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ContainerError'
    }
}

class RcContainer {
    private data: {
        [key: string]: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: any
            refCount: number
        } | undefined
    } = {}

    set<T>(name: string, value: T) {
        console.log('set', name)
        console.log(this.data)

        if (this.data[name]) {
            this.data[name]!.value = value
            return
        }
        this.data[name] = {
            value,
            refCount: 0
        }
    }

    ref<T>(name: string): T | undefined {
        if (!this.data[name]) {
            this.data[name] = undefined
            return undefined
        }

        this.data[name]!.refCount++
        console.log('ref', name, this.data[name]!.refCount)
        console.log(this.data)

        return this.data[name]!.value
    }

    unref(name: string) {
        console.log('unref', name)
        if (!this.data[name]) {
            throw new ContainerError('data not found')
        }
        this.data[name]!.refCount--
        if (this.data[name]!.refCount <= 0) {
            delete this.data[name]
            for (const key in this.data) {
                if (undefined === this.data[key]) {
                    delete this.data[key]
                }
            }
            console.log('delete', name)
            console.log(this.data)

            return
        }
        console.log(this.data)
        return
    }

}

export const SharedDataContext = createContext(new RcContainer)

interface SharedDataProviderProps {
    children: React.ReactNode
}

export const SharedDataProvider: React.FC = ({ children }: SharedDataProviderProps) => {
    const container = new RcContainer()
    return <SharedDataContext.Provider value={container}>{children}</SharedDataContext.Provider>
}

export function useSharedData<T>(name?: string, autoUnref = true): [T | undefined, (value: T) => void] {
    if (!name) {
        return [undefined, () => { }]
    }
    const container = React.useContext(SharedDataContext)
    useEffect(() => {
        return () => {
            autoUnref && container.unref(name)
        }
    }, [])
    return [container.ref(name), container.set.bind(container, name)]
}
