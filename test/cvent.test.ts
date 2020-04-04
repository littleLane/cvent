import * as sinon from 'sinon'
import Cvent from '../src/cvent'

let clock: any

describe('Cvent Test', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('Construct instance of Cvent successfully', () => {
    const cvent = new Cvent()

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
    const cvent = new Cvent()

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
  })

  it('Cvent should on、emit and off event well', () => {
    const cvent = new Cvent()
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
  })

  it('Cvent should emitDebounce event well', () => {
    const cvent = new Cvent()

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
  })

  it('Cvent should emitThrottle event well', () => {
    const cvent = new Cvent()
    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.emitThrottle('click1', { name: 'Cvent' })

    clock.tick(500)
    expect(func1).toBeCalledTimes(1)
  })

  it('Simulate a lower version browser for IE', () => {
    const originCustomEvent = window.CustomEvent
    Object.defineProperty(window, 'CustomEvent', { value: null })

    const cvent = new Cvent()
    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(1)

    Object.defineProperty(window, 'CustomEvent', { value: originCustomEvent })
  })

  it('Simulate a non-browser environment', () => {
    const originAddEventListener = window.addEventListener
    Object.defineProperty(window, 'addEventListener', { value: null })

    const cvent = new Cvent()
    const func1 = jest.fn()

    cvent.on('click1', func1)
    cvent.emit('click1')
    expect(func1).toBeCalledTimes(1)

    const func2 = jest.fn()
    cvent.on('click2', func2)
    cvent.off('click2', func2)
    cvent.emitDebounce('click2', { name: 'Cvent' })

    clock.tick(5000)
    expect(func2).toBeCalledTimes(0)

    Object.defineProperty(window, 'CustomEvent', { value: originAddEventListener })
  })
})
