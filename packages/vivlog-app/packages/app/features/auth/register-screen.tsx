import { Button, H2, Input, Paragraph, Spacer, YStack, useToastController } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RegisterDto, RegisterRes, auth, setToken } from 'app/services/api'
import { clearLocalToken, setLocalToken, setLocalUser } from 'app/services/local'
import { useFormik } from 'formik'
import { GestureResponderEvent } from 'react-native'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'
import * as yup from 'yup'

type RegisterFormProps = {
  onSubmit: (values: RegisterDto) => void
}

const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const form = useFormik({
    initialValues: {
      username: '',
      password: '',
      email: '',
    },
    validationSchema: yup.object().shape({
      username: yup.string().required().min(4).max(32),
      email: yup.string().required().email(),
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
        placeholder="Email"
        value={form.values.email}
        onChangeText={form.handleChange('email')}>
      </Input>
      {
        form.touched.email && form.errors.email && <Paragraph color="red">{form.errors.email}</Paragraph>
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

      <Button onPress={handlePressSubmit}>Register</Button>
    </YStack>
  )
}
export function RegisterScreen() {
  const link = useLink({
    href: '/auth/login',
  })
  const toast = useToastController()
  const { replace } = useRouter()
  const registerMutation = useMutation<RegisterRes, Error, RegisterDto>(async (dto) => {
    await setToken('')
    await clearLocalToken()
    return await auth.registerUser(dto)
  })
  const queryClient = useQueryClient()
  const handleSubmit = (values) => {
    registerMutation.mutate(values, {
      onSuccess: async (data) => {
        toast.show('Register success!')

        if (!data) {
          console.log('data is null')
          return
        }
        const res = (await data) as unknown as RegisterRes
        await setLocalToken(res.token)
        await setLocalUser(res.user)
        await setToken(res.token)
        await queryClient.invalidateQueries(['user'])
        await queryClient.invalidateQueries(['token'])
        replace('/')
      },
      onError: (err: Error) => {
        toast.show('Register failed!', {
          message: err.message,
        })
      }
    })
  }
  return (
    <YStack f={1} marginTop={16} jc="center" ai="center" space>
      <Button {...link} icon={ChevronLeft}>
        Go Login
      </Button>
      <H2 ta="center" fow="700">Register</H2>
      <RegisterForm onSubmit={handleSubmit}></RegisterForm>
    </YStack>
  )
}

export default RegisterScreen
