"use client";

import { Library } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:flex items-center justify-center bg-muted">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 text-center max-w-md px-4">
          <Link href="/" className="flex items-center justify-center mb-8">
            <Library className="h-12 w-12" />
            <span className="ml-2 text-2xl font-bold">Libra</span>
          </Link>
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Libra has completely transformed how we manage our library. The efficiency gains are remarkable.&rdquo;
            </p>
            <footer className="text-sm">Sofia Chen, Head Librarian</footer>
          </blockquote>
        </div>
      </div>
      <main className="flex items-center justify-center p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}