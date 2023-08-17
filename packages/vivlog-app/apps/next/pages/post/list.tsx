import { PostListScreen } from 'app/features/post/list-screen'
import Head from 'next/head'

export default function Page() {
    return (
        <>
            <Head>
                <title>Posts</title>
            </Head>
            <PostListScreen />
        </>
    )
}
