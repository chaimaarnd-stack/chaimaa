import { AlertCircle, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import ProductCard from './ProductCard'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(() =>
    isSupabaseConfigured
      ? ''
      : 'Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre fichier .env.',
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      const { data, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (productsError) setError(productsError.message)
      else setProducts(data ?? [])
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const selectedCartable = useMemo(() => {
    const cartables = products.filter(
      (product) => product.category?.toLowerCase() === 'cartable',
    )

    return (
      cartables.find((product) => Number(product.quantity ?? 0) > 0) ??
      cartables[0]
    )
  }, [products])

  return (
    <motion.section
      id="products"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="scroll-mt-20"
    >
      <div className="mb-6 space-y-4 text-center lg:text-left">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)] sm:text-xs">
            Catalogue
          </p>
          <h2 className="text-2xl font-black text-[var(--color-text)] sm:text-3xl">
            Choisissez votre cartable
          </h2>
        </div>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto flex h-40 max-w-md items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)]"
        >
          <Loader2 className="animate-spin" size={24} />
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-lg border border-[var(--color-warning)] bg-[#F59E0B]/10 p-4 text-xs font-bold leading-5 text-[var(--color-text)]"
        >
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        </motion.div>
      ) : !selectedCartable ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-10 text-center text-sm font-bold text-[var(--color-text-secondary)]"
        >
          Aucun cartable trouvé.
        </motion.p>
      ) : (
        <motion.div layout className="mx-auto max-w-md">
          <AnimatePresence mode="wait">
            <ProductCard key={selectedCartable.id} product={selectedCartable} />
          </AnimatePresence>
        </motion.div>
      )}
    </motion.section>
  )
}

export default ProductList
