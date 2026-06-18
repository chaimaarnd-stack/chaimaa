import { Loader2, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabaseClient'
import fallbackProductImage from '../assets/img.png'

const priceFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0,
})

function ProductCard({ product }) {
  const [feedback, setFeedback] = useState(null)
  const [motifs, setMotifs] = useState([])
  const [selectedMotif, setSelectedMotif] = useState(null)
  const [loadingMotifs, setLoadingMotifs] = useState(true)

  const { addToCart, getItemQuantity } = useCart()

  // 1. Charger les motifs depuis la table 'product_motifs'
  useEffect(() => {
    let isMounted = true

    async function fetchMotifs() {
      if (!product?.id) return
      setLoadingMotifs(true)

      try {
        const { data, error } = await supabase
          .from('product_motifs')
          .select('id, product_id, name, motif_image_url, cartable_image_url, quantity')
          .eq('product_id', product.id)
          .order('name', { ascending: true })

        if (error) throw error

        if (isMounted) {
          if (data && data.length > 0) {
            setMotifs(data)
            // Au chargement, afficher le premier motif disponible
            setSelectedMotif(data[0])
          } else {
            // Fallback si aucun motif n'est défini en base
            const defaultMotif = {
              id: 'standard',
              name: 'Standard',
              motif_image_url: product.image_url || '',
              cartable_image_url: product.image_url || '',
              quantity: product.quantity || 0
            }
            setMotifs([defaultMotif])
            setSelectedMotif(defaultMotif)
          }
        }
      } catch (err) {
        console.error('Erreur motifs:', err)
        if (isMounted) {
          const fallback = {
            id: 'standard',
            name: 'Standard',
            motif_image_url: product.image_url || '',
            cartable_image_url: product.image_url || '',
            quantity: product.quantity || 0
          }
          setMotifs([fallback])
          setSelectedMotif(fallback)
        }
      } finally {
        if (isMounted) setLoadingMotifs(false)
      }
    }

    fetchMotifs()
    return () => { isMounted = false }
  }, [product])

  // L'image principale dépend du motif sélectionné (Requirement 3)
  const imageUrl = selectedMotif?.cartable_image_url || product.image_url || fallbackProductImage
  const motifName = selectedMotif?.name || 'Standard'
  // Le stock vient du motif (Requirement 5)
  const stock = Math.max(0, Number(selectedMotif?.quantity ?? 0))

  // Structure pour le panier (Requirement 7)
  const currentPattern = {
    id: selectedMotif?.id || 'standard',
    name: motifName,
    imageUrl: imageUrl, // Image du cartable sélectionné
    quantity: stock    // Stock du motif
  }

  const cartQuantity = getItemQuantity(product.id, currentPattern)
  const isInStock = stock > 0
  const canAdd = isInStock && cartQuantity < stock
  const price = priceFormatter.format(Number(product.price ?? 0))

  const handleAdd = () => {
    const result = addToCart(product, currentPattern)
    setFeedback(result)
    setTimeout(() => setFeedback(null), 2200)
  }

  return (
    <motion.article
      layout
      initial={{ y: 18, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-secondary)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={imageUrl}
            src={imageUrl}
            alt={`${product.name} - ${motifName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.04 }}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = fallbackProductImage }}
          />
        </AnimatePresence>

        <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--color-primary)] backdrop-blur-sm">
          {product.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg font-black leading-6 text-[var(--color-text)] sm:text-xl">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xl font-black text-[var(--secondary)]">{price}</p>
          <span className={`text-xs font-bold ${isInStock ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {isInStock ? `${stock} dispo` : 'Épuisé'}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3 mb-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Motif</p>
              <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{motifName}</p>
            </div>
            {cartQuantity > 0 && (
              <p className="text-xs font-bold text-[var(--primary)]">{cartQuantity} au panier</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {loadingMotifs ? (
              <div className="col-span-4 flex justify-center py-4">
                <Loader2 className="animate-spin text-[var(--primary)]" size={20} />
              </div>
            ) : (
              motifs.map((motif) => (
                <button
                  key={motif.id}
                  onClick={() => setSelectedMotif(motif)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedMotif?.id === motif.id
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 scale-105'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img
                    src={motif.motif_image_url || fallbackProductImage}
                    alt={motif.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <motion.button
            whileTap={canAdd ? { scale: 0.96 } : undefined}
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 text-sm font-black text-white transition hover:bg-[var(--primary-dark)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)]"
          >
            {isInStock ? (
              <>
                <Plus size={17} /> {canAdd ? 'Ajouter au Panier' : 'Limite de stock'}
              </>
            ) : 'Rupture de stock'}
          </motion.button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`absolute inset-x-0 top-0 py-2 text-center text-[10px] font-bold text-white ${
                feedback.ok ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default ProductCard
