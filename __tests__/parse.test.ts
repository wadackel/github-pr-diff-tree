import {expect, test} from '@jest/globals'
import {parse} from '../src/parse'

test('simple', () => {
  expect(
    // prettier-ignore
    parse(`
diff --git a/file1 b/file1
index 504d2a1..50ccec3 100644
--- a/file1
+++ b/file1
@@ -1,4 +1,4 @@
+add a line
 some
 lines
-in
 file1
@@ -86,7 +86,9 @@ test
 test
 
-test
+foo
+bar
+baz
 
 test
diff --git a/file2 b/file2
deleted file mode 100644
index c0dafd8..0000000
--- a/file2
+++ /dev/null
@@ -1,4 +0,0 @@
-other
-lines
-in
-file2
diff --git a/newname1 b/newname1
new file mode 100644
index 0000000..c0dafd8
--- /dev/null
+++ b/newname1
@@ -0,0 +1,4 @@
+other
+lines
+in
+file2
diff --git a/oldname2 b/newname2
similarity index 100%
rename from oldname2
rename to newname2
`)
  ).toEqual([
    {
      type: 'modified',
      binary: false,
      from: 'file1',
      to: 'file1',
      additions: 4,
      deletions: 2
    },
    {
      type: 'deleted',
      binary: false,
      from: 'file2',
      to: '',
      additions: 0,
      deletions: 4
    },
    {
      type: 'added',
      binary: false,
      from: '',
      to: 'newname1',
      additions: 4,
      deletions: 0
    },
    {
      type: 'renamed',
      binary: false,
      from: 'oldname2',
      to: 'newname2',
      additions: 0,
      deletions: 0
    }
  ])
})

test('binary', () => {
  expect(
    parse(`
diff --git a/path/to/image.png b/path/to/image.png
new file mode 100644
index 000000000..2969b4fe3
Binary files /dev/null and b/path/to/image.png differ
diff --git a/path/to/image.png b/path/to/image.png
deleted file mode 100644
index 000000000..2969b4fe3
Binary files a/path/to/image.png and /dev/null differ
diff --git a/path/to/image.png b/path/to/image.png
index 000000000..2969b4fe3
Binary files a/path/to/image.png and b/path/to/image.png differ
`)
  ).toEqual([
    {
      type: 'added',
      binary: true,
      from: '',
      to: 'path/to/image.png',
      additions: 0,
      deletions: 0
    },
    {
      type: 'deleted',
      binary: true,
      from: 'path/to/image.png',
      to: '',
      additions: 0,
      deletions: 0
    },
    {
      type: 'modified',
      binary: true,
      from: 'path/to/image.png',
      to: 'path/to/image.png',
      additions: 0,
      deletions: 0
    }
  ])
})

test('quote', () => {
  expect(
    parse(`
diff --git "a/foo \"bar\" baz.txt" "b/foo \"bar\" baz.txt"
index 2262de0..e42f4ce 100644
--- "a/foo \"bar\" baz.txt"
+++ "b/foo \"bar\" baz.txt"
@@ -1 +1,2 @@
 foo
+bar
diff --git "a/foo \"quote\" name.txt" "b/bar \"quote\" name.txt"
similarity index 100%
rename from "foo \"quote\" name.txt"
rename to "bar \"quote\" name.txt"
diff --git "a/name \"quote\" @2x.png" "b/name \"quote\" @2x.png"
index 000000000..2969b4fe3
Binary files "a/name \"quote\" @2x.png" and "b/name \"quote\" @2x.png" differ
`)
  ).toEqual([
    {
      type: 'modified',
      binary: false,
      from: 'foo "bar" baz.txt',
      to: 'foo "bar" baz.txt',
      additions: 1,
      deletions: 0
    },
    {
      type: 'renamed',
      binary: false,
      from: 'foo "quote" name.txt',
      to: 'bar "quote" name.txt',
      additions: 0,
      deletions: 0
    },
    {
      type: 'modified',
      binary: true,
      from: 'name "quote" @2x.png',
      to: 'name "quote" @2x.png',
      additions: 0,
      deletions: 0
    }
  ])
})

test('eof', () => {
  expect(
    parse(`
diff --git a/dist/index.js.map b/dist/index.js.map
index 01dacd2..f6a6260 100644
--- a/dist/index.js.map
+++ b/dist/index.js.map
@@ -1 +1 @@
-oldline
\ No newline at end of file
+newline
\ No newline at end of file
`)
  ).toEqual([
    {
      type: 'modified',
      binary: false,
      from: 'dist/index.js.map',
      to: 'dist/index.js.map',
      additions: 1,
      deletions: 1
    }
  ])
})
