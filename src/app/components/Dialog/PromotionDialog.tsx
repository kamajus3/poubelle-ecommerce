'use client'

import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ProductItem } from '@/@types'
import clsx from 'clsx'
import { Bounce, toast } from 'react-toastify'
import { URLtoFile } from '@/functions'
import ProductInput from '../ProductInput'

interface FormData {
  title: string
  reduction: number
  startDate: string
  finishDate: string
  description: string
  photo: Blob
}

interface DialogRootProps {
  title: string
  actionTitle: string
  isOpen: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  action: (data: FormData, oldProduct?: ProductItem) => void | Promise<void>
  defaultProduct?: ProductItem
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

const schema = z.object({
  title: z.string().min(6, 'O título deve ter no minimo 6 caracteres').trim(),
  reduction: z
    .number({
      required_error: 'Digite a taxa de redução',
      invalid_type_error: 'A taxa de redução está invalida',
    })
    .positive('A taxa de redução deve ser um número positivo'),
  startDate: z
    .string({
      required_error: 'A data de início é obrigatória',
      invalid_type_error: 'A data de início está invalida',
    })
    .regex(DATETIME_REGEX, 'A data de início está invalida'),
  finishDate: z
    .string({
      required_error: 'A data de termino é obrigatória',
      invalid_type_error: 'A data de termino está invalida',
    })
    .regex(DATETIME_REGEX, 'A data de termino está invalida'),
  description: z
    .string()
    .min(6, 'A descrição me deve ter no minimo 6 caracteres')
    .trim(),
  photo: z
    .instanceof(Blob, {
      message: 'A fotografia é obrigatória',
    })
    .refine(
      (file) => file!.size <= 5 * 1024 * 1024,
      'A fotografia deve ter no máximo 5mB',
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Apenas esses tipos são permitidos .jpg, .jpeg, .png',
    ),
  products: z.array(z.string()).min(40, 'O máximo de producto'),
})

export default function DialogRoot(props: DialogRootProps) {
  const cancelButtonRef = useRef(null)
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (props.defaultProduct?.photo) {
      setPhotoPreview(props.defaultProduct?.photo)
    } else {
      setPhotoPreview(null)
    }
  }, [props.defaultProduct, getValues])

  useEffect(() => {
    async function unsubscribed() {
      if (props.defaultProduct) {
        const photo = await URLtoFile(props.defaultProduct.photo)

        reset(
          {
            ...props.defaultProduct,
            photo,
          },
          {
            keepDefaultValues: true,
            keepDirtyValues: false,
            keepTouched: false,
            keepDirty: false,
          },
        )
      }
    }

    unsubscribed()
  }, [reset, props.defaultProduct])

  async function onSubmit(data: FormData) {
    if (isDirty) {
      if (props.defaultProduct) {
        await props.action(data, props.defaultProduct)
      } else {
        props.action(data)
      }
      props.setOpen(false)
    } else {
      toast.warn('Nenhum campo foi alterado', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }
  }

  return (
    <Transition.Root show={props.isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={props.setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start mx-auto px-5">
                    <article className="mt-2 m-auto w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-semibold leading-6 text-gray-900 mb-8 my-7"
                      >
                        {props.title}
                      </Dialog.Title>
                      <div className="mb-4">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Título
                        </label>
                        <input
                          type="text"
                          id="title"
                          {...register('title')}
                          className={`w-full rounded-lg bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.title && 'border-red-500'}`}
                        />
                        {errors.title && (
                          <p className="text-red-500 mt-1">
                            {errors.title.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Taxa de redução
                        </label>
                        <input
                          type="number"
                          id="reduction"
                          {...register('reduction')}
                          className={`w-full rounded-lg bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.reduction && 'border-red-500'}`}
                        />
                        {errors.reduction && (
                          <p className="text-red-500 mt-1">
                            {errors.reduction.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="start-date"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Início da campanha
                        </label>
                        <input
                          type="datetime-local"
                          id="startDate"
                          {...register('startDate')}
                          className={`w-full rounded-lg bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.startDate && 'border-red-500'}`}
                        />
                        {errors.startDate && (
                          <p className="text-red-500 mt-1">
                            {errors.startDate.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="start-date"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Fim da campanha
                        </label>
                        <input
                          type="datetime-local"
                          id="finishDate"
                          {...register('finishDate')}
                          className={`w-full rounded-lg bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.finishDate && 'border-red-500'}`}
                        />
                        {errors.finishDate && (
                          <p className="text-red-500 mt-1">
                            {errors.finishDate.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          {...register('description')}
                          className={`w-full rounded-lg h-40 resize-none bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.description && 'border-red-500'}`}
                        />
                        {errors.description && (
                          <p className="text-red-500 mt-1">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="products"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Productos da campanha
                        </label>
                        <ProductInput />
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          style={{
                            backgroundImage: `url(${photoPreview})`,
                            backgroundSize: 'cover',
                          }}
                          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:brightness-95 ${errors.photo && 'border-red-500 bg-red-100'}`}
                        >
                          <div
                            className={clsx(
                              'flex flex-col items-center justify-center pt-5 pb-6',
                              {
                                hidden: photoPreview,
                              },
                            )}
                          >
                            <svg
                              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 text-center">
                              <span className="font-semibold">
                                Clique para fazer upload
                              </span>
                              <br />
                              ou arrasta e larga
                            </p>
                          </div>
                          <input
                            type="file"
                            id="dropzone-file"
                            onChange={(e) => {
                              if (
                                e.target.files &&
                                e.target.files?.length !== 0
                              ) {
                                setValue('photo', e.target.files[0])
                                setPhotoPreview(
                                  window.URL.createObjectURL(e.target.files[0]),
                                )
                              }
                            }}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      {errors.photo && (
                        <p className="text-red-500 mt-1">
                          {errors.photo.message}
                        </p>
                      )}
                    </article>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-main px-3 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-75 sm:ml-3 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <div
                        className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      />
                    ) : (
                      <p className="text-white">{props.actionTitle}</p>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => props.setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </form>
        </div>
      </Dialog>
    </Transition.Root>
  )
}