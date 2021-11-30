import type {File} from './types'

const regexp = {
  singleQuote: /^'(.*)'$/,
  singleQuoteEscape: /\\'/g,
  doubleQuote: /^"(.*)"$/,
  doubleQuoteEscape: /\\"/g,
  binary: /^Binary files (.+) and (.+) differ$/
}

const normalize = (filepath: string): string => {
  let result = filepath
  let m: RegExpMatchArray | null

  m = result.match(regexp.singleQuote)
  if (m != null) {
    result = m[1].replace(regexp.singleQuoteEscape, `'`)
  }

  m = result.match(regexp.doubleQuote)
  if (m != null) {
    result = m[1].replace(regexp.doubleQuoteEscape, `"`)
  }

  if (result.startsWith('a/') || result.startsWith('b/')) {
    result = result.slice(2)
  }

  return result
}

export const parse = (input: string): File[] => {
  const results: File[] = []
  const lines = input.split('\n')
  const length = lines.length
  let index = 0

  const parseHunk = (): [additions: number, deletions: number] => {
    let additions = 0
    let deletions = 0

    while (index < length) {
      const line = lines[index]
      if (line === `\\ No newline at end of file`) {
        index++
        continue
      }

      const first = line[0]

      switch (first) {
        case '+':
          additions++
          break

        case '-':
          deletions++
          break

        case ' ':
          break

        default:
          return [additions, deletions]
      }

      index++
    }

    return [additions, deletions]
  }

  const parseDiff = (): File => {
    const file: File = {
      type: 'modified',
      binary: false,
      from: '',
      to: '',
      additions: 0,
      deletions: 0
    }

    while (index < length) {
      const line = lines[index]
      const space = line.indexOf(' ')
      const prefix = space > -1 ? line.slice(0, space) : line[0]

      switch (prefix) {
        case 'diff':
          return file

        case '---': {
          const a = line.slice(4)
          index++
          const b = lines[index].slice(4)
          if (a === '/dev/null') {
            file.type = 'added'
            file.to = normalize(b)
          } else if (b === '/dev/null') {
            file.type = 'deleted'
            file.from = normalize(a)
          } else {
            file.type = 'modified'
            file.from = normalize(a)
            file.to = normalize(b)
          }
          index++
          break
        }

        case '@@': {
          index++
          const [additions, deletions] = parseHunk()
          file.additions += additions
          file.deletions += deletions
          break
        }

        case 'rename': {
          const from = line.slice('rename from '.length)
          index++
          const to = lines[index].slice('rename to '.length)
          file.type = 'renamed'
          file.from = normalize(from)
          file.to = normalize(to)
          index++
          break
        }

        case 'Binary': {
          const m = line.match(regexp.binary)
          const from = m?.[1] ?? ''
          const to = m?.[2] ?? ''
          if (from === '/dev/null') {
            file.type = 'added'
            file.to = normalize(to)
          } else if (to === '/dev/null') {
            file.type = 'deleted'
            file.from = normalize(from)
          } else {
            file.type = 'modified'
            file.from = normalize(from)
            file.to = normalize(to)
          }
          file.binary = true
          index++
          break
        }

        default:
          index++
          break
      }
    }

    return file
  }

  while (index < length) {
    const line = lines[index]

    if (line.startsWith('diff ')) {
      index++
      results.push(parseDiff())
    } else {
      index++
    }
  }

  return results
}
