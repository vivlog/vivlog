/* eslint-disable @typescript-eslint/no-explicit-any */

type IUserDto = {
    username: string
    avatarUrl: string
    site: string
    is_local: boolean
    description?: string | undefined
}

export type Resource = {
    site: string
    uuid: string
    type: string
}

export type Post = {
    id: number
    site: string
    uuid: string
    title: string
    type: string
    slug: string
    content: any
    author_uuid: string
    author_site: string
    attachment_vids: any[]
    custom: any
    status: string
    visibility: string
    format: string
    sticky: boolean
    created_at: Date
    updated_at: Date
    published_at: Date
    author?: IUserDto
    remote_author: IUserDto

}

export interface AgentInfo {
    email?: string
    id?: string
    local: boolean
    role: string
    site?: string
    trusted?: boolean // trusted always means the agent is a logged in user from the same site
    type: string
    username?: string
    uuid?: string
}
export type CommentDto = {
    uuid: string
    id: number
    site: string
    resource_site: string
    resource_uuid: string
    resource_type: string
    content: string
    agent?: AgentInfo | undefined
    user_uuid?: string | undefined
    user_site?: string | undefined
}

export type CreateCommentDto = {
    resource: {
        site: string
        uuid: string
        type: string
    }
    content: string
}
