'use client'

import Header from '@/app/components/Header'
import { ProductItem } from '@/@types'
import Image from 'next/image'
import Dialog from '@/app/components/Dialog'
import { useEffect, useState } from 'react'
import { toast, Bounce } from 'react-toastify'
import useMoneyFormat from '@/hooks/useMoneyFormat'
import { onValue, ref, remove, set, update } from 'firebase/database'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { database, storage } from '@/lib/firebase/config'
import { randomBytes } from 'crypto'
import { URLtoFile, publishedSince } from '@/functions'

interface FormData {
  name: string
  quantity: number
  price: number
  category: string
  description: string
  photo: Blob
}

interface CartTableRow {
  product: ProductItem
  deleteProduct(): void
  editProduct(data: FormData, oldProduct?: ProductItem): Promise<void>
}

function CartTableRow({ product, deleteProduct, editProduct }: CartTableRow) {
  const money = useMoneyFormat()
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  return (
    <tr className="border-y border-gray-200 border-y-[#dfdfdf]">
      <td className="p-3">
        <div className="flex items-center justify-center">
          <Image
            width={70}
            height={70}
            src={product.photo}
            alt={product.name}
            draggable={false}
            className="select-none"
          />
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-black font-medium">{product.name}</div>
      </td>
      <td className="p-3">
        <div className="text-center text-black font-medium">
          {product.category}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-[#919298] font-medium">
          {money.format(product.price)}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-[#919298] font-medium">
          {product.quantity}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-[#919298] font-medium">
          {publishedSince(product.updatedAt)}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            <span className="text-red-500 font-medium">Apagar</span>
          </button>
        </div>
        <Dialog.Delete
          title="Remover producto"
          description="Você tem certeza que queres remover esse producto do estoque?"
          actionTitle="Remover"
          action={deleteProduct}
          isOpen={openDeleteModal}
          setOpen={setOpenDeleteModal}
        />
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setOpenEditModal(true)}
            className="text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            <span className="text-violet-600 font-medium">Editar</span>
          </button>
        </div>
        <Dialog.Product
          title="Editar producto"
          actionTitle="Editar"
          isOpen={openEditModal}
          setOpen={setOpenEditModal}
          action={editProduct}
          defaultProduct={{ ...product }}
        />
      </td>
    </tr>
  )
}

export default function ProductPage() {
  const [productData, setProductData] = useState<Record<string, ProductItem>>(
    {},
  )

  const [newModal, setNewModal] = useState(false)

  function postProduct(data: FormData) {
    const postId = randomBytes(20).toString('hex')
    const reference = storageRef(storage, `/products/${postId}`)

    uploadBytes(reference, data.photo)
      .then(async () => {
        const photo = await getDownloadURL(reference)
        set(ref(database, 'products/' + postId), {
          name: data.name,
          nameLowerCase: data.name.toLocaleLowerCase(),
          quantity: data.quantity,
          price: data.price,
          category: data.category,
          description: data.description,
          photo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
          .then(() => {
            toast.success(`Producto postada com sucesso`, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            })
          })
          .catch((error: string) => {
            toast.error(`Erro a fazer a postagem ${error}`, {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            })
          })
      })
      .catch((error) => {
        toast.error(`Erro a fazer a postagem ${error}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        })
      })
  }

  async function editProduct(data: FormData, oldProduct?: ProductItem) {
    if (oldProduct && oldProduct.id) {
      const reference = storageRef(storage, `/products/${oldProduct.id}`)
      const oldPhoto = await URLtoFile(oldProduct.photo)

      if (oldPhoto !== data.photo) {
        await uploadBytes(reference, data.photo)
      }

      update(ref(database, `/products/${oldProduct.id}`), {
        name: data.name,
        nameLowerCase: data.name.toLocaleLowerCase(),
        quantity: data.quantity,
        price: data.price,
        category: data.category,
        description: data.description,
        photo: oldProduct.photo,
        updatedAt: new Date().toISOString(),
      })
        .then(() => {
          toast.success(`Producto editado com sucesso`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          })
        })
        .catch((error) => {
          toast.error(`Erro a fazer a postagem ${error}`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          })
        })
    } else {
      toast.error(`Erro a editar o produto`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }
  }

  async function deleteProduct(id: string) {
    const databaseReference = ref(database, `products/${id}`)
    const storageReference = storageRef(storage, `products/${id}`)

    try {
      await remove(databaseReference)
      await deleteObject(storageReference)
      toast.success(`Produto eliminado com sucesso`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    } catch (error) {
      toast.error(`Erro a apagar o produto`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }
  }

  useEffect(() => {
    const reference = ref(database, 'products/')
    onValue(reference, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProductData(data)
      }
    })
  }, [])

  return (
    <section className="bg-white overflow-hidden min-h-screen">
      <Header.Admin />

      <article className="mb-2 mt-12">
        <p className="text-black font-semibold text-3xl p-9">Meus productos</p>

        <div className="mb-10 px-8 gap-y-5">
          <button
            onClick={() => {
              setNewModal(true)
            }}
            className="border border-gray-300 p-4 px-10 mb-3 bg-main text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 select-none"
          >
            Adicionar producto
          </button>
        </div>
      </article>

      <article className="container mx-auto mt-8 mb-8 max-sm:p-9">
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-[#dddddd]">
            <thead>
              <tr className="bg-[#F9FAFB] text-gray-600 uppercase text-sm">
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Foto
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Nome
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Categória
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Preço
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Quantidade
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  Atualização
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  -
                </th>
                <th className="p-3 capitalize font-semibold text-base text-[#111827]">
                  -
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {Object.entries(productData).map(([id, product]) => (
                <CartTableRow
                  key={id}
                  product={{
                    ...product,
                    id,
                  }}
                  deleteProduct={() => {
                    deleteProduct(id)
                  }}
                  editProduct={editProduct}
                />
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <Dialog.Product
        title="Novo producto"
        actionTitle="Postar"
        isOpen={newModal}
        setOpen={setNewModal}
        action={postProduct}
      />
    </section>
  )
}