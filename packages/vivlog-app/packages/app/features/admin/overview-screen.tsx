import { Button, H2, Spinner, Text, View, YStack } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import PersistValue from 'app/components/MemorizedComponent'
import { MyTabs } from 'app/components/MyTab'
import { prefix } from 'app/services/local'
import React from 'react'
import { useLink } from 'solito/link'


export function AdminOverviewScreen() {
    const link = useLink({
        href: '/',
    })

    const tabs = [{
        label: 'Overview',
        value: 'overview',
        content: <Text>Overview</Text>
    }, {
        label: 'Users',
        value: 'users',
        content: <Text>Users</Text>
    }, {
        label: 'Connections',
        value: 'connections',
        content: <Text>Connections</Text>
    }]

    return (
        <YStack f={1} marginTop={16} ai="center" space>
            <Button {...link} icon={ChevronLeft}>
                Go Home
            </Button>
            <H2 ta="center" fow="700">Admin</H2>
            <View maw={800} display='flex' w='100%'>
                <PersistValue persistKey={`${prefix}persist:admin_overview_tab`} loadingRender={<Spinner></Spinner>}>
                    <MyTabs items={tabs} defaultValue={tabs[0]?.value}></MyTabs>
                </PersistValue>
            </View>
        </YStack>
    )
}
