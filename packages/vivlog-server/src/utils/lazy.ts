/**
 * Mark a property as lazy. The property will be initialized when it is first accessed.
 * @param target  the class that contains the property
 * @param key  the name of the property
 * @param initializer  the function that initializes the property
 */
export function lazy<TVal, TTar>(target: TTar, key: keyof typeof target, initializer: () => TVal): void {
    let value: TVal

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

/**
 * load every time when accessed
 */
export function always<TVal, TTar>(target: TTar, key: keyof typeof target, initializer: () => TVal): void {
    let value: TVal

    Object.defineProperty(target, key, {
        get() {
            value = initializer()
            return value
        },
        set(newValue) {
            value = newValue
        },
        enumerable: true,
        configurable: true
    })
}
