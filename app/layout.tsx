import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { WeatherProvider } from '@/contexts/WeatherContext'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoV7 Estética Automotiva',
  description: 'Sistema de gestão e agendamento - AutoV7',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <WeatherProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
              </ThemeProvider>
            </WeatherProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
