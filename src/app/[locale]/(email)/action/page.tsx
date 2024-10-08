'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import Loading from '@/components/Loading'
import { useRouter } from '@/navigation'

function EmailAction() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const mode = searchParams.get('mode')
  const actionCode = searchParams.get('oobCode')

  useEffect(() => {
    if (mode && actionCode) {
      switch (mode) {
        case 'resetPassword':
          router.replace(`/change-password/${actionCode}`)
          break
        case 'verifyAndChangeEmail':
          router.replace(`/change-email/${actionCode}`)
          break
        case 'verifyEmail':
          router.replace(`/confirm-email/${actionCode}`)
          break
        case 'recoverEmail':
          break
        default:
      }
    } else {
      router.replace('/')
    }
  }, [router, mode, actionCode])

  return <Loading />
}

export default function EmailActionSuspenseBoundary() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailAction />
    </Suspense>
  )
}
