import "./globals.css";
export const metadata = { title: "ALRAKEEN | Teltonika CAN Web Pro" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
