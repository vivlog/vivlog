
import { AdminUserScreen } from 'app/features/admin/user-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Admin',
                }}
            />
            <AdminUserScreen />
        </>
    )
}
