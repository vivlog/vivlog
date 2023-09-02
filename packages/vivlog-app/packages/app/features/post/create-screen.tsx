
import { Button, H2, Input, Paragraph, Spacer, TextArea, YStack, useToastController } from '@my/ui'
import { ChevronLeft, Send } from '@tamagui/lucide-icons'
import { useCreatePostMutation } from 'app/hooks/useCreatePostMutation'
import { useDraftStorage } from 'app/hooks/useDraftStorage'
import { CreatePostDto } from 'app/typing/entities'
import { useFormik } from 'formik'
import React from 'react'
import { GestureResponderEvent } from 'react-native'
import { useLink } from 'solito/link'
import { useRouter } from 'solito/router'
import * as yup from 'yup'

type CreatePostFormProps = {
    onSubmit: (values: CreatePostDto) => void
}

export function CreatePostForm(props: CreatePostFormProps & React.ComponentProps<typeof YStack>) {
    const { onSubmit, ...rest } = props
    const draft = useDraftStorage<CreatePostDto>({ key: 'create-post' })

    React.useEffect(() => {
        draft.get().then((values: CreatePostDto | undefined) => {
            console.log('loaded draft', values)
            if (values) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form.setValues(values as any, true)
            }
        })
    }, [])

    const form = useFormik({
        initialValues: {
            title: '',
            content: '',
        },
        validationSchema: yup.object().shape({
            title: yup.string().optional().min(1).max(128),
            content: yup.string().required().min(1).max(10240),
        }),
        onSubmit(values) {
            onSubmit(values)
        },
    })


    const handlePressSubmit = (e: GestureResponderEvent) => {
        e.preventDefault()
        form.handleSubmit()
    }

    const handleChange = (name: string) => (value: string) => {
        form.handleChange(name)(value)
        draft.set(form.values)
        console.log(form.values)

    }

    return (
        <YStack
            {...rest}
        >
            <Input
                placeholder="Title (optional)"
                value={form.values.title}
                onChangeText={handleChange('title')}>
            </Input>
            {
                form.touched.title && form.errors.title && <Paragraph color="red">{form.errors.title}</Paragraph>
            }

            <Spacer />
            <TextArea
                placeholder="Content"
                value={form.values.content}
                onChangeText={handleChange('content')}>
            </TextArea>
            {
                form.touched.content && form.errors.content && <Paragraph color="red">{form.errors.content}</Paragraph>
            }

            <Spacer />
            <Button
                variant='outlined'
                icon={Send}
                onPress={handlePressSubmit}>Submit</Button>
        </YStack>
    )
}

export function PostCreateScreen() {
    const link = useLink({
        href: '/',
    })
    const mutation = useCreatePostMutation()
    const r = useRouter()
    const draft = useDraftStorage<CreatePostDto>({ key: 'create-post' })
    const toast = useToastController()
    const handleSubmit = async (values: CreatePostDto) => {
        try {
            await mutation.mutateAsync(values)
            await draft.remove()
            r.replace('/')
        } catch (error) {
            console.log(error)
            toast.show('Error', {
                message: error.message
            })
        }
    }

    return (
        <YStack f={1} marginTop={16} ai="center" space >
            <Button {...link} icon={ChevronLeft}>
                Go Home
            </Button>
            <H2 ta="center" fow="700">Create Post</H2>
            <CreatePostForm miw={400} maw={800} onSubmit={(values) => handleSubmit(values)} />
        </YStack >
    )
}
