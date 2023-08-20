import { PostBrowseScreen } from 'app/features/post/browse-screen'
import { Stack } from 'expo-router'

export default function Screen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Browse',
                }}
            />
            <PostBrowseScreen />
        </>
    )
}
