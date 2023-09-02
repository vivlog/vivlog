import { View } from '@my/ui'
import AvatarBox from 'app/components/AvatarBox'
import { useCurrentUser } from 'app/hooks/useCurrentUser'

function TopMenu() {
    const userQuery = useCurrentUser()
    const user = userQuery.data
    return <View display='flex' gap={8} ai='center' bg='$gray1' bbw={1} p={8} bbc='$gray5'>
        {
            (
                <>
                    <AvatarBox uri={user?.avatarUrl}></AvatarBox>
                    <div>{user?.username ?? 'Not login'}</div>
                </>
            )
        }
    </View>
}

export default TopMenu
