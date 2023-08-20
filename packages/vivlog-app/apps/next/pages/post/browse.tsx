import { PostBrowseScreen } from 'app/features/post/browse-screen'
import Head from 'next/head'

export default function Page() {
    return (
        <>
            <Head>
                <title>Posts</title>
            </Head>
            <PostBrowseScreen />
        </>
    )
}
