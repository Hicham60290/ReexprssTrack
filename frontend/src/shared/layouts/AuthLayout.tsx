import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/auth.store'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary">ReExpressTrack</h1>
            <p className="mt-2 text-muted-foreground">Votre plateforme de réexpédition de colis</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
