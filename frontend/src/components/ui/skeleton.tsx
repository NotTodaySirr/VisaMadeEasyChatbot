import React, { useEffect } from "react"

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ")
}

let injected = false

export function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  useEffect(() => {
    if (injected) return
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-skeleton-shimmer', 'true')
    styleEl.innerHTML = `@keyframes vm_shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}`
    document.head.appendChild(styleEl)
    injected = true
  }, [])

  const baseStyle: React.CSSProperties = {
    borderRadius: 8,
    background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 37%, #e5e7eb 63%)',
    backgroundSize: '200% 100%',
    animation: 'vm_shimmer 1.2s linear infinite',
  }

  return (
    <div
      className={cn(className)}
      style={{ ...baseStyle, ...style }}
      {...props}
    />
  )
}

export default Skeleton


