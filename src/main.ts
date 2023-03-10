import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
import { dirname, join } from "https://deno.land/std@0.179.0/path/mod.ts";

const ROOT = Deno.args[1];

if (!ROOT) {
  throw new Error(`argument of tree root path missing.`);
}

console.log(`Fixing note filenames in '${ROOT}'...`);

// walk through files
for await (const {path, name, isFile, isDirectory, isSymlink} of walk(ROOT)) {
	// console.log(`Processing entry '${JSON.stringify(path)}'`);
	if (isSymlink) {
		console.info(`NOTE: Skipping symlink '${path}'`);
		continue;
	} else if (isDirectory) {
		console.info(`NOTE: Manually rename directory '${path}'`);
	} else if (isFile) {
		if (!path.endsWith(".md")) {
      console.info(`NOTE: Skipping non-markdown file '${path}'`);
			continue;
		}

		// console.log(`Uppercasing file '${path}'`);

		const dirpath = dirname(path);
		// filename without ".md" extension
		const filename = name.slice(0,-3);
		// console.log(dirpath, filename);

		// frontmatter title
		const content = await Deno.readTextFile(path);
	  // const frontmatter = extract(content);
		// const title = frontmatter.attrs.title;
		// console.log(frontmatter, title);
		const title = get_title(content);
		const titleBotched = botched_escapes(title);
		const titleBotchedLowercase = botched_escapes(title.toLowerCase());
		// console.log(title);

		const re = /-(\d+)$/;
		const matches = filename.match(re);

		// if lowercase title equals filename, rename filename to title add `.md` extension
		if (titleBotchedLowercase == filename) {
			const pathNew = join(dirpath, title + ".md");
			await Deno.rename(path, pathNew);
		} else if (matches && (titleBotched + "-" + matches[1] == filename)) {
			const pathNew = join(dirpath, title + "-" + matches[1] + ".md");
			await Deno.rename(path, pathNew);
		} else {
			console.warn(`WARNING: Unexpected titleBotchedLowercase '${titleBotchedLowercase}' different from filename '${filename}'. Skipping '${path}'...`);
		}
	}
}

function get_title(content: string): string {
  const re = /^----\ntitle: (.+)$/m;
	const matches = content.match(re);
	return matches[1];
}

function botched_escapes(filename: string): string {
  return filename
		// .replaceAll("Ä", "ä")
		// .replaceAll("Ö", "ö")
		// .replaceAll("Ü", "ü")
		.replaceAll("ä", "\u0061\u0308")
		.replaceAll("ö", "\u006F\u0308")
		.replaceAll("ü", "\u0075\u0308")
    .replaceAll("á", "\u0061\u0301")
    .replaceAll("é", "\u0065\u0301")
    .replaceAll("í", "\u0069\u0301")
    .replaceAll("ó", "\u006F\u0301")
    .replaceAll("ú", "\u0075\u0301")
    // beware: possibly more, e.g. with grave, circumflex, tilde, diaeresis, etc.
    .replaceAll("ά", "\u03B1\u0301")
    .replaceAll("έ", "\u03B5\u0301")
    .replaceAll("ή", "\u03B7\u0301")
    .replaceAll("ί", "\u03B9\u0301")
    .replaceAll("ό", "\u03BF\u0301")
    .replaceAll("ύ", "\u03C5\u0301")
    .replaceAll("ώ", "\u03C9\u0301")
		// beware: possibly more, e.g. vowels with dialytica
	  .replaceAll(".", "-")
	  .replaceAll(":", "-")
		.replaceAll("?", "-");
}
