import { AvatarBox, Button, H2, Text, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useCurrentUser } from 'app/hooks/useCurrentUser'
import { useLogoutMutation } from 'app/hooks/useLogoutMutation'
import React from 'react'
import { useLink } from 'solito/link'


export function UserMyProfileScreen() {
  const link = useLink({
    href: '/',
  })
  const userQuery = useCurrentUser({ redirect: true })
  const logoutMutation = useLogoutMutation()

  return (
    <YStack f={1} marginTop={16} jc="center" ai="center" space>
      <Button {...link} icon={ChevronLeft}>
        Go Home
      </Button>
      <H2 >Profile</H2>
      <AvatarBox uri={userQuery.data?.avatarUrl} size={64}></AvatarBox>
      <Text> {userQuery.data?.username}</Text>
      <Text> {userQuery.data?.role}</Text>
      <Text> {userQuery.data?.description}</Text>
      <Button variant='outlined' color='red' onPress={() => logoutMutation.mutate()}>Log out</Button>
    </YStack>
  )
}
