
import { Button, H2, H3, Input, TextArea, YStack, useToastController } from '@my/ui'
import { ChevronLeft } from '@tamagui/lucide-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrayTextInput } from 'app/components/ArrayTextInput'
import { StandaloneField } from 'app/components/StandaloneField'
import { myShadows } from 'app/presets/shadow'
import { SchemaItem, settings } from 'app/services/api'
import React from 'react'
import { useLink } from 'solito/link'

export function AdminSystemScreen() {
    const link = useLink({
        href: '/',
    })

    return (
        <YStack f={1} marginTop={16} jc="center" ai="center" space>
            <Button {...link} icon={ChevronLeft}>
                Go Home
            </Button>
            <H2 ta="center" fow="700">System</H2>
            <AdminSystemScreenPart></AdminSystemScreenPart>
        </YStack>
    )
}


export function buildControl(schema: SchemaItem) {
    switch (schema.formItemOptions.type) {
        case 'inline-text':
            return Input
        case 'text':
            return TextArea
        case 'array-text':
            return ArrayTextInput
        default:
            return Input
    }
}

export function SettingFieldPart({ schema }: { schema: SchemaItem }) {
    const Control = buildControl(schema)
    const [value, setValue] = React.useState(schema.defaultValue)
    const toast = useToastController()
    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: settings.setItem,
        onSuccess: () => {
            toast.show('Update success!')
            queryClient.invalidateQueries(['settings'])
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onError: (err: Error) => { }
    })
    const handleSubmit = () => {
        mutation.mutate({
            group: schema.group,
            name: schema.name,
            value: value
        })
        console.log('submit', value)
    }
    const handleReset = () => {
        mutation.reset()
        setValue(schema.defaultValue)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChange = (value: any) => {
        if (value.constructor.name.endsWith('Event')) {
            value = (value as unknown as React.ChangeEvent<HTMLInputElement>).target.value
        }
        setValue(value)
    }
    return (
        <StandaloneField
            onSubmit={handleSubmit}
            onReset={handleReset}
            label={schema.label}
            error={mutation.error?.message}
            changed={value !== schema.defaultValue}
            loading={mutation.isLoading}
        >
            <Control flex={1} value={value} onChange={onChange}></Control>
        </StandaloneField >
    )
}

export function AdminSystemScreenPart() {
    const remoteSchema = useQuery(['settings', 'getSchema'], settings.getSchema)
    if (remoteSchema.data) {
        console.log('remoteSchema.data', remoteSchema.data)
    }
    const grouped = remoteSchema.data?.reduce((acc: Record<string, SchemaItem[]>, item: SchemaItem) => {
        if (!acc[item.group]) {
            acc[item.group] = []
        }
        acc[item.group]?.push(item)
        return acc
    }, {})

    return (
        <YStack space bg='$gray1' p={18} {...myShadows.mild} borderRadius={8} w='100%'>
            {
                grouped && Object.keys(grouped).map((key) => {
                    return (
                        <YStack key={key} space={8}>
                            <H3 mb={2}>{key.toUpperCase()}</H3>
                            {
                                grouped[key]?.map((item: SchemaItem) =>
                                (<SettingFieldPart
                                    key={`${item.group}-${item.name}`}
                                    schema={item}></SettingFieldPart>))
                            }
                        </YStack>
                    )
                })
            }
        </YStack>
    )
}
