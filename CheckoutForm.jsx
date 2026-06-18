import { AlertCircle, CheckCircle2, Loader2, Send, Home, Briefcase } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'

const WILAYAS = [
  { code: '01', nom: 'Adrar' },
  { code: '02', nom: 'Chlef' },
  { code: '03', nom: 'Laghouat' },
  { code: '04', nom: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna' },
  { code: '06', nom: 'Béjaïa' },
  { code: '07', nom: 'Biskra' },
  { code: '08', nom: 'Béchar' },
  { code: '09', nom: 'Blida' },
  { code: '10', nom: 'Bouira' },
  { code: '11', nom: 'Tamanrasset' },
  { code: '12', nom: 'Tébessa' },
  { code: '13', nom: 'Tlemcen' },
  { code: '14', nom: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou' },
  { code: '16', nom: 'Alger' },
  { code: '17', nom: 'Djelfa' },
  { code: '18', nom: 'Jijel' },
  { code: '19', nom: 'Sétif' },
  { code: '20', nom: 'Saïda' },
  { code: '21', nom: 'Skikda' },
  { code: '22', nom: 'Sidi Bel Abbès' },
  { code: '23', nom: 'Annaba' },
  { code: '24', nom: 'Guelma' },
  { code: '25', nom: 'Constantine' },
  { code: '26', nom: 'Médéa' },
  { code: '27', nom: 'Mostaganem' },
  { code: '28', nom: "M'Sila" },
  { code: '29', nom: 'Mascara' },
  { code: '30', nom: 'Ouargla' },
  { code: '31', nom: 'Oran' },
  { code: '32', nom: 'El Bayadh' },
  { code: '33', nom: 'Illizi' },
  { code: '34', nom: 'Bordj Bou Arréridj' },
  { code: '35', nom: 'Boumerdès' },
  { code: '36', nom: 'El Tarf' },
  { code: '37', nom: 'Tindouf' },
  { code: '38', nom: 'Tissemsilt' },
  { code: '39', nom: 'El Oued' },
  { code: '40', nom: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras' },
  { code: '42', nom: 'Tipaza' },
  { code: '43', nom: 'Mila' },
  { code: '44', nom: 'Aïn Defla' },
  { code: '45', nom: 'Naâma' },
  { code: '46', nom: 'Aïn Témouchent' },
  { code: '47', nom: 'Ghardaïa' },
  { code: '48', nom: 'Relizane' },
  { code: '49', nom: 'Timimoun' },
  { code: '50', nom: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal' },
  { code: '52', nom: 'Béni Abbès' },
  { code: '53', nom: 'In Salah' },
  { code: '54', nom: 'In Guezzam' },
  { code: '55', nom: 'Touggourt' },
  { code: '56', nom: 'Djanet' },
  { code: '57', nom: "El M'Ghair" },
  { code: '58', nom: 'El Meniaa' },
  { code: '59', nom: 'Aflou' },
  { code: '60', nom: 'Barika' },
  { code: '61', nom: 'El Kantara' },
  { code: '62', nom: 'Bir El Ater' },
  { code: '63', nom: 'El Aricha' },
  { code: '64', nom: 'Ksar Chellala' },
  { code: '65', nom: 'Aïn Ouessara' },
  { code: '66', nom: 'Messaad' },
  { code: '67', nom: 'Ksar El Boukhari' },
  { code: '68', nom: 'Bou Saâda' },
  { code: '69', nom: 'El Abiodh Sidi Cheikh' },
]

const initialForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  deliveryType: 'domicile',
}

const labelClass = 'text-sm font-black text-[var(--color-text)]'
const fieldClass =
  'mt-2 h-12 w-full rounded-lg border border-[var(--color-border)] px-4 font-semibold text-[var(--color-text)] outline-none transition focus:border-[var(--secondary)] focus:ring-4 focus:ring-[#F040C8]/20'
const selectFieldClass = `${fieldClass} bg-white`

function validateForm(form, items) {
  if (items.length === 0) {
    return 'Votre panier est vide.'
  }

  if (!form.fullName.trim()) {
    return 'Le nom complet est obligatoire.'
  }

  if (!form.phone.trim()) {
    return 'Le téléphone est obligatoire.'
  }

  if (!form.address.trim()) {
    return "L'adresse est obligatoire."
  }

  if (!form.city) {
    return 'Veuillez choisir votre wilaya.'
  }

  return ''
}

function CheckoutForm() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const { items, total, clearCart } = useCart()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm(form, items)
    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    if (!isSupabaseConfigured) {
      setStatus({
        type: 'error',
        message:
          'Configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY avant de confirmer une commande.',
      })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city,
          delivery_type: form.deliveryType,
        })
        .select()
        .single()

      if (customerError) {
        throw customerError
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: total,
          status: 'pending',
          delivery_type: form.deliveryType,
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.cartQuantity,
        unit_price: Number(item.price ?? 0),
        subtotal: Number(item.price ?? 0) * item.cartQuantity,
        motif: item.selectedPattern?.name || null, // Enregistrement du motif sélectionné
      }))

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (orderItemsError) {
        throw orderItemsError
      }

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrease_stock', {
          product_id_input: item.id,
          quantity_input: item.cartQuantity,
        })

        if (stockError) {
          throw stockError
        }
      }

      setStatus({
        type: 'success',
        message: `Commande confirmée avec succès. Référence: ${order.id}`,
      })
      setForm(initialForm)
      clearCart()
    } catch (error) {
      console.error('Détails de l\'erreur Supabase:', error)
      setStatus({
        type: 'error',
        message:
          error?.message ||
          'Une erreur est survenue pendant la création de la commande.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm sm:p-5"
    >
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-[var(--secondary)]">
          Checkout
        </p>
        <h1 className="mt-2 text-2xl font-black text-[var(--color-text)] sm:text-3xl">
          Informations client
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
          Remplissez vos coordonnées pour confirmer la commande.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Nom complet
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            className={fieldClass}
            placeholder="Ex: Amine Benali"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className={fieldClass}
            placeholder="0550 00 00 00"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className={labelClass}>
              Wilaya
            </label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className={selectFieldClass}
            >
              <option value="">Choisir...</option>
              {WILAYAS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.nom}>
                  {wilaya.code} - {wilaya.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className={labelClass}>
              Adresse précise
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              className={fieldClass}
              placeholder="Rue, quartier, n°"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className={labelClass}>Mode de livraison</label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, deliveryType: 'domicile' })}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition ${
                form.deliveryType === 'domicile'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md'
                  : 'border-[var(--color-border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <Home className={form.deliveryType === 'domicile' ? 'text-[var(--primary)]' : 'text-slate-400'} size={24} />
              <span className={`text-xs font-black uppercase tracking-tight ${form.deliveryType === 'domicile' ? 'text-[var(--color-text)]' : 'text-slate-500'}`}>
                À Domicile
              </span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, deliveryType: 'bureau' })}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition ${
                form.deliveryType === 'bureau'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md'
                  : 'border-[var(--color-border)] hover:border-[var(--primary)]/50'
              }`}
            >
              <Briefcase className={form.deliveryType === 'bureau' ? 'text-[var(--primary)]' : 'text-slate-400'} size={24} />
              <span className={`text-xs font-black uppercase tracking-tight ${form.deliveryType === 'bureau' ? 'text-[var(--text-color)]' : 'text-slate-500'}`}>
                Au Bureau
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {status.message ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-lg border p-4 ${
                status.type === 'success'
                  ? 'border-[var(--color-success)] bg-[#22C55E]/10 text-[var(--color-text)]'
                  : 'border-[var(--color-error)] bg-[#EF4444]/10 text-[var(--color-text)]'
              }`}
            >
              <div className="flex gap-3">
                {status.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                ) : (
                  <AlertCircle className="mt-0.5 shrink-0" size={20} />
                )}
                <p className="text-sm font-bold leading-6">{status.message}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={submitting || items.length === 0}
          whileTap={submitting || items.length === 0 ? undefined : { scale: 0.98 }}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] sm:text-base"
        >
          <span className="flex items-center gap-2">
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={19} aria-hidden="true" />
                <span>Confirmation...</span>
              </>
            ) : (
              <>
                <Send size={18} aria-hidden="true" />
                <span>Confirmer la commande</span>
              </>
            )}
          </span>
        </motion.button>
      </form>
    </motion.section>
  )
}

export default CheckoutForm
