import { ReactNode } from 'react'

interface LuxuryCardProps {
  children: ReactNode
  className?: string
  gradient?: 'orange' | 'purple' | 'blue' | 'gold' | 'dark'
  hover?: boolean
}

export function LuxuryCard({ children, className = '', gradient = 'orange', hover = true }: LuxuryCardProps) {
  const gradients = {
    orange: 'bg-gradient-to-br from-orange-50 via-white to-orange-50/30',
    purple: 'bg-gradient-to-br from-purple-50 via-white to-purple-50/30',
    blue: 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30',
    gold: 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
  }

  return (
    <div
      className={`
        ${gradients[gradient]}
        backdrop-blur-xl
        border border-white/20
        rounded-2xl
        shadow-xl
        ${hover ? 'transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  gradient?: 'orange' | 'purple' | 'blue' | 'gold'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, subtitle, icon, gradient = 'orange', trend }: StatCardProps) {
  const iconColors = {
    orange: 'text-orange-600 bg-orange-100',
    purple: 'text-purple-600 bg-purple-100',
    blue: 'text-blue-600 bg-blue-100',
    gold: 'text-amber-600 bg-amber-100',
  }

  return (
    <LuxuryCard gradient={gradient}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl ${iconColors[gradient]} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          {trend && (
            <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
          {value}
        </p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </LuxuryCard>
  )
}

interface GlowButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  icon?: ReactNode
}

export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
}: GlowButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/50',
    secondary: 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-gray-500/50',
    success: 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/50',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        text-white font-semibold rounded-xl
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        flex items-center gap-2
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent">
          {title}
        </h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
    </div>
  )
}
