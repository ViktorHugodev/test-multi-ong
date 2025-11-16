import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background-light">
      <DashboardSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
