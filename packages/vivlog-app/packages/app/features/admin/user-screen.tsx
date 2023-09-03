
import { Button, H2, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { Crud } from 'app/components/Crud'
import { myShadows } from 'app/presets/shadow'
import React from 'react'
import { useLink } from 'solito/link'

export function AdminUserScreen() {
    const link = useLink({
        href: '/',
    })

    return (
        <YStack f={1} marginTop={16} jc="center" ai="center" space>
            <Button {...link} icon={ChevronLeft}>
                Go Home
            </Button>
            <H2 ta="center" fow="700">User</H2>
        </YStack>
    )
}

export function AdminUserScreenPart() {
    const adapter = null
    return (
        <YStack space bg='$gray1' p={18} {...myShadows.mild} borderRadius={8} w='100%'>
            <Crud adapter={adapter}></Crud>
        </YStack>
    )
}
