import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'

interface PersistValueProps<TValue> {
    persistKey: string
    children: React.ReactElement
    onChange?: (value: TValue) => void
    defaultValue?: TValue
    loadingRender?: React.ReactElement
}

function PersistValue<TValue>({ persistKey, children, onChange, defaultValue, loadingRender }: PersistValueProps<TValue>): React.ReactElement {
    const [resolvedValue, setResolvedValue] = useState<TValue | undefined>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(persistKey)
                const value = storedValue ? JSON.parse(storedValue) : undefined
                setResolvedValue(value ?? defaultValue)
            } catch (error) {
                console.error('PersistValue', 'Error retrieving stored value:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleChange = (value: TValue) => {
        AsyncStorage.setItem(persistKey, JSON.stringify(value))
        onChange?.(value)
    }

    if (isLoading) {
        // 可以根据需要显示加载状态
        if (loadingRender) {
            return loadingRender
        }
        return <div>Loading...</div>
    }

    const clonedElement = React.cloneElement(children, {
        ...children.props,
        onChange: handleChange,
        defaultValue: resolvedValue ?? children.props.defaultValue
    })

    return clonedElement
}

export default PersistValue
