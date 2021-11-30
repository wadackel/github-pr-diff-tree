export type File = {
  type: 'added' | 'deleted' | 'modified' | 'renamed'
  binary: boolean
  from: string
  to: string
  additions: number
  deletions: number
}
