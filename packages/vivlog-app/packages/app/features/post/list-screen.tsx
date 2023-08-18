import { Button, Image, Paragraph, Text, View, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useQuery } from '@tanstack/react-query'
import { post } from 'app/services/api'
import { useLink } from 'solito/link'

export function PostListPart() {
    // const tokenQuery = useQuery<null | LoginRes['token']>(['token'], fetchLocalToken)
    const getPostsQuery = useQuery(['posts'], post.getPosts)
    if (getPostsQuery.isError) {
        console.log(getPostsQuery.error)

    }
    if (getPostsQuery.isSuccess) {
        console.log(getPostsQuery.data)
    }
    return (<YStack space>
        {getPostsQuery.isLoading && <Paragraph>Loading...</Paragraph>}
        {getPostsQuery.isError && <View><Paragraph>Unable to fetch posts: {(getPostsQuery.error as Error).message}</Paragraph></View>}
        {getPostsQuery.isSuccess &&
            getPostsQuery.data?.posts.map((post) => {
                return <View maw={400} bg="$gray3" p="$3" key={post.id} borderRadius="$3">
                    <View display='flex' marginBottom={8}>
                        <Image mr={8} borderRadius={99} source={{ uri: 'https://placekitten.com/200/300', width: 32, height: 32 }}></Image>
                        <YStack>
                            <View>
                                <Text flex={1}>{post.author.username}</Text>
                                <Text color="$gray10"> @{post.author.site}</Text>
                            </View>
                            <Text color="$gray11"> {post.author.descritpion ?? 'nothing to say'}</Text>
                        </YStack>
                    </View>
                    <View borderTopWidth={1} borderColor="$gray5">
                        <Paragraph>{post.content}</Paragraph>
                    </View>
                </View>
            })
        }
    </YStack >)
}

export function PostListScreen() {
    const link = useLink({
        href: '/',
    })
    return <YStack f={1} jc="center" ai="center" space>
        <Button {...link} icon={ChevronLeft}>
            Go Home
        </Button>
        <Paragraph ta="center" fow="700">Posts</Paragraph>
        <PostListPart></PostListPart>
    </YStack>
}
