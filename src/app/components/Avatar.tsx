'use client'

import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'
import { User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'

export default function Avatar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative bg-white" ref={dropdownRef}>
      <button
        className={clsx(
          'inline-flex justify-center w-full border shadow-sm p-2 rounded-full bg-main text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100',
          {
            'bg-red-500': !user,
          },
        )}
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={toggleMenu}
      >
        <User color="#fff" size={27} />
      </button>

      {isOpen && (
        <div className="absolute min-w-32 right-0 mt-2 bg-white border rounded-md shadow-lg z-10">
          <div className="pt-1">
            <p className="text-sm px-4 py-2 text-gray-800 border-b">
              Logado em <strong>{user?.email}</strong>
            </p>
            <Link
              href="/admin/dashboard"
              className={clsx(
                'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
                {
                  'bg-main text-white hover:bg-main':
                    pathname === '/admin/dashboard',
                },
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className={clsx(
                'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
                {
                  'bg-main text-white hover:bg-main':
                    pathname === '/admin/products',
                },
              )}
            >
              Produtos
            </Link>
            <Link
              href="/admin/promotions"
              className={clsx(
                'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
                {
                  'bg-main text-white hover:bg-main':
                    pathname === '/admin/promotions',
                },
              )}
            >
              Minhas campanhas
            </Link>
            <Link
              href="/admin/logout"
              className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-200"
            >
              Terminar sessão
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
