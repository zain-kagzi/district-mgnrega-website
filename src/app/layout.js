// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'MGNREGA District Dashboard | मनरेगा जिला डैशबोर्ड',
  description: 'Track MGNREGA performance in your district. Real-time data on employment, wages, and work completion across Uttar Pradesh districts.',
  keywords: 'MGNREGA, मनरेगा, Mahatma Gandhi NREGA, rural employment guarantee, Uttar Pradesh, employment data, government scheme',
  authors: [{ name: 'MGNREGA Dashboard Team' }],
  openGraph: {
    title: 'MGNREGA District Dashboard',
    description: 'Track MGNREGA performance in your district',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}