import { Button, Input, Paragraph, Spinner, TextArea, View } from '@my/ui'
import { useCreateCommentMutation } from 'app/hooks/useCreateCommentMutation'
import { useCurrentUser } from 'app/hooks/useCurrentUser'
import { Resource } from 'app/typing/entities'
import { useFormik } from 'formik'
import { useLink } from 'solito/link'
import * as yup from 'yup'



interface CommentFormProps {
    resource: Resource | undefined
}

function CommentForm({ resource }: CommentFormProps) {
    const userQuery = useCurrentUser()

    const guestInfoSchema = {
        email: yup.string().required().email(),
        name: yup.string().required().min(4).max(32),
        site: yup.string().optional().min(4).max(32),
    }
    const form = useFormik({
        initialValues: {
            email: '',
            name: '',
            site: '',
            content: '',
        },
        validationSchema: yup.object().shape({
            ...userQuery.isLogin ? {} : guestInfoSchema,
            content: yup.string().required().min(4).max(32),
        }),
        onSubmit(values) {
            createCommentMut.mutateAsync({
                dto: {
                    content: values.content,
                    resource: resource!,
                },
                ...(userQuery.isLogin ? {} : {
                    guestInfo: {
                        email: values.email,
                        name: values.name,
                        site: values.site,
                    }
                })
            })
        },
    })
    const linkToLogin = useLink({
        href: '/auth/login',
    })
    const createCommentMut = useCreateCommentMutation(resource)

    if (createCommentMut.isLoading) {
        return <View margin={16}>
            <Spinner />
        </View>
    }

    return (<View >
        {!userQuery.isLogin &&
            <View marginTop={16} marginBottom={16}><Paragraph><Button display='inline' variant='outlined' {...linkToLogin}>Log in</Button> to leave a comment. Or comment as a guest</Paragraph></View>}
        <View>
            {!userQuery.isLogin && (
                <View display='flex' gap={8}>
                    <View flex={1}>
                        <Input width='100%' placeholder='Name' onChangeText={form.handleChange('name')} />
                        {form.touched.name && form.errors.name &&
                            (<View key="name_error" marginTop={16}><Paragraph color='red'>{form.errors.name}</Paragraph></View>)
                        }
                    </View>
                    <View flex={1}>
                        <Input width='100%' placeholder='Email' onChangeText={form.handleChange('email')} />
                        {form.touched.email && form.errors.email &&
                            (<View key="email_error" marginTop={16}><Paragraph color='red'>{form.errors.email}</Paragraph></View>)
                        }
                    </View>
                    <View flex={1}>
                        <Input width='100%' placeholder='Website(optional)' onChangeText={form.handleChange('site')} />
                        {form.touched.site && form.errors.site &&
                            (<View key="site_error" marginTop={16}><Paragraph color='red'>{form.errors.site}</Paragraph></View>)
                        }
                    </View>
                </View>
            )}
            <View>
                <TextArea
                    width='100%'
                    marginTop={16}
                    marginBottom={16}
                    onChangeText={form.handleChange('content')}
                    placeholder='Leave a comment' />

                {(form.touched.content && form.errors.content) &&
                    (<View key="content_error" marginTop={16}><Paragraph color='red'>{form.errors.content}</Paragraph></View>)
                }
                <View display='flex' justifyContent='flex-end'>
                    <Button onPress={() => form.handleSubmit()}>Submit</Button>
                    {createCommentMut.isError &&
                        (<View marginTop={16}><Paragraph color='red'>Unable to create comment: {(createCommentMut.error as Error).message}</Paragraph></View>)
                    }
                </View>
            </View>
        </View>
    </View>)
}

export default CommentForm
