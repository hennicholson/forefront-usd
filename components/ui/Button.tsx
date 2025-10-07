import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  children,
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const variants = {
    primary: 'bg-gradient-to-r from-forefront-blue to-forefront-cyan hover:opacity-90 text-white',
    secondary: 'bg-transparent border-2 border-forefront-blue text-forefront-blue hover:bg-forefront-blue hover:text-white',
    ghost: 'bg-gray-800 hover:bg-gray-700 text-white'
  }

  return (
    <button
      className={`
        ${sizes[size]}
        ${variants[variant]}
        font-semibold rounded-lg transition-all
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
