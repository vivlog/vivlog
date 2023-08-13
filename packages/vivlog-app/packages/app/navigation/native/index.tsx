import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { UserLoginScreen } from 'app/features/auth/login-screen'
import UserRegisterScreen from 'app/features/auth/register-screen'
import { HomeScreen } from '../../features/home/screen'
import { UserDetailScreen } from '../../features/user/detail-screen'

const Stack = createNativeStackNavigator<{
  home: undefined
  'user-detail': {
    id: string
  },
  'auth-login': undefined
  'auth-register': undefined
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{
          title: 'User',
        }}
      />
      <Stack.Screen
        name="auth-login"
        component={UserLoginScreen}
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="auth-register"
        component={UserRegisterScreen}
        options={{
          title: 'Register',
        }}
      />
    </Stack.Navigator>
  )
}
