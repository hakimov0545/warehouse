import AppRouter from './router'
import AppToast from './components/ui/AppToast'
import { useThemeStore } from './store/theme'

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
