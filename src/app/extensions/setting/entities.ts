import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    group: string

    @Column()
    name: string

    @Column('simple-json')
    value: unknown // 'json'
}

export type SettingDto = typeof Setting;

export const setItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String(),
    value: Type.Unknown(),
})

export type SetItemDto = Static<typeof setItemSchema>

export const setItemsSchema = Type.Array(setItemSchema)

export type SetItemsDto = Static<typeof setItemsSchema>

export const getItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String()
})

export type GetItemDto = Static<typeof getItemSchema>

export const getItemsSchema = Type.Object({
    group: Type.Optional(Type.String()),
})

export type GetItemsDto = Static<typeof getItemsSchema>

export const deleteItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String()
})

export type DeleteItemDto = Static<typeof deleteItemSchema>

export const deleteItemsSchema = Type.Object({
    group: Type.String(),
})

export type DeleteItemsDto = Static<typeof deleteItemsSchema>
