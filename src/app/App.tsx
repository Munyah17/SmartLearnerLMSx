import { BrowserRouter } from 'react-router-dom'
import Providers from './providers'
import Router from './Router'
import { useAuthInit } from '@/features/auth/useAuthInit'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit()
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AuthInitializer>
          <Router />
        </AuthInitializer>
      </Providers>
    </BrowserRouter>
  )
}
