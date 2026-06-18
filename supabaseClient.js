import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const productImageBucket =
  import.meta.env.VITE_SUPABASE_PRODUCT_BUCKET || 'products'

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'public-anon-key',
)

export function getProductImageUrl(product) {
  const directImage = product?.image_url || product?.imageUrl
  const storagePath =
    product?.image_path || product?.storage_path || product?.image

  if (directImage?.startsWith?.('http')) {
    return directImage
  }

  const path = directImage || storagePath
  if (!path) {
    return ''
  }

  if (path.startsWith('http')) {
    return path
  }

  const bucket = product?.image_bucket || product?.bucket || productImageBucket
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
