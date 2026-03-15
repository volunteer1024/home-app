import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/invoice')({
  component: InvoiceRouteDisabled,
})

function InvoiceRouteDisabled() {
  // 发票功能暂时下线，保留路由文件以避免影响当前生成路由结构。
  return <Navigate to="/" />
}
