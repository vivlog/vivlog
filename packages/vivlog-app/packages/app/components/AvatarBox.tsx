import { Avatar } from '@my/ui'

export interface AvatarBoxProps {
    uri?: string
}
function AvatarBox({ uri }: AvatarBoxProps) {
    return (
        // <Image mr={8} borderRadius={99} source={{ uri, width: 32, height: 32 }}></Image>
        <Avatar circular size="$3">
            <Avatar.Image source={{ uri }} />
            <Avatar.Fallback bc="$gray5" />
        </Avatar>
    )
}

export default AvatarBox
