export type IFireEvent = (ev: string, payload?: any) => void

export interface IEmitThrottleOptions {
  wait?: number
  leading?: boolean // false 表示禁用第一次执行
  trailing?: boolean // false 表示禁用停止触发时的回调
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

export type ICustomEventListener = (evt: Event | { detail: any }) => void
