import { Button, Input, Paragraph, Spinner, TextArea, View } from '@my/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateCommentMutation } from 'app/hooks/useCreateCommentMutation'
import { useCurrentUser } from 'app/hooks/useCurrentUser'
import { Resource } from 'app/typing/entities'
import { useState } from 'react'
import { useLink } from 'solito/link'

function GuestInfoForm() {
    return <View>
        <Input placeholder='Name' />
        <Input placeholder='Email' />
        <Input placeholder='Website(optional)' />
    </View>
}

interface CommentAreaProps {
    onSubmit: (string) => void
}

function CommentArea({ onSubmit }: CommentAreaProps) {
    const [content, setContent] = useState('')
    return <View>
        <TextArea
            width='100%'
            marginTop={16}
            marginBottom={16}
            onChangeText={setContent}
            placeholder='Leave a comment' />
        <View display='flex' justifyContent='flex-end'>
            <Button onPress={() => onSubmit(content)}>Submit</Button>
        </View>
    </View>
}

interface CommentFormProps {
    resource: Resource | undefined
}

function CommentForm({ resource }: CommentFormProps) {
    const userQuery = useCurrentUser()
    const linkToLogin = useLink({
        href: '/auth/login',
    })
    const createCommentMut = useCreateCommentMutation(resource)
    const handleSubmit = async (content: string) => {
        await createCommentMut.mutateAsync({
            content,
            resource: resource!,
        })
    }

    if (createCommentMut.isLoading) {
        return <View margin={16}>
            <Spinner />
        </View>
    }

    if (userQuery.isLogin) {
        return <View >
            <CommentArea onSubmit={handleSubmit} />
        </View>
    } else {
        return (<View >
            <View marginTop={16}><Paragraph><Button display='inline' variant='outlined' {...linkToLogin}>Log in</Button> to leave a comment</Paragraph></View>
            <View marginBottom={16}><Paragraph>Or comment as a guest</Paragraph></View>
            <View>
                {GuestInfoForm()}
                <CommentArea onSubmit={handleSubmit} />
            </View>
        </View>)

    }
}

export default CommentForm
