import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:9000'
})

export interface RegisterDto {
    username: string
    password: string
}

export async function registerUser(payload: RegisterDto) {
    return await axiosInstance.post('user/registerUser', payload)
}
