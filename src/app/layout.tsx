import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "GitCommerce",
  description: "Build and deploy e-commerce stores to GitHub Pages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
