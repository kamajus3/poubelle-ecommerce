'use client'

import Loading from '@/components/ui/Loading'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Logout() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function unsubscribed() {
      await logout()
      router.replace('/')
    }

    unsubscribed()
  }, [logout, router])

  return <Loading />
}
