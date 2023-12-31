import { Button, H2, Input, Paragraph, Spacer, View, YStack, useToastController } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLogoutMutation } from 'app/hooks/useLogoutMutation'
import { LoginDto, LoginRes, auth, setToken } from 'app/services/api'
import { clearLocalToken, setLocalToken, setLocalUser } from 'app/services/local'
import { useFormik } from 'formik'
import { useEffect } from 'react'
import { GestureResponderEvent } from 'react-native'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'
import * as yup from 'yup'

type LoginFormProps = {
  onSubmit: (values: LoginDto) => void
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      username: yup.string().required().min(4).max(32),
      password: yup.string().required().min(8).max(32),
    }),
    onSubmit(values) {
      onSubmit(values)
    },
  })

  const logoutMutation = useLogoutMutation()

  useEffect(() => {
    logoutMutation.mutate()
  }, [])

  const handlePressSubmit = (e: GestureResponderEvent) => {
    e.preventDefault()
    form.handleSubmit()
  }
  return (
    <YStack>
      <Input
        placeholder="Username"
        value={form.values.username}
        onChangeText={form.handleChange('username')}>
      </Input>
      {
        form.touched.username && form.errors.username && <Paragraph color="red">{form.errors.username}</Paragraph>
      }
      <Spacer />
      <Input
        placeholder="Password"
        value={form.values.password}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === 'Enter') {
            form.handleSubmit()
          }
        }
        }
        onChangeText={form.handleChange('password')}>
      </Input>
      {
        form.touched.password && form.errors.password && <Paragraph color="red">{form.errors.password}</Paragraph>
      }

      <Spacer />

      <Button onPress={handlePressSubmit}>Login</Button>
    </YStack>
  )
}
export function LoginScreen() {
  const link = useLink({
    href: '/',
  })

  const registerLink = useLink({ href: '/auth/register' })
  const toast = useToastController()
  const { replace } = useRouter()
  const loginMutation = useMutation<LoginRes, Error, LoginDto>(async (dto) => {
    await setToken('')
    await clearLocalToken()
    return await auth.loginUser(dto, {
      headers: {
        'authorization': '',
      }
    })
  })
  const queryClient = useQueryClient()
  const handleSubmit = (values) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        toast.show('Login success!')

        if (!data) {
          console.log('data is null')
          return
        }
        const res = (await data) as unknown as LoginRes
        await setLocalToken(res.token)
        await setLocalUser(res.user)

        await setToken(res.token)
        await queryClient.invalidateQueries(['user'])
        await queryClient.invalidateQueries(['token'])
        replace('/')
      },
      onError: (err: Error) => {
        console.log('err', err)
        toast.show('Login failed!', {
          message: err.message,
        })
      }
    })
  }
  return (
    <YStack f={1} marginTop={16} jc="center" ai="center" space>
      <View display='flex' gap={16}>
        <Button {...link} icon={ChevronLeft}>
          Go Home
        </Button>
        <Button {...registerLink}>Register</Button>

      </View>
      <H2 ta="center" fow="700">Login</H2>
      <LoginForm onSubmit={handleSubmit}></LoginForm>
    </YStack>
  )
}

export default LoginScreen
