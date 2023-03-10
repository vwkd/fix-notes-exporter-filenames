# README

Fix filenames of notes exported with [Notes Exporter](http://falcon.star-lord.me/exporter/)



## Details

- fixes lowercase back to uppercase
- fixes wrong accented characters in Spanish and Greek (beware: still incomplete!)
- note: skips non-markdown files, folder names and symlinks, needs to rename manually



## Usage

- export notes with frontmatter
- run script

```sh
deno task fix -- ../path/to/notes
```



## Architecture

For every markdown note, extracts the title from the note content and reconstructs a botched filename as done by from Notes Exporter. If reconstruction matches the real filename, renames file to title, otherwise prints warning and skips.
