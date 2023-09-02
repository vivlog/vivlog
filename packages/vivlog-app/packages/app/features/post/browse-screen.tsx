import { Button, H2, Image, ListItem, Paragraph, ScrollView, Text, View, YStack } from '@my/ui'
import { ChevronLeft, RefreshCcw } from '@tamagui/lucide-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { myShadows } from 'app/presets/shadow'
import { post } from 'app/services/api'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'

export function PostBrowsePart() {
    // const tokenQuery = useQuery<null | LoginRes['token']>(['token'], fetchLocalToken)
    const browsePostsQuery = useQuery(['posts', 'browse'], post.browsePosts)
    if (browsePostsQuery.isError) {
        console.log(browsePostsQuery.error)

    }
    if (browsePostsQuery.isSuccess) {
        console.log(browsePostsQuery.data)
    }

    const { push } = useRouter()

    const handleTouch = (uuid: string) => {
        push('/post/detail/' + uuid)
    }

    return (<YStack space>
        {browsePostsQuery.isLoading && <Paragraph>Loading...</Paragraph>}
        {browsePostsQuery.isError && <View><Paragraph>Unable to fetch posts: {(browsePostsQuery.error as Error).message}</Paragraph></View>}
        {browsePostsQuery.isSuccess &&
            browsePostsQuery.data?.posts.map((post) => {
                return <ListItem maw={800} bg="$color1" p="$3" key={post.uuid} borderRadius="$3" hoverStyle={
                    myShadows.medium
                }
                    pressStyle={
                        {
                            ...myShadows.large,
                            marginTop: 4,
                        }
                    }>
                    <YStack fs={1}>
                        <View display='flex' flexDirection='row' ai='center' marginBottom={8}>
                            <Image mr={8} borderRadius={99} source={{ uri: post.author?.avatarUrl, width: 32, height: 32 }}></Image>
                            <View display='flex' flexDirection='row'>
                                <Text >{post.author?.username}</Text>
                            </View>
                        </View>
                        <View borderTopWidth={1} paddingTop={8} borderColor="$gray5" onPress={() => handleTouch(post.uuid)}>
                            <Paragraph  >{post.content}</Paragraph>
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
            await queryClient.invalidateQueries(['posts', 'browse'])
        }
    })

    const handleSync = () => {
        syncMutation.mutate({})
    }
    return (
        <ScrollView>
            <YStack f={1} marginTop={16} jc="center" ai="center" space>

                <H2 ta="center" fow="700">Posts</H2>
                <View display='flex'>
                    <Button {...link} icon={ChevronLeft}>
                        Go Home
                    </Button>
                    <Button onPress={handleSync} icon={RefreshCcw}>
                        Sync
                    </Button>
                </View>
                <PostBrowsePart></PostBrowsePart>
            </YStack>
        </ScrollView>
    )

}
