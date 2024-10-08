/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Formats,
  MarkupTranslationValues,
  RichTranslationValues,
  TranslationValues,
} from 'next-intl'

export interface IProductCampaign {
  id: string
  title: string
  reduction?: string
  startDate?: string
  endDate?: string
}

export type IProduct = {
  id: string
  name: string
  nameLowerCase: string
  quantity: number
  price: number
  views: number
  category: string
  photo: string
  description: string
  campaign?: IProductCampaign
  createdAt: string
  updatedAt: string
}

export type IProductView = {
  userId: string
  productId: string
  createdAt: string
}

export interface IProductCart {
  id: string
  quantity: number
}

export interface IQuery {
  orderBy?: string
  limit?: number
  orderDirection?: 'asc' | 'desc'
  filterBy?: { [key: string]: string | number | boolean }
  filterById?: string
  exceptionId?: string
}

export interface IProductInput {
  id: string
  name: string
}

export type ICampaignBase = {
  id: string
  title: string
  description: string
  default: boolean
  fixed: boolean
  reduction?: string
  startDate?: string
  endDate?: string
  photo: string
  createdAt: string
  updatedAt: string
}

export type ICampaign = ICampaignBase & {
  products?: string[]
}

export type CategoryLabel =
  | 'baby'
  | 'hygiene'
  | 'health'
  | 'insecticides'
  | 'food'

export interface ICategory {
  label: CategoryLabel
  img: string
}

export interface IProductOrder {
  id: string
  name: string
  quantity: number
  price: number
  promotion?: number
}

export interface IPhone {
  number: string
  ddd: string
}

export type IOrder = {
  id: string
  userId: string
  firstName: string
  lastName: string
  address: string
  phone: IPhone
  state: 'not-sold' | 'sold'
  products: IProductOrder[]
  createdAt: string
  updatedAt: string
}

export type EnumUserRole = 'client' | 'admin'

export type IUser = {
  id: string
  firstName: string
  lastName?: string
  address?: string
  phone?: IPhone
  role: EnumUserRole
  createdAt: string
  updatedAt: string
}

export type NextIntlTProps = {
  (key: string, values?: TranslationValues, formats?: Partial<Formats>): string

  rich(
    key: string,
    values?: RichTranslationValues,
    formats?: Partial<Formats>,
  ): string | React.ReactElement | React.ReactNodeArray

  markup(
    key: string,
    values?: MarkupTranslationValues,
    formats?: Partial<Formats>,
  ): string

  raw(key: string): any
}

export type LocaleKey = 'en' | 'fr'
