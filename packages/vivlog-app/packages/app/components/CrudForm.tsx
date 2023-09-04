import { Input, Text, XStack, YStack } from '@my/ui'
import { SelectOptions } from './SelectOptions'

interface CrudFormProps {

}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CrudForm(props: CrudFormProps) {
    return <YStack>
        <YStack mb={12}>
            <Text pl={2} mb={8}>Username</Text>
            <XStack space={4}>
                <Input></Input>
            </XStack>
            <Text pl={2} mb={8}>Username cannot be changed once created</Text>
        </YStack>
        <YStack mb={12}>
            <Text pl={2} mb={8}>Email</Text>
            <XStack space={4}>
                <Input></Input>
            </XStack>
        </YStack>
        <YStack mb={12}>
            <Text pl={2} mb={8}>Password</Text>
            <XStack space={4}>
                <Input secureTextEntry></Input>
            </XStack>
        </YStack>
        <YStack mb={12}>
            <Text pl={2} mb={8}>Role</Text>
            <XStack space={4}>
                <SelectOptions
                    native
                    options={[
                        { label: 'Apple', value: 'apple' },
                        { label: 'Pear', value: 'pear' },
                        { label: 'Banana', value: 'banana' },
                        // Add more options as needed
                    ]}
                />
            </XStack>
        </YStack>
        {/* avatarUrl
description
 */}
        <YStack mb={12}>
            <Text pl={2} mb={8}>Avatar</Text>
            <XStack space={4}>
                <Input secureTextEntry></Input>
            </XStack>
        </YStack>
    </YStack>
}
