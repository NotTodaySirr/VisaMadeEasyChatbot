import { Variant } from '../components/ui/Toast/Toaster.jsx'

let ready = false
let queue = []
let bridge = null

export const setNotifier = (fn) => {
  bridge = fn
  ready = true
  if (queue.length) {
    queue.forEach((e) => bridge(e))
    queue = []
  }
}

export const notify = (message, type = Variant.default) => {
  if (!message) return
  const payload = { message, type }
  if (ready && typeof bridge === 'function') bridge(payload)
  else queue.push(payload)
}

export default notify

