
import { AdminSystemScreen } from 'app/features/admin/system-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Admin',
                }}
            />
            <AdminSystemScreen />
        </>
    )
}
