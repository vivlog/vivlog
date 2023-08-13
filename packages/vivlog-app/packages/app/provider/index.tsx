import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationProvider } from './navigation';
import { SafeArea } from './safe-area';
const queryClient = new QueryClient();

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SafeArea>
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>{children}</NavigationProvider>
      </QueryClientProvider>
    </SafeArea>
  )
}
