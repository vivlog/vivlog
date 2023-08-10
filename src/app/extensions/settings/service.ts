import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'


export class SettingService {
    private db: DataSource
    private logger: Logger
    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
    }


}
