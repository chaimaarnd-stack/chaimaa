import Cart from '../components/Cart'
import CheckoutForm from '../components/CheckoutForm'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import ProductList from '../components/ProductList'

function Home() {
  return (
    <div id="home" className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Hero />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ProductList />

          <aside id="cart" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
            <Cart />
          </aside>
        </div>

        <section id="checkout" className="mt-8 scroll-mt-24 sm:mt-12">
          <CheckoutForm />
        </section>
      </main>
    </div>
  )
}

export default Home
