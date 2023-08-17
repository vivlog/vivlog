import { Button, Input, Paragraph, Spacer, YStack, useToastController } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useMutation } from '@tanstack/react-query'
import { LoginDto, LoginRes, auth, setToken } from 'app/services/api'
import { setLocalToken, setLocalUser } from 'app/services/local'
import { useFormik } from 'formik'
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
  const toast = useToastController()
  const { replace } = useRouter()
  const loginMutation = useMutation(auth.loginUser)
  const handleSubmit = (values) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        toast.show('Login success!')

        if (!data) {
          console.log('data is null')
          return
        }
        const res = (await data) as unknown as LoginRes
        setLocalToken(res.token)
        setLocalUser(res.user)

        setToken(res.token)
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
    <YStack f={1} jc="center" ai="center" space>
      <Button {...link} icon={ChevronLeft}>
        Go Home
      </Button>
      <Paragraph ta="center" fow="700">Login</Paragraph>
      <LoginForm onSubmit={handleSubmit}></LoginForm>
    </YStack>
  )
}

export default LoginScreen
