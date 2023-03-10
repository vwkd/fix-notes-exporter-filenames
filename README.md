# README

Fix filenames of notes exported with [Notes Exporter](http://falcon.star-lord.me/exporter/)



## Details

- fixes lowercase back to uppercase
- fixes wrong accented characters in Spanish and Greek (beware: still incomplete!)
- note: skips non-markdown files, folder names and symlinks, needs to rename manually



## Prerequisites

- exported notes from Notes Exporter



## Usage

- as shell command

```sh
deno install -n fix-note-filenames --allow-read --allow-write https://raw.githubusercontent.com/vwkd/fix-notes-exporter-filenames/main/src/main.ts
fix-note-filenames -- ../path/to/notes
```

- as developer

```sh
deno task fix -- ../path/to/notes
```



## Architecture

For every markdown note, extracts the title from the note content and reconstructs a botched filename as done by from Notes Exporter. If reconstruction matches the real filename, renames file to title, otherwise prints warning and skips.
