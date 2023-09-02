
                import { AdminOverviewScreen } from 'app/features/admin/overview-screen'
                import { Stack } from 'expo-router'
                
                export default function Screen() {
                    return (
                        <>
                        <Stack.Screen
                            options={{
                            title: 'Admin',
                            }}
                        />
                        <AdminOverviewScreen />
                        </>
                    )
                }
            