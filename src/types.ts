export type IFireEvent = (ev: string, payload?: any) => void

export interface IStrategyOptions extends IMemoOption {
  wait?: number
}

export interface IMemoOption {
  leading?: boolean // false => not first time will be called
  trailing?: boolean // false => not last time will be called
}

export interface IEmitDebounceOptions {
  wait?: number
  immediate?: boolean
}

export interface IEventEachCallbackParams {
  eventName: string
  index: number
  array: string[]
  listener?: ICustomEventListener
}

export type IEventEachCallback = (val: IEventEachCallbackParams) => void

export interface ICustomEvent extends Partial<Event> {
  detail?: any
}

export type ICustomEventListener = (evt: ICustomEvent) => void

export interface IEventListenerObj {
  listener: ICustomEventListener
  once: boolean
}

export interface IEventListener {
  [key: string]: IEventListenerObj[]
}

export interface IOnOptions {
  once?: boolean
}
