import { IMemoOption } from '../types'

export type Procedure = (...args: any[]) => void

export default function debounce<F extends Procedure>(func: F, wait = 1000, options: IMemoOption = {}): F {
  wait = Number.isSafeInteger(wait) ? wait : 1000

  let timeoutId: NodeJS.Timeout | undefined

  return function (this: any, ...args: any[]) {
    const context = this
    const shouldCallNow = options.leading && timeoutId === undefined

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    if (shouldCallNow) {
      func.apply(context, args)
    } else {
      timeoutId = setTimeout(function () {
        timeoutId = undefined
        if (options.trailing !== false) {
          func.apply(context, args)
        }
      }, wait)
    }
  } as any
}
