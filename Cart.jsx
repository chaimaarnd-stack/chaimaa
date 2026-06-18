import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const priceFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0,
})

function Cart({ title = 'Votre panier', showCheckoutButton = true }) {
  const { items, total, itemCount, updateQuantity, removeFromCart } = useCart()

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm"
    >
      <div className="border-b border-[var(--color-border)] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]">
              Commande
            </p>
            <h2 className="text-xl font-black text-[var(--color-text)] sm:text-2xl">{title}</h2>
          </div>
          <div className="bg-gradient-accent grid size-10 place-items-center rounded-lg text-white sm:size-12">
            <ShoppingCart size={20} aria-hidden="true" />
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <motion.div
          key="empty-cart"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center sm:p-10"
        >
          <p className="text-sm font-bold text-[var(--color-text-secondary)]">Votre panier est vide</p>
        </motion.div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--color-border)] lg:max-h-none">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const stock = Math.max(0, Number(item.quantity ?? 0))
              const price = Number(item.price ?? 0)
              const productQuantityInCart = items
                .filter(
                  (currentItem) => String(currentItem.id) === String(item.id),
                )
                .reduce(
                  (sum, currentItem) => sum + currentItem.cartQuantity,
                  0,
                )
              const stockReached = productQuantityInCart >= stock

              return (
                <motion.div
                  layout
                  key={item.cartItemId}
                  initial={{ x: 18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -18, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black text-[var(--color-text)] sm:text-base">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-[var(--color-text-secondary)]">
                        {priceFormatter.format(price)} l'unité
                      </p>
                      {item.selectedPattern?.name ? (
                        <p className="mt-1 text-xs font-black text-[var(--secondary)]">
                          Motif : {item.selectedPattern.name}
                        </p>
                      ) : null}
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      whileTap={{ scale: 0.9 }}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[#EF4444]/10 hover:text-[var(--color-error)] sm:size-9"
                      aria-label="Supprimer"
                      title="Supprimer"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </motion.button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex h-9 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1 sm:h-10">
                      <motion.button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.cartQuantity - 1)
                        }
                        whileTap={{ scale: 0.9 }}
                        className="grid size-7 place-items-center rounded-md bg-white text-[var(--color-primary)] shadow-sm transition sm:size-8"
                        aria-label={`Diminuer la quantité de ${item.name}`}
                        title="Diminuer"
                      >
                        <Minus size={14} aria-hidden="true" />
                      </motion.button>
                      <motion.span
                        key={item.cartQuantity}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 text-center text-xs font-black text-[var(--color-text)] sm:w-12 sm:text-sm"
                      >
                        {item.cartQuantity}
                      </motion.span>
                      <motion.button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.cartItemId, item.cartQuantity + 1)
                        }
                        disabled={stockReached}
                        whileTap={{ scale: 0.9 }}
                        className="grid size-7 place-items-center rounded-md bg-white text-[var(--color-primary)] shadow-sm transition disabled:opacity-30 sm:size-8"
                        aria-label={`Augmenter la quantité de ${item.name}`}
                        title="Augmenter"
                      >
                        <Plus size={14} aria-hidden="true" />
                      </motion.button>
                    </div>
                    <p className="text-sm font-black text-[var(--color-text)] sm:text-base">
                      {priceFormatter.format(price * item.cartQuantity)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-auto border-t border-[var(--color-border)] p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">Total à payer</p>
            <p className="text-2xl font-black text-[var(--secondary)] sm:text-3xl">
              {priceFormatter.format(total)}
            </p>
          </div>
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)]">{itemCount} article(s)</p>
        </div>

        {showCheckoutButton && (
          <motion.div whileTap={items.length === 0 ? undefined : { scale: 0.98 }}>
            <a
              href="#checkout"
              className={`flex h-12 w-full items-center justify-center rounded-lg px-6 text-sm font-black transition ${
                items.length === 0
                  ? 'pointer-events-none bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                  : 'bg-[var(--secondary)] text-white shadow-lg shadow-[#F040C8]/20 hover:bg-[var(--secondary-light)]'
              }`}
            >
              Passer la commande
            </a>
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

export default Cart
