import { RegisterScreen } from 'app/features/auth/register-screen'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Register</title>
      </Head>
      <RegisterScreen />
    </>
  )
}
