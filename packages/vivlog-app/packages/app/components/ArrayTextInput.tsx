import { Button, Input, ListItem, ScrollView, Text, XStack, YGroup, YStack } from '@my/ui'
import { Plus, X } from '@tamagui/lucide-icons'
import React from 'react'

interface ArrayTextInputProps {
    value?: string[]
    allowDuplication?: boolean
    allowEmpty?: boolean
    onChange?: (value: string[]) => void
    scrollable?: boolean
    scrollHeight?: number
    width?: number
}

export function ArrayTextInput(props: ArrayTextInputProps & React.ComponentPropsWithRef<typeof YStack>) {
    const { value, allowDuplication, allowEmpty, onChange, width: width_, scrollHeight, scrollable, ...rest } = props
    console.log('value', value)

    const width = width_ ?? '100%'
    const [inputing, setInputing] = React.useState('')
    const handleSubmit = () => {
        if (inputing === '') {
            if (allowEmpty !== true) {
                return
            }
        }
        if (allowDuplication !== true && value?.includes(inputing)) {
            setInputing('')

            return
        }
        onChange?.([inputing, ...value ?? []])
        setInputing('')
    }
    const list = value?.map((tag) => {
        return (
            <YGroup.Item key={tag}>
                <ListItem hoverTheme display='flex'>
                    <Text f={1}>{tag}</Text>
                    <Button unstyled icon={X}
                        padding={4}
                        borderRadius={99}
                        hoverStyle={{ backgroundColor: '$gray5' }}
                        onPress={() => {
                            onChange?.(value?.filter((t) => t !== tag) ?? [])
                        }}></Button>
                </ListItem>
            </YGroup.Item>
        )
    })
    return (
        <YStack space={4} {...rest}>
            <XStack space={4}>
                <Input width={width} value={inputing} onChangeText={setInputing}></Input>
                <Button variant='outlined' icon={Plus} onPress={handleSubmit}></Button>
            </XStack>
            {(list?.length ?? 0) > 0 && <YGroup bordered width={width} size="$4" >
                {scrollable ? <ScrollView height={scrollHeight ?? 100}>
                    {list}
                </ScrollView> :
                    list
                }
            </YGroup>}

        </YStack>
    )
}
