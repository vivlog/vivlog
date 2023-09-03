/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { settings } from 'app/services/api'


export const useSystemInfo = () => {
    const query = useQuery(['settings', 'getSystemInfo'], settings.getSystemInfo)
    const dict = query.data
        ?.reduce((acc, cur) => {
            if (!acc[cur.group]) {
                acc[cur.group] = {}
            }
            if (!acc[cur.group]![cur.name]) {
                acc[cur.group]![cur.name] = cur.value
            }

            return acc
        }, {} as Record<string, Record<string, any>>)
    return { ...query, dict }
}
