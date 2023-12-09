import './globals.css';
import { Inter } from 'next/font/google';

import TopBanner from '@/app/components/TopBanner';
import EntityPopupWrapper from '@/app/components/EntityPopupWrapper';
import CreationPopupProvider from '@/app/contexts/CreationPopupContext';


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Lab Notebook',
  description: 'New Lab Notebook for the Pfaff Lab',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.8.1/font/bootstrap-icons.min.css" integrity="sha512-Oy+sz5W86PK0ZIkawrG0iv7XwWhYecM3exvUtMKNJMekGFJtVAhibhRPTpmyTj8+lJCkmWfnpxKgT2OopquBHA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        </head>
        <body className={inter.className}>
          <div className="banner-container">
            <CreationPopupProvider>
              <TopBanner />
              <EntityPopupWrapper children={children}/>
            </CreationPopupProvider>
          </div>  
        </body>
    </html>
  )
}
