/* eslint-disable @typescript-eslint/no-explicit-any */
import { Static, TSchema, Type } from '@sinclair/typebox'
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
    value: any // 'json'
}

export type SettingDto = typeof Setting;

export const setItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String(),
    value: Type.Any(),
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

export const getSchemaSchema = Type.Object({
    group: Type.Optional(Type.String()),
})

export type DeleteItemsDto = Static<typeof deleteItemsSchema>

export const initSettingsSchema = setItemsSchema

export type InitSettingsDto = Static<typeof initSettingsSchema>

export type SettingItem<T> = {
    group: string
    name: string
    defaultValue: T
    formItemOptions: any
    schema: TSchema
    description: string
}

