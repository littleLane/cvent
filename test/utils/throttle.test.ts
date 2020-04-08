import * as sinon from 'sinon'
import throttle from '../../src/utils/throttle'

let clock: any

describe('Throttle Test', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should get correctly called times', () => {
    const func = jest.fn()
    const throttledFunc = throttle(func)

    throttledFunc()
    expect(func).toHaveBeenCalledTimes(0)

    // wait 500ms
    clock.tick(500)
    throttledFunc()
    expect(func).toHaveBeenCalledTimes(1)

    // Call it several times with 250ms between each call
    // 250ms 后 [✔, 1, ✔, 3, ✔, 5, ✔, 7, ✔, ✔] => first time and last time will be called
    const func1 = jest.fn()
    const throttledFunc1 = throttle(func1)
    for (let i = 0; i < 10; i++) {
      clock.tick(250)
      throttledFunc1()
    }
    expect(func1).toHaveBeenCalledTimes(5)

    // Call it several times with 250ms between each call
    // 250ms 后 [✔, 1, ✔, 3, ✔, 5, ✔, 7, ✔, ✔] => first time and last time will be called
    const func2 = jest.fn()
    const throttledFunc2 = throttle(func2, Number.MAX_VALUE)
    for (let i = 0; i < 10; i++) {
      clock.tick(250)
      throttledFunc2()
    }
    expect(func2).toHaveBeenCalledTimes(5)
  })

  it('should not called the first time', () => {
    const func = jest.fn()
    const throttledFunc = throttle(func, 500, { leading: false })

    // Call it several times with 500ms between each call
    // 250ms 后 [0, 1, ✔, 3, 4, ✔,6, 7, ✔, ✔] => not first time but last time will be called
    for (let i = 0; i < 10; i++) {
      clock.tick(250)
      throttledFunc()
    }
    expect(func).toHaveBeenCalledTimes(4)
  })

  it('should not called the last time', () => {
    const func = jest.fn()
    const throttledFunc = throttle(func, 500, { trailing: false })

    // Call it several times with 500ms between each call
    // 250ms 后 [✔, 1, ✔, 3, ✔, 5, ✔, 7, ✔, 9] => not last time but first time will be called
    for (let i = 0; i < 10; i++) {
      clock.tick(250)
      throttledFunc()
    }
    expect(func).toHaveBeenCalledTimes(5)
  })

  it('should not called the first time and last time', () => {
    const func = jest.fn()
    const throttledFunc = throttle(func, 500, { leading: false, trailing: false })

    // Call it several times with 500ms between each call
    // 250ms 后 [0, 1, ✔, 3, ✔, 5, ✔, 7, ✔, 9] => not last time and first time will be called
    for (let i = 0; i < 10; i++) {
      clock.tick(250)
      throttledFunc()
    }
    expect(func).toHaveBeenCalledTimes(4)
  })

  it('should get correctly return value', () => {
    function func(data: string) {
      expect(data).toEqual('Cvent')
    }

    const throttledFunc = throttle(func, 1000)

    // wait 1000ms
    clock.tick(1000)
    throttledFunc('Cvent')
  })
})
