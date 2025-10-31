import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/auth.store'

// Layouts
import AuthLayout from '@/shared/layouts/AuthLayout'
import ClientLayout from '@/shared/layouts/ClientLayout'
import AdminLayout from '@/shared/layouts/AdminLayout'

// Public Pages
import HomePage from '@/features/public/pages/HomePage'
import CalculatorPage from '@/features/public/pages/CalculatorPage'

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'

// Client Pages
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import PackagesPage from '@/features/packages/pages/PackagesPage'
import PackageDetailPage from '@/features/packages/pages/PackageDetailPage'
import QuotesPage from '@/features/quotes/pages/QuotesPage'
import ProfilePage from '@/features/profile/pages/ProfilePage'
import SupportPage from '@/features/support/pages/SupportPage'

// Admin Pages
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import AdminUsersPage from '@/features/admin/pages/AdminUsersPage'
import AdminPackagesPage from '@/features/admin/pages/AdminPackagesPage'
import AdminQuotesPage from '@/features/admin/pages/AdminQuotesPage'
import AdminPaymentsPage from '@/features/admin/pages/AdminPaymentsPage'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }

    if (adminOnly && user?.role !== 'ADMIN') {
      return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/calculateur" element={<CalculatorPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Client Routes */}
        <Route
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="packages" element={<AdminPackagesPage />} />
          <Route path="quotes" element={<AdminQuotesPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
