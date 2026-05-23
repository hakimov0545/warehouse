import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from '@shared/lib/queryClient'
import { useThemeStore } from '@entities/theme/model/theme'

export default function AppProviders({ children }) {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          borderRadius: 8,
          colorPrimary: '#6366f1',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  )
}
