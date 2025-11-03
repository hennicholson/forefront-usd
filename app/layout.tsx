import './globals.css'
import { Providers } from '@/components/providers/Providers'

export const metadata = {
  title: '[FOREFRONT] | AI Learning Network',
  description: 'Student-led AI education network. Pilot at University of San Diego. No gatekeeping—spread the sauce.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
