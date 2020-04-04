import { DefTypes } from './utils/constants'
import { ICustomEventListener, IEmitDebounceOptions, IEmitThrottleOptions, IFireEvent } from './types'
import debounce from './utils/debounce'
import { enhanceForEachEvent, getType } from './utils/utils'
import throttle from './utils/throttle'

export default class Cvent {
  private target: EventTarget
  private canIUseNative: boolean
  private eventListeners: Record<string, ICustomEventListener[]> = {}
  private debounceEventEmiters: Record<string, IFireEvent> = {}
  private throttleEventEmiters: Record<string, IFireEvent> = {}

  constructor(target: EventTarget = window) {
    this.target = target
    this.canIUseNative =
      !!this.target &&
      getType(target.addEventListener) === DefTypes.FUNC &&
      getType(target.removeEventListener) === DefTypes.FUNC
  }

  /**
   * 注册事件
   *    支持多事件（字符串用英文逗号隔开或者字符串数组）
   * @param event
   * @param eventlistener
   */
  on(event: string | string[], eventlistener: ICustomEventListener): Cvent {
    enhanceForEachEvent({
      event,
      listener: eventlistener,
      eachCallback: ({ eventName, listener }) => {
        if (eventName in this.eventListeners) {
          this.eventListeners[eventName].push(listener!)
        } else {
          this.eventListeners[eventName] = [listener!]
        }

        if (this.canIUseNative) {
          this.target.addEventListener(eventName, listener!, false)
        }
      },
    })

    return this
  }

  /**
   * 注销事件
   *    支持多事件（字符串用英文逗号隔开或者字符串数组）
   *    支持注销一类事件（只传事件名称，不传事件处理函数）
   * @param event
   * @param eventlistener
   */
  off(event: string | string[], eventlistener?: ICustomEventListener): Cvent {
    enhanceForEachEvent({
      event,
      listener: eventlistener,
      eachCallback: ({ eventName }) => {
        const evListeners = this.eventListeners[eventName]

        if (eventlistener) {
          if (this.canIUseNative) {
            this.target.removeEventListener(eventName, eventlistener, false)
          }

          const indexOf = evListeners.indexOf(eventlistener)

          if (indexOf > -1) {
            evListeners.splice(indexOf, 1)
          }

          return
        }

        if (this.canIUseNative) {
          evListeners.forEach((evListener: ICustomEventListener) => {
            this.target.removeEventListener(eventName, evListener, false)
          })
        }

        this.eventListeners[eventName] = []
      },
    })

    return this
  }

  /**
   * 分发事件
   *    支持多事件分发（字符串用英文逗号隔开或者字符串数组）
   * @param event
   * @param payload
   */
  emit(event: string | string[], payload: any = null): Cvent {
    enhanceForEachEvent({
      event,
      eachCallback: ({ eventName }) => {
        this.fireEvent(eventName, payload)
      },
    })

    return this
  }

  /**
   * 防抖事件分发
   *    支持多事件分发（字符串用英文逗号隔开或者字符串数组）
   * @param event
   * @param payload
   * @param options
   */
  emitDebounce(event: string | string[], payload: any = null, { wait, immediate }: IEmitDebounceOptions = {}): Cvent {
    enhanceForEachEvent({
      event,
      eachCallback: ({ eventName }) => {
        const cacheEventName = `${eventName}-${wait}-${immediate}`

        if (!this.debounceEventEmiters[cacheEventName]) {
          this.debounceEventEmiters[cacheEventName] = debounce(this.fireEvent, wait, immediate)
        }

        this.debounceEventEmiters[cacheEventName].call(this, eventName, payload)
      },
    })

    return this
  }

  /**
   * 节流事件分发
   *    支持多事件分发（字符串用英文逗号隔开或者字符串数组）
   * @param event
   * @param payload
   * @param options
   */
  emitThrottle(
    event: string | string[],
    payload: any = null,
    { wait, leading, trailing }: IEmitThrottleOptions = {}
  ): Cvent {
    enhanceForEachEvent({
      event,
      eachCallback: ({ eventName }) => {
        const cacheEventName = `${eventName}-${wait}-${leading}-${trailing}`

        if (!this.throttleEventEmiters[cacheEventName]) {
          this.throttleEventEmiters[cacheEventName] = throttle(this.fireEvent, wait, { leading, trailing })
        }

        this.throttleEventEmiters[cacheEventName].call(this, eventName, payload)
      },
    })

    return this
  }

  /**
   * 单个事件分发逻辑
   * @param ev
   * @param payload
   */
  private fireEvent(ev: string, payload: any = null) {
    const firePayload = { detail: payload }

    // 不支持浏览器事件处理方案就降级到队列处理
    if (!this.canIUseNative) {
      this.eventListeners[ev].forEach((listener) => listener(firePayload))
      return
    }

    let customEvent: CustomEvent

    try {
      customEvent = new CustomEvent(ev, firePayload)
    } catch (error) {
      // for IE 9 ~ 11
      customEvent = document.createEvent('CustomEvent')
      customEvent.initCustomEvent(ev, false, false, payload)
    }

    this.target.dispatchEvent(customEvent)
  }
}
