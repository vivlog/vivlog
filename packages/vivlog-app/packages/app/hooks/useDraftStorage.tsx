import { useAsyncStorage } from '@react-native-async-storage/async-storage'
import { prefix } from 'app/services/local'

export interface UseDraftStorageProps<T> {
    key: string
    defaultValue?: T
}

export function useDraftStorage<T>({ key, defaultValue }: UseDraftStorageProps<T>) {
    const { getItem, setItem, removeItem } = useAsyncStorage(`${prefix}${key}`)

    const get = async () => {
        const item = await getItem()
        return (item !== null ? JSON.parse(item) : defaultValue) as T | undefined
    }



    const set = async (value: T) => {
        await setItem(JSON.stringify(value))
    }

    const remove = async () => {
        await removeItem()
    }

    return { get, set, remove }
}
