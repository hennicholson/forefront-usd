'use client'

import { Header } from '@/components/ui/Header'
import { usePathname } from 'next/navigation'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isModulePage = pathname?.startsWith('/modules/')
  const isWorkflowDetailPage = pathname?.match(/^\/workflows\/\d+/)
  const hideHeader = isModulePage || isWorkflowDetailPage

  return (
    <>
      {!hideHeader && <Header />}
      <div style={{ paddingTop: hideHeader ? '0' : '70px' }}>
        {children}
      </div>
    </>
  )
}
