import type { Metadata } from 'next'
import '@/index.css' // Import global styles

export const metadata: Metadata = {
    title: 'Interview Coach',
    description: 'AI-powered interview practice',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
