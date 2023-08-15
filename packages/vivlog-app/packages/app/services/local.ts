import AsyncStorage from '@react-native-async-storage/async-storage'
import { LoginRes } from './api'

const prefix = '@vivlog:'

export async function fetchLocalToken() {
    console.log('fetchLocalToken')
    return await AsyncStorage.getItem(prefix + 'token')
}


export async function fetchLocalUser(): Promise<null | LoginRes['user']> {
    console.log('fetchLocalUser')
    const user = await AsyncStorage.getItem(prefix + 'user')
    if (!user) {
        return null
    }
    return JSON.parse(user) as LoginRes['user']
}

export async function setLocalToken(token: string) {
    console.log('setLocalToken', token)
    await AsyncStorage.setItem(prefix + 'token', token)
}

export async function setLocalUser(user: LoginRes['user']) {
    console.log('setLocalUser', user)
    await AsyncStorage.setItem(prefix + 'user', JSON.stringify(user))
}

export async function clearLocalToken() {
    console.log('clearLocalToken')
    await AsyncStorage.removeItem(prefix + 'token')
}

export async function clearLocalUser() {
    console.log('clearLocalUser')
    await AsyncStorage.removeItem(prefix + 'user')
}
