import { Avatar } from '@my/ui'

export interface AvatarBoxProps {
    uri?: string
    size?: number
}
export function AvatarBox({ uri, size }: AvatarBoxProps) {
    return (
        // <Image mr={8} borderRadius={99} source={{ uri, width: 32, height: 32 }}></Image>
        <Avatar circular size={size ?? 32}>
            <Avatar.Image source={{ uri, width: size ?? 32, height: size ?? 32 }} />
            <Avatar.Fallback bc="$gray5" />
        </Avatar>
    )
}

export default AvatarBox
