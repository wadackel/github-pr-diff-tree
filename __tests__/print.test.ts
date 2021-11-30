import {expect, test} from '@jest/globals'
import {print} from '../src/print'

test('simple', () => {
  expect(
    print([
      {
        type: 'modified',
        binary: false,
        from: 'dir1/file1',
        to: 'dir1/file1',
        additions: 1,
        deletions: 0
      },
      {
        type: 'added',
        binary: false,
        from: '',
        to: 'dir2/file2',
        additions: 1,
        deletions: 0
      },
      {
        type: 'deleted',
        binary: false,
        from: 'dir2/nest/file3',
        to: '',
        additions: 0,
        deletions: 0
      },
      {
        type: 'modified',
        binary: false,
        from: '',
        to: 'dir2/file4',
        additions: 34,
        deletions: 5
      },
      {
        type: 'renamed',
        binary: false,
        from: 'rename/old/oldname',
        to: 'rename/new/newname',
        additions: 34,
        deletions: 5
      }
    ])
  ).toBe(
    ` .
 ├── dir1/
 │   └── file1 (M +1, -0)
 ├── dir2/
+│   ├── file2 (A)
 │   ├── nest/
-│   │   └── file3 (D)
 │   └── file4 (M +34, -5)
 └── rename/
     └── new/
         └── newname (R ../old/oldname)`
  )
})

test('binary', () => {
  expect(
    print([
      {
        type: 'modified',
        binary: true,
        from: '',
        to: 'dir1/binary1',
        additions: 0,
        deletions: 0
      }
    ])
  ).toBe(
    ` .
 └── dir1/
     └── binary1 (M)`
  )
})
