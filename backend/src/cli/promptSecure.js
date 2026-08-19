// Prompt de senha com mascaramento de caracteres (exibe "*"), sem
// nenhuma dependência externa. Usa o stdin em modo raw para capturar
// tecla a tecla e nunca ecoa o valor real no terminal nem em logs.
const CTRL_C = String.fromCharCode(3)
const BACKSPACE = String.fromCharCode(127)

export function promptPassword(question) {
  return new Promise((resolve, reject) => {
    process.stdout.write(question)
    const stdin = process.stdin

    if (!stdin.isTTY) {
      // Fallback para ambientes sem TTY (ex: pipes em CI): lê a linha sem
      // mascaramento, pois não há terminal interativo para mascarar.
      let data = ''
      const onData = (chunk) => {
        data += chunk
        if (data.includes('\n')) {
          stdin.removeListener('data', onData)
          resolve(data.split('\n')[0].trim())
        }
      }
      stdin.on('data', onData)
      return
    }

    stdin.resume()
    stdin.setRawMode(true)
    stdin.setEncoding('utf8')

    let input = ''

    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
    }

    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
          cleanup()
          process.stdout.write('\n')
          resolve(input)
          break
        case CTRL_C:
          cleanup()
          process.stdout.write('\n')
          reject(new Error('Cancelado pelo usuário'))
          break
        case BACKSPACE:
        case '\b':
          if (input.length > 0) {
            input = input.slice(0, -1)
            process.stdout.write('\b \b')
          }
          break
        default:
          input += char
          process.stdout.write('*')
      }
    }

    stdin.on('data', onData)
  })
}
