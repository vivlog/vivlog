/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select } from '@my/ui'
import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useMemo, useState } from 'react'
import {
    Adapt,
    Sheet,
    YStack
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

interface SelectOptionsProps {
    value?: string
    onChange?: (value: string) => void
    options: {
        label: string
        value: string
    }[]
    size?: string
    native?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SelectOptions({ value, onChange, options, size, native }: SelectOptionsProps) {
    const [selectedValue, setSelectedValue] = useState(value)
    native = native ?? false

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue)
        if (onChange) {
            onChange(newValue)
        }
    }

    const optionItems = useMemo(
        () =>
            options.map((option, index) => (
                <Select.Item
                    index={index}
                    key={option.value}
                    value={option.value}
                >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                        <Check size={16} />
                    </Select.ItemIndicator>
                </Select.Item>
            )),
        [options]
    )

    return (
        <Select
            id="food"
            value={selectedValue}
            onValueChange={handleValueChange}
        >
            <Select.Trigger width={220} iconAfter={ChevronDown}>
                <Select.Value placeholder="Something" />
            </Select.Trigger>

            <Adapt when="sm" platform="touch">
                <Sheet
                    native={native === true}
                    modal
                    dismissOnSnapToBottom
                    animationConfig={{
                        type: 'spring',
                        damping: 20,
                        mass: 1.2,
                        stiffness: 250,
                    }}
                >
                    <Sheet.Frame>
                        <Sheet.ScrollView>
                            <Adapt.Contents />
                        </Sheet.ScrollView>
                    </Sheet.Frame>
                    <Sheet.Overlay
                        animation="lazy"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                </Sheet>
            </Adapt>

            <Select.Content zIndex={200000}>
                <Select.ScrollUpButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                >
                    <YStack zIndex={10}>
                        <ChevronUp size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['$background', '$backgroundTransparent']}
                        borderRadius="$4"
                    />
                </Select.ScrollUpButton>

                <Select.Viewport minWidth={200}>
                    <Select.Group>
                        {optionItems}
                    </Select.Group>
                    {/* Native gets an extra icon */}
                    {/* {native && (
                        <YStack
                            position="absolute"
                            right={0}
                            top={0}
                            bottom={0}
                            alignItems="center"
                            justifyContent="center"
                            width={'$4'}
                            pointerEvents="none"
                        >
                            <ChevronDown size={getFontSize((size ?? '$true') as any)} />
                        </YStack>)} */}
                </Select.Viewport>

                <Select.ScrollDownButton
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    width="100%"
                    height="$3"
                >
                    <YStack zIndex={10}>
                        <ChevronDown size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['$backgroundTransparent', '$background']}
                        borderRadius="$4"
                    />
                </Select.ScrollDownButton>
            </Select.Content>
        </Select>
    )
}
