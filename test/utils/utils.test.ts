import { sanitizateEventListener, enhanceForEachEvent, getType } from '../../src/utils/utils'
import { IEventEachCallbackParams } from '../../src/types'
import { DefTypes } from '../../src/utils/constants'

describe('Utils Test', () => {
  it('getType should get correctly returned value', () => {
    expect(getType('')).toEqual(DefTypes.STRING)
  })

  it('sanitizateEventListener should get correctly returned value', () => {
    expect(sanitizateEventListener('click')).toEqual({
      events: ['click'],
      harmlessListener: undefined,
    })
    expect(sanitizateEventListener(['click', (1 as any) as string])).toEqual({
      events: ['click', '1'],
      harmlessListener: undefined,
    })

    const func = jest.fn()
    expect(sanitizateEventListener('click, click2', func)).toEqual({
      events: ['click', 'click2'],
      harmlessListener: func,
    })

    expect(sanitizateEventListener(['click'], null as any)).toEqual({
      events: ['click'],
      harmlessListener: null,
    })

    expect(sanitizateEventListener([], null as any)).toEqual({
      events: [],
      harmlessListener: null,
    })

    expect(sanitizateEventListener(null as any, null as any)).toEqual({
      events: [],
      harmlessListener: null,
    })
  })

  it('enhanceForEachEvent should works well', () => {
    function eachCallback(data: IEventEachCallbackParams) {
      expect(data.eventName).toBe('click')
    }

    enhanceForEachEvent({ event: 'click', eachCallback })
    enhanceForEachEvent({ event: [], eachCallback })
  })
})
