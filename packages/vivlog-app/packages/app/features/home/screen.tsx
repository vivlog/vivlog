import {
  Button,
  Sheet,
  Text,
  useToastController,
  YStack
} from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoginRes } from 'app/services/api'
import { clearLocalToken, clearLocalUser, fetchLocalUser } from 'app/services/local'
import React, { useState } from 'react'
import { useLink } from 'solito/link'

export function HomeScreen() {
  const linkProps = useLink({
    href: '/user/nate',
  })

  const linkToRegister = useLink({
    href: '/auth/register',
  })

  const linkToLogin = useLink({
    href: '/auth/login',
  })

  const linkToPosts = useLink({
    href: '/post/list',
  })

  const queryClient = useQueryClient()

  const userQuery = useQuery<null | LoginRes['user']>(['user'], fetchLocalUser)

  const logoutMutation = useMutation(
    () => Promise.all([clearLocalToken(), clearLocalUser()]),
    {
      onSuccess: () => Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'] }),
        queryClient.invalidateQueries({ queryKey: ['token'] })
      ])
    })

  return (
    <YStack f={1} jc="center" ai="center" p="$4" space>
      <Text>User: {userQuery.data?.username ?? 'not login'}</Text>
      <Button {...linkProps}>Link to user</Button>
      {!userQuery.data && (<>
        <Button {...linkToRegister}>Register</Button>
        <Button {...linkToLogin}>Log in</Button>
      </>)}
      {userQuery.data && <YStack >
        <Button {...linkToPosts}>Posts</Button>
        <Button onPress={() => logoutMutation.mutate()}>Log out</Button>
      </YStack>}

      <SheetDemo />
    </YStack>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(0)
  const toast = useToastController()

  return (
    <>
      <Button
        size="$6"
        icon={open ? ChevronDown : ChevronUp}
        circular
        onPress={() => setOpen((x) => !x)}
      />
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Frame ai="center" jc="center">
          <Sheet.Handle />
          <Button
            size="$6"
            circular
            icon={ChevronDown}
            onPress={() => {
              setOpen(false)
              toast.show('Sheet closed!', {
                message: 'Just showing how toast works...',
              })
            }}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
