
import { CrudCreateEntityScreen } from 'app/features/crud/create-entity-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Crud',
                }}
            />
            <CrudCreateEntityScreen />
        </>
    )
}
