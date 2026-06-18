const messages = [
  'TESTÉS & APPROUVÉS PAR +200 000 CLIENTS',
  "LIVRAISON À DOMICILE GRATUITE DÈS 6000 DA D'ACHAT",
  'OFFRES SPÉCIALES RENTRÉE SCOLAIRE',
  'CARTABLES & TROUSSES DISPONIBLES',
  'PROMO SPÉCIALE SUR LES PACKS SCOLAIRES',
]

function MessageGroup({ hidden = false }) {
  return (
    <div
      className="flex shrink-0 items-center gap-12 px-6 sm:gap-16 sm:px-8 lg:gap-20"
      aria-hidden={hidden}
    >
      {messages.map((message) => (
        <span key={message} className="whitespace-nowrap">
          {message}
        </span>
      ))}
    </div>
  )
}

function AnnouncementBar() {
  return (
    <div className="relative h-10 overflow-hidden border-b border-[var(--border)] bg-[var(--background)] text-[var(--text)]">
      <div className="animate-marquee flex h-full w-max items-center text-xs font-medium uppercase tracking-widest sm:text-sm">
        <MessageGroup />
        <MessageGroup hidden />
      </div>
    </div>
  )
}

export default AnnouncementBar
