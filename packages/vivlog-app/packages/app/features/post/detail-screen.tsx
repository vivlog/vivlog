import { Button, Image, Paragraph, Text, View, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useComment } from 'app/hooks/useComment'
import { usePost } from 'app/hooks/usePost'
import React from 'react'
import { createParam } from 'solito'
import { useLink } from 'solito/link'

const { useParam } = createParam<{ id: string }>()

export function PostDetailScreen() {
  const [id] = useParam('id')
  const link = useLink({
    href: '/',
  })
  const postQuery = usePost(id)
  const commentQuery = useComment(postQuery.post)
  return (
    <YStack f={1} jc="center" ai="center" space ml={4}>
      <Button {...link} icon={ChevronLeft}>
        Go Home
      </Button>
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
          !!postQuery.post && id && <View>
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

        <Text mt={8} mb={4} fontSize={20} fontWeight={'bold'}>Comments</Text>
        {
          commentQuery.isLoading && <Paragraph>Loading...</Paragraph>
        }
        {
          commentQuery.isError && <Paragraph>Unable to fetch comments: {(commentQuery.error as Error).message}</Paragraph>
        }
        {
          !!commentQuery.comment && <View>
            <View display='flex' marginBottom={8}>
              <Image mr={8} borderRadius={99} source={{ uri: 'https://placekitten.com/200/300', width: 32, height: 32 }}></Image>
              <YStack>
                <View>
                  <Text flex={1}>{commentQuery.comment.author?.username}</Text>
                  <Text color="$gray10"> @{commentQuery.comment.author?.site}</Text>
                </View>
                <Text color="$gray11"> {commentQuery.comment.author?.description ?? 'nothing to say'}</Text>
              </YStack>
            </View>
            <View borderTopWidth={1} borderColor="$gray5">
              <Paragraph>{commentQuery.comment.content}</Paragraph>
            </View>
          </View>
        }
      </View>
    </YStack>
  )
}
