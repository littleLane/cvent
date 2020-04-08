import { DefTypes } from './utils/constants'
import {
  ICustomEventListener,
  IStrategyOptions,
  IFireEvent,
  IEventListener,
  IEventListenerObj,
  IOnOptions,
} from './types'
import debounce from './utils/debounce'
import { enhanceForEachEvent, getType } from './utils/utils'
import throttle from './utils/throttle'

export default class Cvent {
  private target: EventTarget
  private canIUseNative: boolean
  private eventListeners: IEventListener = {}
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
  on(event: string | string[], eventlistener: ICustomEventListener, options: IOnOptions = { once: false }): Cvent {
    enhanceForEachEvent({
      event,
      listener: eventlistener,
      eachCallback: ({ eventName, listener }) => {
        const eventListenerObj = {
          listener,
          ...options,
        } as IEventListenerObj

        if (eventName in this.eventListeners) {
          this.eventListeners[eventName].push(eventListenerObj)
        } else {
          this.eventListeners[eventName] = [eventListenerObj]
        }

        if (this.canIUseNative) {
          this.target.addEventListener(eventName, listener!, false)
        }
      },
    })

    return this
  }

  /**
   * register events will to be called once
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event
   * @param eventlistener
   */
  once(event: string | string[], eventlistener: ICustomEventListener): Cvent {
    return this.on(event, eventlistener, { once: true })
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

          Object.values(evListeners).forEach((evListener, index) => {
            if (evListener.listener === eventlistener) {
              evListeners.splice(index, 1)
            }
          })

          return
        }

        if (this.canIUseNative) {
          evListeners.forEach((evListener: IEventListenerObj) => {
            this.target.removeEventListener(eventName, evListener.listener, false)
          })
        }

        this.eventListeners[eventName] = []
      },
    })

    return this
  }

  /**
   * emit events
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
   * emit events by debounce
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple event name to be dispatched
   * @param payload Datas to be dispatched
   * @param options Option of debounce
   */
  emitDebounce(
    event: string | string[],
    payload: any = null,
    { wait, leading, trailing }: IStrategyOptions = {}
  ): Cvent {
    enhanceForEachEvent({
      event,
      eachCallback: ({ eventName }) => {
        const cacheEventName = `${eventName}-${wait}-${leading}-${trailing}`

        if (!this.debounceEventEmiters[cacheEventName]) {
          this.debounceEventEmiters[cacheEventName] = debounce(this.fireEvent, wait, { leading, trailing })
        }

        this.debounceEventEmiters[cacheEventName].call(this, eventName, payload)
      },
    })

    return this
  }

  /**
   * emit events by throttle
   *    Support multiple events(Strings are separated by commas or array of strings)
   * @param event Multiple event name to be dispatched
   * @param payload Datas to be dispatched
   * @param options Option of throttle
   */
  emitThrottle(
    event: string | string[],
    payload: any = null,
    { wait, leading, trailing }: IStrategyOptions = {}
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
   * off all events, clear all caches
   */
  destroy() {
    if (this.canIUseNative) {
      for (const eventName in this.eventListeners) {
        this.off(eventName)
      }
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
  private fireEvent(ev: string, payload: any) {
    const firePayload = { detail: payload }
    if (this.canIUseNative) {
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

    const eventListeners = this.eventListeners[ev]
    const eventListenersType = getType(eventListeners)

    if (eventListenersType === DefTypes.ARRAY) {
      eventListeners.forEach(({ listener, once }) => {
        if (once) {
          this.off(ev, listener)
        }

        if (!this.canIUseNative) {
          listener(firePayload)
        }
      })
    }
  }
}
