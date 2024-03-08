'use client'

import React, {
  useState,
  useEffect,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'
import { auth, database } from '@/lib/firebase/config'
import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { child, get, ref, set } from 'firebase/database'
import { UserDatabase } from '@/@types'

interface AuthContextProps {
  user: User | null | undefined
  userDB: UserDatabase | null | undefined
  setUserDB: React.Dispatch<
    React.SetStateAction<UserDatabase | null | undefined>
  >
  initialized: boolean
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<UserDatabase | null>
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<UserDatabase | null>
  logout(): Promise<void>
  setUser: Dispatch<SetStateAction<User | null | undefined>>
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  userDB: null,
  setUserDB: () => {},
  initialized: false,
  setUser: () => {},
  signInWithEmail: () => Promise.resolve(null),
  signUpWithEmail: () => Promise.resolve(null),
  logout: () => Promise.resolve(),
})

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>()
  const [userDB, setUserDB] = useState<UserDatabase | null>()

  async function signInWithEmail(email: string, password: string) {
    const userData = await signInWithEmailAndPassword(auth, email, password)
      .then(async ({ user }) => {
        const snapshot = await get(
          child(ref(database), `users/${user.uid}`),
        ).catch(() => {
          throw new Error('Acounteceu algum erro ao tentar inciar sessão')
        })

        if (snapshot.exists()) {
          setUser(user)
          setUserDB(snapshot.val())
          return snapshot.val() as UserDatabase
        }
        throw new Error('Acounteceu algum erro ao tentar inciar sessão')
      })
      .catch((error: AuthError) => {
        let errorMessage = ''

        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          errorMessage = 'Essa conta não existe'
        } else {
          errorMessage = 'Acounteceu algum erro ao tentar inciar sessão'
        }
        throw new Error(errorMessage)
      })

    return userData
  }

  async function signUpWithEmail(
    name: string,
    email: string,
    password: string,
  ) {
    const userData = await createUserWithEmailAndPassword(auth, email, password)
      .then(async ({ user }) => {
        const userData = {
          firstName: name,
          phone: user.phoneNumber || '',
          privileges: ['client', 'create-orders'],
        }

        await set(ref(database, `users/${user.uid}`), userData).catch(() => {
          throw new Error('Acounteceu algum erro ao criar uma conta')
        })

        setUser(user)
        setUserDB({
          id: user.uid,
          ...userData,
        })

        return {
          ...userData,
          id: user.uid,
        }
      })
      .catch((error: AuthError) => {
        let errorMessage = ''
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Já existe uma conta usando esse endereço de e-mail'
        } else {
          errorMessage = 'Acounteceu algum erro ao tentar criar a conta'
        }
        throw new Error(errorMessage)
      })

    return userData
  }

  async function logout() {
    await auth.signOut().then(() => {
      setUser(null)
      setUserDB(null)
    })
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        get(child(ref(database), `users/${user.uid}`)).then((snapshot) => {
          if (snapshot.exists()) {
            setUserDB(snapshot.val())
          }
        })

        setUser(user)
      }
      setInitialized(true)
    })
    return () => {
      unsubscribe()
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        userDB,
        setUserDB,
        initialized,
        signInWithEmail,
        signUpWithEmail,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
