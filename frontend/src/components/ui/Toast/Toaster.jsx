import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { setNotifier } from '../../../services/notify.js'

export const Variant = Object.freeze({ default: 0, success: 1, error: 2, warning: 3 })
export const VariantName = Object.freeze(Object.keys(Variant).reduce((acc, k) => (acc[Variant[k]] = k, acc), {}))

export const Position = Object.freeze({
  'top-left': 0,
  'top-center': 1,
  'top-right': 2,
  'bottom-left': 3,
  'bottom-center': 4,
  'bottom-right': 5,
})
export const PositionName = Object.freeze(Object.keys(Position).reduce((acc, k) => (acc[Position[k]] = k, acc), {}))

const variantBorders = {
  [Variant.default]: '#e5e7eb',
  [Variant.success]: 'rgba(22,163,74,0.5)',
  [Variant.error]: 'rgba(220,38,38,0.5)',
  [Variant.warning]: 'rgba(217,119,6,0.5)',
}

const titleColors = {
  [Variant.default]: '#111827',
  [Variant.success]: '#15803d',
  [Variant.error]: '#b91c1c',
  [Variant.warning]: '#b45309',
}

const iconColors = {
  [Variant.default]: '#6b7280',
  [Variant.success]: '#16a34a',
  [Variant.error]: '#dc2626',
  [Variant.warning]: '#d97706',
}

const variantIcons = {
  [Variant.default]: Info,
  [Variant.success]: CheckCircle,
  [Variant.error]: AlertCircle,
  [Variant.warning]: AlertTriangle,
}

// animations disabled to avoid hook/runtime conflicts; can re-enable later

const Toaster = forwardRef(function Toaster({ defaultPosition = 'top-center' }, ref) {
  const lastToastIdRef = useRef(null)

  useEffect(() => {
    setNotifier(({ message, type }) => {
      const v = typeof type === 'number' ? type : (Variant[type] ?? Variant.default)
      show({ message, variant: v, position: defaultPosition })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function show({ title, message, variant = Variant.default, duration = 3000, position = defaultPosition, onDismiss }) {
    const Icon = variantIcons[variant] || Info
    lastToastIdRef.current = sonnerToast.custom(
      (toastId) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 360,
          padding: '10px 12px',
          borderRadius: 12,
          border: `1px solid ${variantBorders[variant]}`,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          background: '#ffffff',
          color: '#111827',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
            <Icon style={{ height: 16, width: 16, marginTop: 2, flexShrink: 0, color: iconColors[variant] }} />
            <div>
              {title && (
                <h3 style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.1, margin: 0, color: titleColors[variant] }}>{title}</h3>
              )}
              <p style={{ fontSize: 12, color: '#4b5563', margin: 0, marginTop: title ? 2 : 0 }}>{message}</p>
            </div>
          </div>
          <button
            onClick={() => {
              sonnerToast.dismiss(toastId)
              onDismiss && onDismiss()
            }}
            style={{
              border: 'none',
              background: 'transparent',
              borderRadius: 999,
              padding: 4,
              cursor: 'pointer',
            }}
            aria-label="Dismiss notification"
          >
            <X style={{ height: 12, width: 12, color: '#6b7280' }} />
          </button>
        </div>
      ),
      { duration, position }
    )
  }

  useImperativeHandle(ref, () => ({ show }))

  return (
    <SonnerToaster position={defaultPosition} toastOptions={{ unstyled: true }} visibleToasts={1} />
  )
})

export default Toaster


