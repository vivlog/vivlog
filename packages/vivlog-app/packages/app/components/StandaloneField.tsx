import { Button, Spinner, Text, XStack, YStack } from '@my/ui'
import { Check, Undo } from '@tamagui/lucide-icons'

interface FieldProps {
    label?: string
    error?: string
    children?: React.ReactNode
    onReset?: () => void
    onSubmit?: () => void
    loading?: boolean
    changed?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StandaloneField({ label, error, children, loading, changed, onReset, onSubmit }: FieldProps & React.ComponentPropsWithRef<any>) {
    return (
        <YStack mb={12}>
            <Text pl={2} mb={8}>{label}</Text>
            <XStack space={4}>
                {children}
                <XStack>
                    <Button bg='$colorTransparent'
                        style={{ opacity: changed === false ? 0.3 : 1 }}
                        disabled={loading || changed === false} icon={loading ? <Spinner /> : Check}
                        onPress={onSubmit}></Button>
                    <Button bg='$colorTransparent' icon={Undo}
                        onPress={onReset}
                    ></Button>
                </XStack>
            </XStack>
            {error &&
                <Text color="red">{error}</Text>}
        </YStack>
    )
}
