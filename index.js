const Channel = require('channel-surfer')

module.exports = produce

function produce (stream) {
  const responses = new Channel()

  stream.on('error', (err) => {
    responses.error(err)
  })

  return (chunk, encoding) => {
    function done () {
      responses.give()
    }

    if (chunk !== null && chunk !== undefined) {
      stream.write(chunk, encoding, done)
    } else {
      stream.end(chunk, encoding, done)
    }

    return responses.take()
  }
}
