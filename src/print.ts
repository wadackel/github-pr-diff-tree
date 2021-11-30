import * as path from 'path'
import type {File} from './types'

type BaseNode<T, U> = {
  type: T
  name: string
} & U

type FileNode = BaseNode<
  'file',
  {
    mark: string
    meta: string
  }
>

type DirectoryNode = BaseNode<
  'directory',
  {
    parent: DirectoryNode | null
    children: TreeNode[]
  }
>

type TreeNode = FileNode | DirectoryNode

const createDirectoryNode = (
  properties: Partial<Omit<DirectoryNode, 'type'>>
): DirectoryNode => ({
  type: 'directory',
  name: '',
  parent: null,
  children: [],
  ...properties
})

const createFileNode = (
  properties: Partial<Omit<FileNode, 'type'>>
): FileNode => ({
  type: 'file',
  name: '',
  mark: '',
  meta: '',
  ...properties
})

const formatFileMeta = (file: File): string => {
  switch (file.type) {
    case 'added':
      return 'A'
    case 'deleted':
      return 'D'
    case 'modified':
      return file.binary ? 'M' : `M +${file.additions}, -${file.deletions}`
    case 'renamed': {
      return `R ${path.relative(path.dirname(file.to), file.from)}`
    }
  }
}

const formatFileMark = (file: File): string => {
  switch (file.type) {
    case 'added':
      return '+'
    case 'deleted':
      return '-'
    default:
      return ' '
  }
}

const build = (files: File[]): DirectoryNode => {
  const root = createDirectoryNode({
    name: '.'
  })

  for (const file of files) {
    const filepath = file.type === 'deleted' ? file.from : file.to
    const parts = filepath.split('/')
    const name = parts.pop() as string
    let parent = root
    let dir: string | undefined

    while ((dir = parts.shift())) {
      if (parent.name !== dir) {
        const found = parent.children.find(entry => entry.name === dir)
        if (found == null) {
          const directory = createDirectoryNode({
            parent,
            name: dir
          })
          parent.children.push(directory)
          parent = directory
        } else if (found.type === 'directory') {
          parent = found
        }
      }
    }

    parent.children.push(
      createFileNode({
        meta: formatFileMeta(file),
        mark: formatFileMark(file),
        name
      })
    )
  }

  return root
}

const displayName = (node: TreeNode): string => {
  switch (node.type) {
    case 'directory':
      return `${node.name}/`
    case 'file': {
      const meta = node.meta !== '' ? ` (${node.meta})` : ''
      return node.name + meta
    }
  }
}

const formatEach = (nodes: TreeNode[], prefix: string): string => {
  let result = ''

  for (const [index, node] of nodes.entries()) {
    const mark = node.type === 'file' ? node.mark : ' '
    const edge = index === nodes.length - 1
    const guide = prefix + (edge ? '└──' : '├──')
    const next = prefix + (edge ? '    ' : '│   ')

    result += `${mark}${guide} ${displayName(node)}\n`

    if (node.type === 'directory') {
      result += formatEach(node.children, next)
    }
  }

  return result
}

export const print = (files: File[]): string => {
  const root = build(files)

  return ` ${root.name}\n${formatEach(root.children, '').trimRight()}`
}
