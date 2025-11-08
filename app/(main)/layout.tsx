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

  return (
    <>
      {!isModulePage && <Header />}
      <div style={{ paddingTop: isModulePage ? '0' : '70px' }}>
        {children}
      </div>
    </>
  )
}
