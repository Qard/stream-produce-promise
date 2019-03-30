const tap = require('tap')
const { PassThrough } = require('stream')
const produce = require('./')

function uid () {
  return Buffer.from(Math.random().toString(35).substr(2, 16))
}

tap.test('basics', (t) => {
  const stream = new PassThrough()
  const write = produce(stream)

  const message = 'Hello, world!'

  stream.on('readable', () => {
    const chunk = stream.read()
    t.ok(chunk)
    t.equal(chunk.toString(), message)
    t.end()
  })

  return write(message)
})

tap.test('parallel', (t) => {
  t.plan(1)

  const stream = new PassThrough()
  const write = produce(stream)
  const received = []
  const sent = []
  const n = 100

  stream.on('data', (chunk) => {
    received.push(chunk)
  })

  stream.on('end', () => {
    t.match(
      Buffer.concat(sent),
      Buffer.concat(received),
      'sent list matches received list'
    )
  })

  const tasks = []
  for (let i = 0; i < n; i++) {
    const message = uid()
    tasks.push(write(message))
    sent.push(message)
  }
  tasks.push(write())

  return Promise.all(tasks)
})

tap.test('errors', (t) => {
  const error = new Error('test')
  const stream = new PassThrough()
  const write = produce(stream)
  stream.emit('error', error)

  return write('hi')
    .then(
      () => t.fail('should have received an error'),
      (err) => t.match(err, error, 'received expected error')
    )
})
