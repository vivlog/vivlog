import { Button, H2, H3, Image, Paragraph, Spacer, Text, View, YStack } from '@my/ui'
import { ChevronLeft, Home } from '@tamagui/lucide-icons'
import CommentForm from 'app/components/CommentForm'
import { useComments } from 'app/hooks/useComments'
import { usePost } from 'app/hooks/usePost'
import React from 'react'
import { createParam } from 'solito'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'

const { useParam } = createParam<{ id: string }>()

export function PostDetailScreen() {
  const [uuid] = useParam('id')
  const linkToHome = useLink({
    href: '/',
  })
  const { back } = useRouter()
  const postQuery = usePost(uuid)
  const resource = {
    site: postQuery.post?.site ?? '',
    type: 'post',
    uuid: postQuery.post?.uuid?.toString() ?? '',
  }
  console.log('useComments', resource)

  const commentsQuery = useComments(resource)

  return (
    <YStack f={1} jc="center" ai="center" space ml={4}>
      <H2 ta="center" fow="700">Post</H2>

      <View display='flex'>
        <Button onPress={() => back()} icon={ChevronLeft}>
          Go Back
        </Button>
        <Button {...linkToHome} icon={Home}>
          Go Home
        </Button>
      </View>
      <View
        maw={800}
      >
        {
          postQuery.isLoading && <Paragraph>Loading...</Paragraph>
        }
        {
          postQuery.isError && <Paragraph>Unable to fetch post: {(postQuery.error as Error).message}</Paragraph>
        }
        {
          !!postQuery.post && uuid && <View>
            <View display='flex' marginBottom={8}>
              <Image mr={8} borderRadius={99} source={{ uri: 'https://placekitten.com/200/300', width: 32, height: 32 }}></Image>
              <YStack>
                <View>
                  <Text flex={1}>{postQuery.post.author?.username}</Text>
                  <Text color="$gray10"> @{postQuery.post.author?.site}</Text>
                </View>
                <Text color="$gray11"> {postQuery.post.author?.description ?? 'nothing to say'}</Text>
              </YStack>
            </View>
            <View borderTopWidth={1} borderColor="$gray5">
              <Paragraph>{postQuery.post.content}</Paragraph>
            </View>
          </View>
        }
        <Spacer />
        <View marginTop={16} marginBottom={16}>
          <H3 >Comments</H3>
        </View>
        {
          commentsQuery.isLoading && <Paragraph>Loading...</Paragraph>
        }
        {
          commentsQuery.isError && <Paragraph>Unable to fetch comments: {(commentsQuery.error as Error).message}</Paragraph>
        }
        {
          commentsQuery.comments ? commentsQuery.comments.map((comment) => {
            return <View key={comment.uuid} marginBottom={24}>
              <View display='flex' ai="center" marginBottom={8}>
                <Image mr={8} borderRadius={99} source={{ uri: 'https://placekitten.com/200/300', width: 32, height: 32 }}></Image>
                <YStack>
                  <View>
                    <Text flex={1}>{comment.agent?.username}</Text>
                    <Text color="$gray10"> @{comment.agent?.site}</Text>
                  </View>
                </YStack>
              </View>
              <View borderTopWidth={1} borderColor="$gray5">
                <Paragraph>{comment.content}</Paragraph>
              </View>
            </View>
          })
            :
            <Paragraph>No comments</Paragraph>
        }
        <CommentForm resource={resource}></CommentForm>
      </View>
    </YStack>
  )
}
