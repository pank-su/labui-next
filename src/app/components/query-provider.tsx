import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {useState} from 'react'

export const ReactQueryClientProvider = ({children}: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                        staleTime: Infinity,
                        gcTime: 0,
                    },
                },
            })
    )
    return <QueryClientProvider client={queryClient}>{children}
        <ReactQueryDevtools position='right'/>
    </QueryClientProvider>
}