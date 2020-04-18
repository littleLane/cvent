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
  private target: EventTarget | null
  private canIUseNative: boolean
  private eventListeners: IEventListener | null = {}
  private debounceEventListeners: Record<string, IFireEvent> | null = {}
  private throttleEventListeners: Record<string, IFireEvent> | null = {}

  private static instance: Cvent | null
  private static defaultMaxListeners: number = 10

  constructor(target: EventTarget = globalThis) {
    this.target = target
    this.canIUseNative =
      !!this.target &&
      getType(target.addEventListener) === DefTypes.FUNC &&
      getType(target.removeEventListener) === DefTypes.FUNC
  }

  /**
   * Support return singleton
   * @param target
   */
  static getInstance(target: EventTarget = globalThis): Cvent {
    if (!this.instance || this.instance.target !== target) {
      this.instance = new Cvent(target)
    }

    return this.instance
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
        const listenerType = getType(listener)
        if (listenerType !== DefTypes.FUNC && listenerType !== DefTypes.AFUNC) {
          console.error('Registration event failed! Because the event listener only supports function!')
          return this
        }

        const eventListenerObj = {
          listener,
          ...options,
        } as IEventListenerObj

        this.eventListeners = this.eventListeners || {}

        if (eventName in this.eventListeners) {
          if (this.eventListeners[eventName].length > Cvent.defaultMaxListeners) {
            console.warn(
              'By default, each event can register up to 10 listeners for memory leaks, ' +
                'but then you can modify the default limit through setMaxListeners!'
            )
          }

          this.eventListeners[eventName].push(eventListenerObj)
        } else {
          this.eventListeners[eventName] = [eventListenerObj]
        }

        if (this.canIUseNative && this.target) {
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
        this.eventListeners = this.eventListeners || {}

        const evListeners = this.eventListeners[eventName]

        if (eventlistener) {
          if (this.canIUseNative && this.target) {
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
            this.target!.removeEventListener(eventName, evListener.listener, false)
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
        this.debounceEventListeners = this.debounceEventListeners || {}

        const cacheEventName = `${eventName}-${wait}-${leading}-${trailing}`

        if (!this.debounceEventListeners[cacheEventName]) {
          this.debounceEventListeners[cacheEventName] = debounce(this.fireEvent, wait, { leading, trailing })
        }

        this.debounceEventListeners[cacheEventName].call(this, eventName, payload)
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
        this.throttleEventListeners = this.throttleEventListeners || {}

        const cacheEventName = `${eventName}-${wait}-${leading}-${trailing}`

        if (!this.throttleEventListeners[cacheEventName]) {
          this.throttleEventListeners[cacheEventName] = throttle(this.fireEvent, wait, { leading, trailing })
        }

        this.throttleEventListeners[cacheEventName].call(this, eventName, payload)
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

    Cvent.instance = null
    this.target = null
    this.canIUseNative = false
    this.eventListeners = null
    this.debounceEventListeners = null
    this.throttleEventListeners = null
  }

  getMaxListeners() {
    return Cvent.defaultMaxListeners
  }

  setMaxListeners(maxListeners: number) {
    Cvent.defaultMaxListeners = maxListeners
  }

  /**
   * Real logic of single event to be dispatched
   * @param ev Single event name
   * @param payload Datas to be dispatched
   */
  private fireEvent(ev: string, payload: any) {
    this.eventListeners = this.eventListeners || {}

    const eventListeners = this.eventListeners[ev]
    const eventListenersType = getType(eventListeners)

    if (eventListenersType !== DefTypes.ARRAY || !eventListeners.length) {
      if (ev === 'error' && payload instanceof Error) {
        throw payload
      }
      return
    }

    const firePayload = { detail: payload }

    if (this.canIUseNative && this.target) {
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
