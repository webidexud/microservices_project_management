import React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm transition-all duration-200',
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-error focus:border-error focus:ring-error/20',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm transition-all duration-200',
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-error focus:border-error focus:ring-error/20',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Input, Textarea }