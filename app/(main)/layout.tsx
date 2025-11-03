import { Header } from '@/components/ui/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '70px' }}>
        {children}
      </div>
    </>
  )
}
