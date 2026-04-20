import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface-container-low w-full py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-on-surface-variant">
          © {year} ContentFlix. Tutti i diritti riservati.
        </p>
        <div className="flex gap-6">
          {[
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/termini', label: 'Termini di Servizio' },
            { href: '/contatto', label: 'Contatto' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
