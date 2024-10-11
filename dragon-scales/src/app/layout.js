import localFont from "next/font/local";
import "./globals.css";
import Toolbar from "./components/Toolbar";
import { ExplorerProvider } from "@/app/contexts/explorerContext";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Lab Dragon",
  description: "The Lab Dragon App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ExplorerProvider>
        <Toolbar/>
        {children}
      </ExplorerProvider>
      </body>
    </html>
  );
}
