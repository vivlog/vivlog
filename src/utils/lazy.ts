/**
 * Mark a property as lazy. The property will be initialized when it is first accessed.
 * @param target  the class that contains the property
 * @param key  the name of the property
 * @param initializer  the function that initializes the property
 */
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
