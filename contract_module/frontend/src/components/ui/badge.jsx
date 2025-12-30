import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary-700 dark:text-primary-400',
        secondary: 'bg-secondary/10 text-secondary-700 dark:text-secondary-400',
        success: 'bg-success/10 text-success-700 dark:text-success-400',
        error: 'bg-error/10 text-error-700 dark:text-error-400',
        warning: 'bg-warning/10 text-warning-700 dark:text-warning-400',
        info: 'bg-info/10 text-info-700 dark:text-info-400',
        neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
        outline: 'border-2 border-current',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Badge = ({ className, variant, size, children, ...props }) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'

export { Badge, badgeVariants }