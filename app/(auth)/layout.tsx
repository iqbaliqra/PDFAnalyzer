import { Header, Footer } from '../components/common';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="mx-auto max-w-md">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
