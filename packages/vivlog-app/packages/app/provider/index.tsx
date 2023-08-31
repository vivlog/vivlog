import { CustomToast, TamaguiProvider, TamaguiProviderProps, ToastProvider } from '@my/ui'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useColorScheme } from 'react-native'
import config from '../tamagui.config'
import { InitLocal } from './InitLocal'
import { ToastViewport } from './ToastViewport'


export function Provider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const scheme = useColorScheme()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
      },
    },
  })
  const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
  })
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <TamaguiProvider
        config={config}
        disableInjectCSS
        defaultTheme={scheme === 'dark' ? 'dark' : 'light'}
        {...rest}
      >
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={
            [
              /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
              // 'mobile'
            ]
          }
        >
          <InitLocal />
          {children}
          <CustomToast />
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider >
    </PersistQueryClientProvider>
  )
}
