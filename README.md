# Boutique cartables

Application web B2C e-commerce en React + Vite + Tailwind CSS pour vendre des cartables et des trousses. Tout le parcours client tient sur une seule landing page : hero, catalogue, panier et checkout.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrez l'URL affichee par Vite, par defaut `http://localhost:5173`.

## Configuration Supabase

Creer un fichier `.env` a partir de `.env.example` :

```bash
copy .env.example .env
```

Renseigner ensuite :

```env
VITE_SUPABASE_URL=https://piksmyrzdfxcjjzhqxgo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3NteXJ6ZGZ4Y2pqemhxeGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ0MDM0MywiZXhwIjoyMDk3MDE2MzQzfQ.BfIVXJ9wV_ADIP0mIubXlVNjQOrj_DaK3SSmOwuDA2s
```

Par defaut, les images avec `image_path` sont lues dans le bucket Storage `products`. Vous pouvez changer ce bucket avec `VITE_SUPABASE_PRODUCT_BUCKET`.

## Tables attendues

- `products` : `id`, `name`, `price`, `quantity`, `category`, `image_url` ou `image_path`, `description`, `created_at`
- `customers` : `id`, `full_name`, `phone`, `email`, `address`, `city`
- `orders` : `id`, `customer_id`, `total_amount`, `status`
- `order_items` : `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`

## RPC de stock

La confirmation de commande appelle `decrease_stock(product_id_input, quantity_input)` pour chaque article. Exemple pour des ids en `uuid` :

```sql
create or replace function decrease_stock(
  product_id_input uuid,
  quantity_input integer
)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set quantity = quantity - quantity_input
  where id = product_id_input
    and quantity >= quantity_input;

  if not found then
    raise exception 'Stock insuffisant pour le produit %', product_id_input;
  end if;
end;
$$;
```

## Fonctionnalites

- Landing page responsive unique avec hero, banniere promotionnelle, catalogue, panier et checkout.
- Catalogue Supabase affichant l'ensemble des produits disponibles (sans filtres).
- Images produits via URL publique ou Supabase Storage.
- Panier avec ajout, suppression, modification des quantites et limite par stock.
- Checkout client avec sélection de la Wilaya (69 wilayas d'Algérie).
- Animations Framer Motion sur le hero, les cartes produits, le panier et les messages.
- Creation `customers`, `orders`, `order_items`, puis decrement du stock via RPC Supabase.
