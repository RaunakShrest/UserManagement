import { Jost } from "next/font/google";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import ReactQueryProvider from "@/contexts/query-provider/query-provider";
import { Toaster } from "react-hot-toast";
import { Metadata } from "next";
import { ReactNode } from "react";

config.autoAddCss = false;

const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage and store users",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${jost.className} bg-white`}
        suppressHydrationWarning={true}
      >
        <ReactQueryProvider>
          {children}

          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
