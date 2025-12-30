import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary shadow-sm',
        secondary: 'bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary shadow-sm',
        outline: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus:ring-primary',
        ghost: 'bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-primary',
        danger: 'bg-error text-white hover:bg-error-600 focus:ring-error shadow-sm',
        success: 'bg-success text-white hover:bg-success-600 focus:ring-success shadow-sm',
        warning: 'bg-warning text-white hover:bg-warning-600 focus:ring-warning shadow-sm',
        info: 'bg-info text-white hover:bg-info-600 focus:ring-info shadow-sm',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2',
        lg: 'px-6 py-3 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }