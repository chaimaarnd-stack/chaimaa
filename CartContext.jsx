/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

function getProductStock(product) {
  return Math.max(0, Number(product?.quantity ?? 0))
}

function getProductPrice(product) {
  return Math.max(0, Number(product?.price ?? 0))
}

function sameProduct(leftId, rightId) {
  return String(leftId) === String(rightId)
}

function getPatternId(pattern) {
  return pattern?.id || 'standard'
}

function getPatternName(pattern) {
  return pattern?.name || 'Standard'
}

function makeCartItemId(productId, patternId) {
  return `${productId}-${patternId}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const getProductQuantity = useCallback(
    (productId) =>
      items
        .filter((item) => sameProduct(item.id, productId))
        .reduce((sum, item) => sum + item.cartQuantity, 0),
    [items],
  )

  const addToCart = useCallback(
    (product, selectedPattern) => {
      const stock = getProductStock(product)
      const pattern = {
        id: getPatternId(selectedPattern),
        name: getPatternName(selectedPattern),
        imageUrl: selectedPattern?.imageUrl || '',
      }
      const cartItemId = makeCartItemId(product.id, pattern.id)
      const existing = items.find((item) => item.cartItemId === cartItemId)
      const productQuantityInCart = items
        .filter((item) => sameProduct(item.id, product.id))
        .reduce((sum, item) => sum + item.cartQuantity, 0)

      if (stock <= 0) {
        return {
          ok: false,
          message: 'Ce produit est en rupture de stock.',
        }
      }

      if (productQuantityInCart + 1 > stock) {
        return {
          ok: false,
          message: `Stock disponible limité à ${stock}.`,
        }
      }

      if (existing) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item,
          ),
        )
      } else {
        setItems((currentItems) => [
          ...currentItems,
          {
            ...product,
            cartItemId,
            selectedPattern: pattern,
            price: getProductPrice(product),
            quantity: stock,
            cartQuantity: 1,
          },
        ])
      }

      return {
        ok: true,
        message: `Cartable ajouté - motif ${pattern.name}.`,
      }
    },
    [items],
  )

  const updateQuantity = useCallback((cartItemId, quantity) => {
    const requestedQuantity = Number(quantity)

    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.cartItemId !== cartItemId) {
          return item
        }

        if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
          return []
        }

        const stock = getProductStock(item)
        const otherPatternsQuantity = currentItems
          .filter(
            (currentItem) =>
              sameProduct(currentItem.id, item.id) &&
              currentItem.cartItemId !== cartItemId,
          )
          .reduce((sum, currentItem) => sum + currentItem.cartQuantity, 0)
        const maxQuantityForLine = Math.max(0, stock - otherPatternsQuantity)
        const nextQuantity = Math.min(
          Math.floor(requestedQuantity),
          maxQuantityForLine,
        )

        if (nextQuantity <= 0) {
          return []
        }

        return {
          ...item,
          cartQuantity: nextQuantity,
        }
      }),
    )
  }, [])

  const removeFromCart = useCallback((cartItemId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getItemQuantity = useCallback(
    (productId, selectedPattern) => {
      const cartItemId = makeCartItemId(productId, getPatternId(selectedPattern))
      return (
        items.find((item) => item.cartItemId === cartItemId)?.cartQuantity ?? 0
      )
    },
    [items],
  )

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getProductPrice(item) * item.cartQuantity,
        0,
      ),
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.cartQuantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      total,
      itemCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
      getProductQuantity,
    }),
    [
      items,
      total,
      itemCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemQuantity,
      getProductQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart doit être utilisé dans CartProvider.')
  }

  return context
}
