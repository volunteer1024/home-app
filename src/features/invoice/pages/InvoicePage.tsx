import { Link } from '@tanstack/react-router'
import { ReceiptText } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { zhCN } from '@/shared/copy/zh-CN'

import styles from './InvoicePage.module.less'

export function InvoicePage() {
  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <CardHeader className={styles.header}>
          <div className={styles.iconWrap}>
            <ReceiptText size={30} strokeWidth={2.2} />
          </div>
          <span className={styles.badge}>{zhCN.invoice.badge}</span>
          <CardTitle>{zhCN.invoice.title}</CardTitle>
          <CardDescription>{zhCN.invoice.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">{zhCN.common.backHome}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
