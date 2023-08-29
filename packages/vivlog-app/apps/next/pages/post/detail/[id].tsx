import { PostDetailScreen } from 'app/features/post/detail-screen'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <PostDetailScreen />
    </>
  )
}
