import TopNav from '@/components/layout/TopNav'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav variant="public" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
