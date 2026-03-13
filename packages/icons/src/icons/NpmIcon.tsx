import type { LucideProps } from "lucide-react"

export default function NpmIcon({ className, ...props }: LucideProps) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path fill="#C12127" d="M0 16V0h16v16ZM3 3v10h5V5h3v8h2V3Z" />
      <path fill="#FFF" d="M3 3h10v10h-2V5H8v8H3Z" />
    </svg>
  )
}
