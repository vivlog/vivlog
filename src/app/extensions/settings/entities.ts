import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Setting {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    group: string

    @Column()
    name: string

    @Column()
    value: string

    @Column()
    type: 'string' | 'integer' | 'float' | 'boolean' | 'json'
}
