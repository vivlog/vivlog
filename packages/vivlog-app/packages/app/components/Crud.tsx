import { Button, H3, ListItem, Separator, Sheet, Text, View, YGroup, YStack } from '@my/ui'
import { ChevronRight, FilePlus2, Moon, Star, X } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { CrudForm } from './CrudForm'

interface CrudProps {
    width?: number
    adapter?: CrudAdapter
}

interface CrudAdapter {

}

export function Crud({ adapter, width, ...props }: CrudProps) {
    const [showCreateSheet, setShowCreateSheet] = useState(false)
    const handleCreateNewEntity = () => {
        setShowCreateSheet(true)
    }
    return <YStack space>
        <View>
            <Button variant='outlined' icon={FilePlus2} onPress={handleCreateNewEntity}>New</Button>
            <Sheet
                open={showCreateSheet}
                modal
                onOpenChange={setShowCreateSheet}
            >
                <Sheet.Overlay
                    backgroundColor='rgba(0,0,0,0.5)'
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                    animation='lazy'
                />
                <Sheet.Handle />
                <Sheet.Frame
                    bg={'$gray1'}

                    padding={16}
                >
                    <View dsp='flex' ai='center'>
                        <H3 flex={1}>Create New</H3>
                        <Button bg={'$colorTransparent'} size="$6" circular icon={X} onPress={() => setShowCreateSheet(false)} />
                    </View>
                    <CrudForm />
                </Sheet.Frame>
            </Sheet>
        </View>
        <YGroup alignSelf="center" bordered width={width ?? '100%'} size="$5" separator={<Separator />}>
            <YGroup.Item>
                <ListItem
                    hoverTheme
                    pressTheme
                    title="Star"
                    subTitle="Subtitle"
                    icon={Star}
                    iconAfter={ChevronRight}
                />
            </YGroup.Item>
            <YGroup.Item>
                <ListItem
                    hoverTheme
                    pressTheme
                    title="Moon"
                    subTitle="Subtitle"
                    icon={Moon}
                    iconAfter={ChevronRight}
                />
            </YGroup.Item>
        </YGroup>
    </YStack>
}

