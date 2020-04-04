import { DefTypes } from './constants'
import { ICustomEventListener, IEventEachCallback } from '../types'

export function getType(data: any): string {
  return Object.prototype.toString.call(data).replace(/\[object\s|\]/g, '')
}

export const noop = () => {}

/**
 * 格式化 event 和 listener
 * @param event
 * @param listener
 */
export function sanitizateEventListener(
  event: string | string[],
  listener?: ICustomEventListener
): {
  events: string[]
  harmlessListener?: ICustomEventListener
} {
  let events: string[] = []
  const eventType = getType(event)

  if (eventType === DefTypes.STRING) {
    events = (event as string).split(',')
  } else if (eventType === DefTypes.ARRAY) {
    events = event as string[]
  }

  let harmlessListener = listener
  const listenerType = getType(listener)

  if (listenerType !== DefTypes.FUNC && listenerType !== DefTypes.UNDEFINED) {
    harmlessListener = noop
  }

  return {
    events: events.map((evt) => (getType(evt) === DefTypes.STRING ? evt.trim() : evt.toString())),
    harmlessListener,
  }
}

/**
 * EventEmiter 增强 forEach 方法
 * @param param0
 */
export function enhanceForEachEvent({
  event,
  listener,
  eachCallback,
}: {
  event: string | string[]
  listener?: ICustomEventListener
  eachCallback: IEventEachCallback
}) {
  const { events, harmlessListener } = sanitizateEventListener(event, listener)

  if (Array.isArray(events) && events.length > 0) {
    events.forEach((value, index, array) =>
      eachCallback({
        eventName: value.trim(),
        index,
        array,
        listener: harmlessListener,
      })
    )
  }
}
