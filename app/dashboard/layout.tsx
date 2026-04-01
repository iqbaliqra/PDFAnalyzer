import { Header, Footer } from '../components/common';
import { DashboardAuthBar } from './DashboardAuthBar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header>
        <DashboardAuthBar />
      </Header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
