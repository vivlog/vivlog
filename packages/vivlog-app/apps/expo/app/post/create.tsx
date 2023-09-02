
import { PostCreateScreen } from 'app/features/post/create-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Post',
                }}
            />
            <PostCreateScreen />
        </>
    )
}
