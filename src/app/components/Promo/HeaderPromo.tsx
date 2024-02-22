interface HeaderPromoProps {
  title: string
}

export default function HeaderPromo(props: HeaderPromoProps) {
  return (
    <div className="w-full text-white bg-main p-4 text-center text-sm">
      {props.title}
    </div>
  )
}