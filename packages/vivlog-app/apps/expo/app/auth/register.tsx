import { RegisterScreen } from 'app/features/auth/register-screen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Register',
        }}
      />
      <RegisterScreen />
    </>
  )
}
