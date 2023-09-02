import { SizableText, Stack, StackProps, TabLayout, Tabs, TabsTabProps, YStack } from '@my/ui'
import React, { useState } from 'react'

const TabsRovingIndicator = ({ active, ...props }: { active?: boolean } & StackProps) => {
    return (
        <Stack
            position="absolute"
            backgroundColor="$color5"
            opacity={0.7}
            {...(active && {
                backgroundColor: '$color8',
                opacity: 0.6,
            })}
            {...props}
        />
    )
}

interface MyTabsProps {
    items: {
        label: string
        value: string
        content: React.ReactNode
    }[]
    defaultValue?: string
    onChange?: (value: string) => void
}

export const MyTabs = ({ items, onChange, defaultValue }: MyTabsProps) => {
    const [tabState, setTabState] = useState<{
        currentTab: string
        /**
         * Layout of the Tab user might intend to select (hovering / focusing)
         */
        intentAt: TabLayout | null
        /**
         * Layout of the Tab user selected
         */
        activeAt: TabLayout | null
    }>({
        activeAt: null,
        currentTab: defaultValue ?? items[0]?.value ?? '',
        intentAt: null,
    })

    const setCurrentTab = (currentTab: string) => setTabState({ ...tabState, currentTab })
    const setIntentIndicator = (intentAt) => setTabState({ ...tabState, intentAt })
    const setActiveIndicator = (activeAt) =>
        setTabState({ ...tabState, activeAt })
    const { activeAt, intentAt, currentTab } = tabState

    const handleOnInteraction: TabsTabProps['onInteraction'] = (type, layout) => {
        if (type === 'select') {
            setActiveIndicator(layout)
        } else {
            setIntentIndicator(layout)
        }
    }

    return (
        <Tabs
            value={currentTab}
            onValueChange={(value) => { setCurrentTab(value); onChange?.(value) }}
            orientation="horizontal"
            size="$4"
            padding="$2"
            height={150}
            flexDirection="column"
            activationMode="manual"
            backgroundColor="$background"
            borderRadius="$4"
            position="relative"
        >
            <YStack>
                {intentAt && (
                    <TabsRovingIndicator
                        borderRadius="$4"
                        width={intentAt.width}
                        height={intentAt.height}
                        x={intentAt.x}
                        y={intentAt.y}
                    />
                )}

                {activeAt && (
                    <TabsRovingIndicator
                        borderRadius="$4"
                        theme="active"
                        width={activeAt.width}
                        height={activeAt.height}
                        x={activeAt.x}
                        y={activeAt.y}
                    />
                )}

                <Tabs.List
                    disablePassBorderRadius
                    loop={false}
                    aria-label="Tabs"
                    space="$2"
                    backgroundColor="transparent"
                >
                    {/* <Tabs.Tab unstyled value="tab1" onInteraction={handleOnInteraction}>
                        <SizableText>Profile</SizableText>
                    </Tabs.Tab>
                    <Tabs.Tab unstyled value="tab2" onInteraction={handleOnInteraction}>
                        <SizableText>Connections</SizableText>
                    </Tabs.Tab>
                    <Tabs.Tab unstyled value="tab3" onInteraction={handleOnInteraction}>
                        <SizableText>Notifications</SizableText>
                    </Tabs.Tab> */}
                    {items.map((item) => (
                        <Tabs.Tab key={item.label} unstyled value={item.value} onInteraction={handleOnInteraction}>
                            <SizableText>{item.label}</SizableText>
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </YStack>

            <YStack key={currentTab} x={0} opacity={1} flex={1}>
                <Tabs.Content value={currentTab} forceMount flex={1} justifyContent="center">
                    {items.find((item) => item.value === currentTab)?.content}
                </Tabs.Content>
            </YStack>
        </Tabs>
    )
}
