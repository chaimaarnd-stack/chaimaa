import { Backpack, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { itemCount } = useCart()

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm backdrop-blur"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <a
          href="#home"
          className="flex min-w-0 items-center gap-2 text-sm font-black text-[var(--color-text)] sm:text-lg"
        >
          <span className="bg-gradient-main grid size-8 shrink-0 place-items-center rounded-lg text-white sm:size-10">
            <Backpack size={18} aria-hidden="true" className="sm:hidden" />
            <Backpack size={21} aria-hidden="true" className="hidden sm:block" />
          </span>
          <span className="truncate">Cartables</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href="#cart"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-xs font-bold text-white transition active:scale-95 hover:bg-[var(--primary-dark)] sm:gap-2 sm:px-4 sm:text-sm"
          >
            <ShoppingCart size={16} aria-hidden="true" />
            <span>Panier</span>
            <span className="grid min-w-5 place-items-center rounded-full bg-[var(--secondary)] px-1.5 text-[10px] font-black text-white sm:min-w-6 sm:text-xs">
              {itemCount}
            </span>
          </a>
        </div>
      </nav>
    </motion.header>
  )
}

export default Navbar
