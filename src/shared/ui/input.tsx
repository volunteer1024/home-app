import * as React from 'react'

import { cn } from '@/shared/utils/cn'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-14 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 text-[18px] text-[var(--text-strong)] shadow-sm outline-none placeholder:text-[var(--text-soft)] focus-visible:border-[var(--border-strong)] focus-visible:ring-4 focus-visible:ring-amber-100',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
