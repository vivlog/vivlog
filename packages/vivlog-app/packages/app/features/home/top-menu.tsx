import { AvatarBox, Button, Input, Text, View } from '@my/ui'
import { Plus, Settings } from '@tamagui/lucide-icons'
import { useCurrentUser } from 'app/hooks/useCurrentUser'
import { useSystemInfo } from 'app/hooks/useSystemInfo'
import { myShadows } from 'app/presets/shadow'
import { useRouter } from 'solito/router'

function TopMenu() {
    const userQuery = useCurrentUser()
    const infoQuery = useSystemInfo()

    const user = userQuery.data

    const router = useRouter()
    const handlePressUser = () => {
        if (user) {
            router.push('/user/my-profile')
        } else {
            router.push('/auth/login')
        }
    }

    const handlePressPlus = () => {
        router.push('/post/create')
    }

    return <View display='flex' bg='$gray1' ai='center' bbw={1} p={8} bbc='$gray5' style={
        { ...myShadows.small }
    }>
        <View cursor='pointer' flex={1} display='flex' ai='center' gap={8} onPress={handlePressUser}>
            <AvatarBox uri={user?.avatarUrl}></AvatarBox>
            <Text hoverStyle={{ fontSize: 18 }}>{user?.username ?? 'Not login'}</Text>
        </View>
        <View flex={1} display='flex' jc='center'>
            <Text fontSize={20}>{infoQuery.dict?.['system']?.['title'] ?? 'Vivlog'}</Text>
        </View>
        <View display='flex' flexDirection='row' flex={1} jc='flex-end' ai='center'>
            <View>
                <Input placeholder='Search' />
            </View>
            <Button onPress={handlePressPlus} icon={<Plus size={28} color='$gray12' />} chromeless circular />
            {
                user?.role === 'admin' && <Button onPress={() => router.push('/admin/overview')} icon={<Settings size={28} color='$gray12' />} chromeless circular />
            }
        </View>
    </View>
}

export default TopMenu
