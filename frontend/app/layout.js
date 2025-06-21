import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'F1 Analytics - Real-Time Race Data',
  description: 'Live Formula 1 race analytics platform with real-time telemetry, positions, and battle detection',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-f1-black text-f1-white min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-f1-black via-gray-900 to-f1-black">
          {children}
        </div>
      </body>
    </html>
  )
} 