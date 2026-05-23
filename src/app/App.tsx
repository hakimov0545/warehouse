import AppRouter from '@app/router'
import AppToast from '@shared/ui/AppToast'
import { useThemeStore } from '@entities/theme/model/theme'

export default function App() {
  // Subscribing keeps the data-theme attribute in sync.
  useThemeStore((s) => s.theme)
  return (
    <>
      <AppRouter />
      <AppToast />
    </>
  )
}
