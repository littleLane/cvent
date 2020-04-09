import * as sinon from 'sinon'
import Cvent from '../src/cvent'

let clock: any
let cvent: Cvent

describe('Cvent Test', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers()
    cvent = new Cvent()
  })

  afterEach(() => {
    clock.restore()
    cvent.destroy()
  })

  it('Construct instance of Cvent successfully', () => {
    expect(cvent).toBeInstanceOf(Cvent)
    expect(cvent).toHaveProperty('on')
    expect(cvent).toHaveProperty('emit')
    expect(cvent).toHaveProperty('off')

    const cvent1 = new Cvent((null as unknown) as EventTarget)
    expect(cvent1).toBeInstanceOf(Cvent)
    expect(cvent1).toHaveProperty('on')
    expect(cvent1).toHaveProperty('emit')
    expect(cvent1).toHaveProperty('off')
  })

  it('Cvent should on and emit event well', () => {
    const func1 = jest.fn()
    cvent.on('click1', func1)
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(1)

    const func2 = jest.fn()
    cvent.on('click2_1, click2_2', func2)
    cvent.emit('click2_1, click2_2')
    expect(func2).toBeCalledTimes(2)

    const func3 = jest.fn()
    cvent.on(['click3_1', 'click3_2', 'click3_3'], func3)
    cvent.emit(['click3_1', 'click3_2', 'click3_3'])
    expect(func3).toBeCalledTimes(3)

    const func4 = function (data: any) {
      expect(data.detail).toBeNull()
    }
    cvent.on('click4', func4)
    cvent.emit('click4')

    const func5 = function (data: any) {
      expect(data.detail).toEqual(1)
    }
    cvent.on('click5', func5)
    cvent.emit('click5', 1)
  })

  it('Cvent should once、emit event well', () => {
    const func1 = jest.fn()

    cvent.once('click1', func1)
    cvent.emit('click1')
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(1)
  })

  it('Cvent should on、emit and off event well', () => {
    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.off('click1')
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(0)

    const func2 = jest.fn()
    const func21 = jest.fn()
    cvent.on('click2_1, click2_2', func2)
    cvent.on('click2_1', func21)
    cvent.off('click2_1')
    cvent.emit('click2_1, click2_2')
    expect(func2).toBeCalledTimes(1)
    expect(func21).toBeCalledTimes(0)

    const func3 = jest.fn()
    cvent.on(['click3_1', 'click3_2', 'click3_3'], func3)
    cvent.off(['click3_1', 'click3_2'])
    cvent.off(['click3_3'], func3)
    cvent.emit(['click3_1', 'click3_2', 'click3_3'])
    expect(func3).toBeCalledTimes(0)

    const func4 = jest.fn()
    const func5 = jest.fn()
    cvent.on(['click4'], func4)
    cvent.off(['click4'], func5)
    cvent.emit(['click4'])
    expect(func4).toBeCalledTimes(1)

    const func6 = function (data: any) {
      expect(data.detail).toBeNull()
    }
    cvent.on('click6', func6)
    cvent.emit('click6', null)
    cvent.emit('click6')

    const func8 = function (data: any) {
      expect(data.detail).toEqual({ name: 'cvent' })
    }
    cvent.on('click8', func8)
    cvent.emit('click8', { name: 'cvent' })
  })

  it('Cvent should emitDebounce event well', () => {
    const func1 = jest.fn()
    cvent.on('click1', func1)
    cvent.emitDebounce('click1', { name: 'Cvent' })
    expect(func1).toBeCalledTimes(0)

    clock.tick(5000)
    expect(func1).toBeCalledTimes(1)

    const func2 = jest.fn()
    cvent.on('click2', func2)
    cvent.off('click2', func2)
    cvent.emitDebounce('click2', { name: 'Cvent' })

    clock.tick(5000)
    expect(func2).toBeCalledTimes(0)

    const func3 = function (data: any) {
      expect(data.detail).toEqual(1)
    }
    cvent.on('click3', func3)
    cvent.emitDebounce('click3', 1)
    clock.tick(5000)

    const func4 = function (data: any) {
      expect(data.detail).toEqual(1)
    }
    cvent.on('click4', func4)
    cvent.emitDebounce('click4', 1, { wait: 1000 })
    clock.tick(1000)

    const func5 = jest.fn()
    cvent.on('click5', func5)
    cvent.emitDebounce('click5', 1, { wait: 1000, leading: true })
    expect(func5).toBeCalledTimes(1)

    const func6 = function (data: any) {
      expect(data.detail).toBeNull()
    }
    cvent.on('click6', func6)
    cvent.emitDebounce('click6', null, { wait: 1000 })
    clock.tick(1000)
    cvent.emitDebounce('click6', undefined, { wait: 1000 })
    clock.tick(1000)
  })

  it('Cvent should emitThrottle event well', () => {
    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.emitThrottle('click1', { name: 'Cvent' })

    clock.tick(500)
    expect(func1).toBeCalledTimes(1)

    const func2 = function (data: any) {
      expect(data.detail).toBeNull()
    }
    cvent.on('click2', func2)
    cvent.emitThrottle('click2', null, { wait: 500 })
    clock.tick(1000)
    cvent.emitThrottle('click2', undefined, { wait: 500 })
    clock.tick(1000)
  })

  it('Simulate a lower version browser for IE', () => {
    const originCustomEvent = globalThis.CustomEvent
    Object.defineProperty(globalThis, 'CustomEvent', { value: null })

    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(1)

    Object.defineProperty(globalThis, 'CustomEvent', { value: originCustomEvent })
  })

  it('Simulate a non-browser environment', () => {
    const originAddEventListener = globalThis.addEventListener
    Object.defineProperty(globalThis, 'addEventListener', { value: null })

    const otherCvent = new Cvent()
    const func1 = jest.fn()

    otherCvent.on('click1', func1)
    otherCvent.emit('click1')
    expect(func1).toBeCalledTimes(1)

    const func2 = jest.fn()
    otherCvent.on('click2', func2)
    otherCvent.off('click2', func2)
    otherCvent.emitDebounce('click2', { name: 'Cvent' })

    clock.tick(5000)
    expect(func2).toBeCalledTimes(0)

    const func3 = function (data: any) {
      expect(data.detail).toBeNull()
    }
    otherCvent.on('click3', func3)
    otherCvent.off('click3')
    otherCvent.emit('click3')

    Object.defineProperty(globalThis, 'CustomEvent', { value: originAddEventListener })
  })

  it('Destroy should work well', () => {
    const func = jest.fn()
    cvent.on('click', func)
    cvent.destroy()
    cvent.emit('click')
    expect(func).toBeCalledTimes(0)
  })
})
