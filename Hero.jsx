import { motion } from 'framer-motion'
import heroImage from '../assets/nn .png'

function Hero() {
  return (
    <section className="w-full overflow-hidden">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        src={heroImage}
        alt="Bannière Boutique"
        className="w-full h-auto block"
      />
    </section>
  )
}

export default Hero
