import { Button, Image, ListItem, Paragraph, ScrollView, Text, View, YStack } from '@my/ui'
import { ChevronLeft, RefreshCcw } from '@tamagui/lucide-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { post } from 'app/services/api'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'

export function PostBrowsePart() {
    // const tokenQuery = useQuery<null | LoginRes['token']>(['token'], fetchLocalToken)
    const browsePostsQuery = useQuery(['browse_posts'], post.browsePosts)
    if (browsePostsQuery.isError) {
        console.log(browsePostsQuery.error)

    }
    if (browsePostsQuery.isSuccess) {
        console.log(browsePostsQuery.data)
    }

    const { push } = useRouter()

    const handleTouch = () => {
        console.log('touch')
        push('/post/detail/1')
    }

    return (<YStack space>
        {browsePostsQuery.isLoading && <Paragraph>Loading...</Paragraph>}
        {browsePostsQuery.isError && <View><Paragraph>Unable to fetch posts: {(browsePostsQuery.error as Error).message}</Paragraph></View>}
        {browsePostsQuery.isSuccess &&
            browsePostsQuery.data?.posts.map((post) => {
                return <ListItem maw={400} bg="$color1" p="$3" key={post.id} borderRadius="$3" hoverStyle={
                    {
                        bg: '$color3',
                    }
                }>
                    <YStack fs={1}>
                        <View display='flex' flexDirection='row' ai='center' marginBottom={8}>
                            <Image mr={8} borderRadius={99} source={{ uri: post.author?.avatarUrl, width: 32, height: 32 }}></Image>
                            <View display='flex' flexDirection='row'>
                                <Text >{post.author?.username}</Text>
                            </View>
                        </View>
                        <View borderTopWidth={1} paddingTop={8} borderColor="$gray5" onPress={handleTouch} onTouchEnd={handleTouch}>
                            <Paragraph fontSize={13} lineHeight={14}>{post.content}</Paragraph>
                        </View>
                    </YStack>
                </ListItem>
            })
        }
    </YStack >)
}

export function PostBrowseScreen() {
    const link = useLink({
        href: '/',
    })
    const queryClient = useQueryClient()

    const syncMutation = useMutation(post.syncPosts, {
        onSuccess: async () => {
            console.log('sync success')
            await queryClient.invalidateQueries(['browse_posts'])
        }
    })

    const handleSync = () => {
        syncMutation.mutate({})
    }
    return (
        <ScrollView>
            <YStack f={1} jc="center" ai="center" space>
                <Button {...link} icon={ChevronLeft}>
                    Go Home
                </Button>
                <Paragraph ta="center" fow="700">Posts</Paragraph>
                <Button onPress={handleSync} icon={RefreshCcw}>
                    Sync
                </Button>
                <PostBrowsePart></PostBrowsePart>
            </YStack>
        </ScrollView>
    )

}
