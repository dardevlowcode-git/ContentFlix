import TopNav from '@/components/layout/TopNav'
import AdminSideNav from '@/components/layout/AdminSideNav'
import Footer from '@/components/layout/Footer'
import { getCurrentSession } from '@/lib/auth/provider'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()

  if (!session || session.role !== 'super_admin') {
    redirect('/dashboard?error=forbidden')
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopNav variant="admin" session={session} />
      <div className="flex flex-1 pt-16">
        <AdminSideNav />
        <main className="flex-1 ml-64 min-h-full">
          {children}
        </main>
      </div>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}
