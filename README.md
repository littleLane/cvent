# cvent

An extension library based on browser events!

## Installation

You can install the stable version by npm:

```bash
$ npm i cvent
// or
$ yarn add cvent
```

### Usage

Cvent provides flexible apis about event registration, unregistration, and trigger!

You can instantiate an object by

```javascript
import Cvent from 'cvent'

const cvent = new Cvent()
```

#### on

Register a single event

```javascript
const listener = (e) => {
  console.log(e)
}
cvent.on('click', listener)
```

Register multiple events

```javascript
const listener = (e) => {
  console.log(e)
}
cvent.on('click1, click2', listener)

// Same as above
cvent.on(['click1', 'click2'], listener)
```

#### off

Unregister a single event

```javascript
cvent.off('click', listener)
```

Unregister multiple events

```javascript
cvent.off(['click1', 'click2'], listener)
```

Unregister a kind of events

```javascript
cvent.off(['click1', 'click2'])
```

#### emit

Trigger a kind of events

```javascript
cvent.emit('click', [payload?: any])
```

#### emitDebounce

Trigger a kind of events by debounce!

```javascript
cvent.emit('click', [payload?: any], [debounceOptions])
```

DebounceOptions is an object!

#### emitThrottle

Trigger a kind of events by throttle!

```javascript
cvent.emit('click', [payload?: any], [throttleOptions])
```

ThrottleOptions is an object!

### Future Features

- [x] Only respond to the first trigger of the event
- [x] Debounce supports last times will be called
- [ ] Keep improve...

### License

[MIT](https://github.com/littleLane/cvent/blob/master/LICENSE)
