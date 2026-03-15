import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/utils/cn'

const buttonVariants = cva(
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-5 text-[18px] font-semibold leading-none transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--action-primary)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-hover)]',
        secondary:
          'bg-[var(--action-secondary)] text-[var(--text-strong)] hover:bg-[var(--action-secondary-hover)]',
        ghost:
          'bg-transparent text-[var(--text-strong)] hover:bg-[var(--surface-muted)]',
        outline:
          'border border-[var(--border-strong)] bg-transparent text-[var(--text-strong)] hover:bg-[var(--surface-muted)]',
      },
      size: {
        default: 'h-14',
        sm: 'h-12 rounded-xl px-4 text-[16px]',
        icon: 'h-14 w-14 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
