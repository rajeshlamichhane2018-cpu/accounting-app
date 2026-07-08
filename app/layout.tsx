import "./globals.css";
import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
