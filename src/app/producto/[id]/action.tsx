'use client'

import { useEffect, useState } from 'react'

import { IProduct } from '@/@types'
import Button from '@/components/ui/Button'
import useCartStore from '@/store/CartStore'
import useUserStore from '@/store/UserStore'
import useViewStore from '@/store/ViewStore'

export default function PostAction(product: IProduct) {
  const [quantity, setQuantity] = useState(1)
  const viewProduct = useViewStore((state) => state.viewProduct)

  const cartProducts = useCartStore((state) => state.products)
  const AddToCart = useCartStore((state) => state.addProduct)
  const removeFromCart = useCartStore((state) => state.removeProduct)

  const IsproductInCart = !!cartProducts.find((p) => p.id === product?.id)

  const userDB = useUserStore((state) => state.data)
  const userIsAdmin = userDB ? userDB.role === 'admin' : false

  const increaseQuantity = () => {
    setQuantity((quantity) => quantity + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((quantity) => quantity - 1)
    }
  }

  useEffect(() => {
    viewProduct(product.id)
  }, [viewProduct, product.id])

  return (
    <div>
      <div className="flex mt-4">
        <button
          className="bg-black rounded-l-md hover:brightness-90 active:brightness-75 font-semibold h-12 w-12"
          onClick={decreaseQuantity}
          disabled={userIsAdmin || IsproductInCart || quantity === 1}
        >
          -
        </button>
        <input
          className="w-16 h-12 text-center bg-gray-100 disabled:text-disabledText text-black font-medium outline-none border-b border-t"
          type="number"
          value={quantity}
          max={product.quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          disabled={userIsAdmin || IsproductInCart || product.quantity === 0}
        />
        <button
          className="bg-black rounded-r-md hover:brightness-90 active:brightness-75 font-semibold h-12 w-12"
          onClick={increaseQuantity}
          disabled={
            userIsAdmin ||
            IsproductInCart ||
            product.quantity === 0 ||
            quantity === product.quantity
          }
        >
          +
        </button>
      </div>
      {IsproductInCart && !userIsAdmin ? (
        <Button
          onClick={() => {
            if (product?.id) {
              removeFromCart(product?.id)
              setQuantity(1)
            }
          }}
          className="h-12 mt-4 bg-red-500"
          disabled={userIsAdmin || product.quantity === 0}
        >
          Remover do carrinho
        </Button>
      ) : (
        <Button
          onClick={() => {
            if (product?.id) {
              AddToCart({
                ...product,
                quantity,
              })
            }
          }}
          className="h-12 mt-4 bg-secondary"
          disabled={userIsAdmin || product.quantity === 0}
        >
          Adicionar ao carrinho
        </Button>
      )}
    </div>
  )
}
