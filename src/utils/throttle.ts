export type Procedure = (...args: any[]) => void

interface IOption {
  leading?: boolean // false => first time will not be called
  trailing?: boolean // false => last time will not be called
}

export default function throttle<F extends Procedure>(func: F, wait = 500, options: IOption = {}) {
  wait = Number.isSafeInteger(wait) ? wait : 500

  let timeoutId: NodeJS.Timeout | undefined
  let previous = 0

  return function (this: any, ...args: any[]) {
    const now = +new Date()

    if (!previous && options.leading === false) {
      previous = now
    }

    const remaining = wait - (now - previous)
    const context = this

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = undefined
      }

      previous = now
      func.apply(context, args)
    } else if (!timeoutId && options.trailing !== false) {
      const doLater = function () {
        previous = options.leading === false ? 0 : +new Date()
        clearTimeout(timeoutId as NodeJS.Timeout)
        timeoutId = undefined
        func.apply(context, args)
      }

      timeoutId = setTimeout(doLater, remaining)
    }
  }
}
