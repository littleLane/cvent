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
   * register events
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple names of events to be registered
   * @param eventlistener Event handler
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
   * cancel events
   *    Support multiple events(Strings are separated by commas or array of strings)
   *    Support to cancel a type of event (only pass the event name, not pass the event processing function)
   * @param event Multiple names of events to be canceled
   * @param eventlistener Event handler
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
   * dispatch events
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple names of events to be dispatched
   * @param payload Event handler
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
   * dispatch events by debounce
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple event name to be dispatched
   * @param payload Datas to be dispatched
   * @param options Option of debounce
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
   * dispatch events by throttle
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple event name to be dispatched
   * @param payload Datas to be dispatched
   * @param options Option of throttle
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

  destroy() {
    if (this.canIUseNative) {
      Object.keys(this.eventListeners).forEach((eventName: string) => {
        this.off(eventName)
      })
    }
    this.eventListeners = {}
    this.debounceEventEmiters = {}
    this.throttleEventEmiters = {}
  }

  /**
   * Real logic of single event to be dispatched
   * @param ev Single event name
   * @param payload Datas to be dispatched
   */
  private fireEvent(ev: string, payload: any = null) {
    const firePayload = { detail: payload }

    // Downgrade to queue processing if the browser event handling scheme is not supported
    if (!this.canIUseNative) {
      const eventListeners = this.eventListeners[ev]
      const eventListenersType = getType(eventListeners)

      if (eventListenersType === DefTypes.ARRAY) {
        eventListeners.forEach((listener) => listener(firePayload))
      }
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
