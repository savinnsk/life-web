import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'LIFE SERVICE',
    description: 'App para controle de finanças pessoais',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    themeColor: '#3b82f6',
    manifest: '/manifest.json',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <head>
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="LIFE SERVICE" />
                <link rel="apple-touch-icon" href="/icon-192x192.png" />
            </head>
            <body>
                <AuthProvider>
                    <ThemeProvider>
                        <div className="mobile-container safe-area lg:max-w-none lg:mx-0 lg:px-0 lg:py-0">
                            {children}
                        </div>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
