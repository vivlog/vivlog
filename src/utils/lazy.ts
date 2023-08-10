export function lazy<T>(target: unknown, key: string, initializer: () => T): void {
    let value: T

    Object.defineProperty(target, key, {
        get() {
            if (value === undefined) {
                value = initializer()
            }
            return value
        },
        set(newValue) {
            value = newValue
        },
        enumerable: true,
        configurable: true
    })
}
