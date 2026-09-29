import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MEDIVA — منصة أردنية رقمية لسوق الرعاية الصحية",
  description:
    "MEDIVA: HealthTech Marketplace أردني يربط المرضى بمقدمي الرعاية الصحية المستقلين — التمريض المنزلي، العلاج الطبيعي، الصيدليات، المختبرات.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={plex.variable}>
      <body className={`${plex.className} antialiased`}>{children}</body>
    </html>
  );
}
