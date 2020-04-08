import * as sinon from 'sinon'
import debounce from '../../src/utils/debounce'

let clock: any

describe('Debounce Test', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should get correctly called times', () => {
    const func = jest.fn()
    const debouncedFunc = debounce(func, 1000)

    // Call it immediately
    debouncedFunc()
    // func not called
    expect(func).toHaveBeenCalledTimes(0)

    // Call it several times with 500ms between each call
    for (let i = 0; i < 10; i++) {
      clock.tick(500)
      debouncedFunc()
    }
    // func not called
    expect(func).toHaveBeenCalledTimes(0)

    // wait 1000ms
    clock.tick(1000)
    // func called
    expect(func).toHaveBeenCalledTimes(1)

    const func2 = jest.fn()
    const debouncedFunc2 = debounce(func2, 1000, { leading: true })
    debouncedFunc2()
    expect(func2).toHaveBeenCalledTimes(1)

    const func3 = jest.fn()
    const debouncedFunc3 = debounce(func3)
    debouncedFunc3()
    // wait 5000ms
    clock.tick(1000)
    // func called
    expect(func3).toHaveBeenCalledTimes(1)

    const func4 = jest.fn()
    const debouncedFunc4 = debounce(func4, Number.MAX_VALUE)
    debouncedFunc4()
    // wait 1000ms
    clock.tick(1000)
    // func called
    expect(func4).toHaveBeenCalledTimes(1)

    const func5 = jest.fn()
    const debouncedFunc5 = debounce(func5, 1000, { leading: false, trailing: false })
    debouncedFunc5()
    clock.tick(1000)
    expect(func5).toHaveBeenCalledTimes(0)

    const func6 = jest.fn()
    const debouncedFunc6 = debounce(func6, 1000, { leading: false, trailing: true })
    debouncedFunc6()
    clock.tick(1000)
    expect(func6).toHaveBeenCalledTimes(1)
  })

  it('should get correctly return value', () => {
    function func(data: number) {
      expect(data).toEqual(3)
    }
    const debounceFunc = debounce(func, 1000)
    // wait 1000ms
    clock.tick(1000)
    debounceFunc(1)
  })
})
