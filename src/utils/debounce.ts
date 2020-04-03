export type Procedure = (...args: any[]) => void

export default function debounce<F extends Procedure>(func: F, wait = 5000, immediate = false): F {
  wait = Number.isSafeInteger(wait) ? wait : 5000

  let timeoutId: NodeJS.Timeout | undefined

  return function (this: any, ...args: any[]) {
    const context = this

    const doLater = function () {
      timeoutId = undefined
      if (!immediate) {
        func.apply(context, args)
      }
    }

    const shouldCallNow = immediate && timeoutId === undefined

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(doLater, wait)

    if (shouldCallNow) {
      func.apply(context, args)
    }
  } as any
}
