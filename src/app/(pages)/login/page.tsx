'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Bounce, toast } from 'react-toastify'
import Header from '@/app/components/Header'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'A palavra-passe precisa de no minimo 6 caracteres'),
})

interface FormData {
  email: string
  password: string
}

export default function SignIn() {
  const router = useRouter()
  const { signInWithEmail } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormData) {
    signInWithEmail(data.email, data.password)
      .then(() => {
        router.push('/')
      })
      .catch((e: Error) => {
        toast.error(e.message, {
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
      })
  }

  return (
    <section className="bg-white overflow-hidden">
      <Header.Client />
      <article className="flex justify-center items-center h-screen">
        <div className="space-y-6 text-gray-600 max-w-md max-sm:w-[80%]">
          <h3 className="text-black text-2xl font-bold sm:text-3xl">
            Iniciar sessão
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="font-medium">E-mail</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.email && 'border-red-500'}`}
              />
              {errors.email && (
                <p className="text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="font-medium">Palavra-passe</label>
              <input
                type="password"
                {...register('password')}
                className={`w-full bg-neutral-100 mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${errors.password && 'border-red-500'}`}
              />
              {errors.password && (
                <p className="text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            <div className="mt-5">
              <Link
                href="/recuperar-conta"
                className="hover:text-main font-medium"
              >
                Esqueceu a sua senha?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white font-medium bg-main hover:brightness-90 active:brightness-70 duration-150"
            >
              {isSubmitting ? (
                <div
                  className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                />
              ) : (
                <p className="text-white">Entrar</p>
              )}
            </button>
          </form>
          <p className="text-center font-medium">
            Não tens uma conta?{' '}
            <Link href="/signup" className="text-main">
              Crie uma
            </Link>
          </p>
        </div>
      </article>
    </section>
  )
}
