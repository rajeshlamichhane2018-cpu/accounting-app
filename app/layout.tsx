"use client";
import { usePathname } from "next/navigation";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const path = usePathname();
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r p-5">
            <h1 className="text-xl font-bold mb-6">💰 Finance</h1>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-lg bg-blue-600 text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/income"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200"
              >
                Income
              </Link>

              <Link
                href="/expense"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200"
              >
                Expense
                
              </Link>
              <Link href="/dues" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200">

    Dues

  </Link>
  <Link href="/reports">Reports</Link>
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}