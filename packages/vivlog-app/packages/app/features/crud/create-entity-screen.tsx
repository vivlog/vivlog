
import { Button, H2, Text, View, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useSharedData } from 'app/provider/SharedDataContext'
import React from 'react'
import { createParam } from 'solito'
import { useLink } from 'solito/link'

const { useParam } = createParam<{ dataKey: string }>()

export function CrudCreateEntityScreen() {
    const link = useLink({
        href: '/',
    })

    const [dataKey] = useParam('dataKey')
    console.log(dataKey)
    const [data] = useSharedData<string>(dataKey)
    console.log('data', data)

    return (
        <YStack f={1} marginTop={16} jc="center" ai="center" space>
            <Button {...link} icon={ChevronLeft}>
                Go Home
            </Button>
            <H2 ta="center" fow="700">Create Entity</H2>
            {!dataKey &&
                <View>
                    <Text>Something went wrong</Text>
                    <Text fs={10} col={'gray5'}>dataKey is not defined</Text>
                </View>
            }
        </YStack>
    )
}
