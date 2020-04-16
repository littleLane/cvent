const Cvent = require('cvent')

const cvent = new Cvent()

cvent.on('click', (data) => {
  console.log(data)
})

cvent.emit('click', { name: 'cvent1' })
cvent.off('click')
cvent.emit('click', { name: 'cvent2' })
cvent.emit('error', new Error('error'))
