import { createFileRoute } from '@tanstack/react-router'

import { InvoicePage } from '@/features/invoice/pages/InvoicePage'

export const Route = createFileRoute('/invoice')({
  component: InvoicePage,
})
