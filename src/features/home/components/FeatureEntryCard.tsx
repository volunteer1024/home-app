import { type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import styles from './FeatureEntryCard.module.less'

type FeatureEntryCardProps = {
  icon: ReactNode
  title: string
  description: string
  href: string
  actionLabel: string
  badge?: string
  secondaryActionLabel?: string
  secondaryActionHref?: string
}

export function FeatureEntryCard({
  icon,
  title,
  description,
  href,
  actionLabel,
  badge,
  secondaryActionLabel,
  secondaryActionHref,
}: FeatureEntryCardProps) {
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <div className={styles.iconWrap}>{icon}</div>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={styles.actions}>
        <Button asChild className={styles.primaryButton}>
          <Link to={href}>{actionLabel}</Link>
        </Button>
        {secondaryActionLabel && secondaryActionHref ? (
          <Button asChild variant="secondary">
            <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
