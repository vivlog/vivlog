import { UserMyProfileScreen } from 'app/features/user/my-profile-screen'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>My Profile</title>
      </Head>
      <UserMyProfileScreen />
    </>
  )
}
