'use client'

import { createContext, ReactNode, useEffect, useState } from 'react'
import { child, get, ref } from 'firebase/database'

import { database } from '@/lib/firebase/config'

interface InformationsProps {
  defaultCampaign: string | null
  fixedCampaign: string | null
}

interface InformationContextProps {
  informationsData: InformationsProps
}

export const InformationContext = createContext<InformationContextProps>({
  informationsData: {
    defaultCampaign: null,
    fixedCampaign: null,
  },
})

export default function InformationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [informationsData, setInformationsData] = useState<InformationsProps>({
    defaultCampaign: null,
    fixedCampaign: null,
  })

  useEffect(() => {
    async function unsubscribed() {
      get(child(ref(database), 'informations/')).then((snapshot) => {
        if (snapshot.exists()) {
          setInformationsData(snapshot.val())
        }
      })
    }

    unsubscribed()
  }, [])

  return (
    <InformationContext.Provider value={{ informationsData }}>
      {children}
    </InformationContext.Provider>
  )
}