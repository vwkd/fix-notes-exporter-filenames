import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
import { dirname, join } from "https://deno.land/std@0.179.0/path/mod.ts";

const ROOT = Deno.args[1];

if (!ROOT) {
  throw new Error(`Notes path argument missing.`);
}

console.log(`Fixing note filenames in '${ROOT}'...`);

for await (const {path, name, isFile, isDirectory, isSymlink} of walk(ROOT)) {

	if (isSymlink) {
		console.info(`NOTE: Skipping symlink '${path}'`);
		continue;
	} else if (isDirectory) {
		console.info(`NOTE: Skipping folder name '${path}'`);
	} else if (isFile) {
		if (!path.endsWith(".md")) {
      console.info(`NOTE: Skipping non-markdown file '${path}'`);
			continue;
		}

		// console.log(`Uppercasing file '${path}'`);

		const dirpath = dirname(path);
		// filename without ".md" extension
		const filename = name.slice(0,-3);

		const content = await Deno.readTextFile(path);

		const title = get_title(content);
		const titleBotched = botched_escapes(title);
		const titleBotchedLowercase = botched_escapes(title.toLowerCase());

		const re = /-(\d+)$/;
		const matches = filename.match(re);

		// all good
		if (title == filename) {
			continue;
		}
		
		// in earlier versions was uppercase, but botched transformations
		// in later versions additionally botched escapes
		if (botched_transformations(title) == filename) {
			const pathNew = join(dirpath, title + ".md");
			await Deno.rename(path, pathNew);
		} else if (titleBotchedLowercase == filename) {
			const pathNew = join(dirpath, title + ".md");
			await Deno.rename(path, pathNew);
		} else if (matches && (titleBotched + "-" + matches[1] == filename)) {
			const pathNew = join(dirpath, title + "-" + matches[1] + ".md");
			await Deno.rename(path, pathNew);
		} else {
			console.warn(`WARNING: Unexpected filename '${filename}'. Skipping '${path}'...`);
		}
	}
}

function get_title(content: string): string {
	// beware: non-standard YAML frontmatter with 4 dashes as delimiter, can't use off-the-shelf parser!
  const re_frontmatter = /^----\ntitle: (.+)$/m;
	const matches_frontmatter = content.match(re_frontmatter);

	// first non-space line, trimmed, without leading `# ` if any, without wrapping `**` if any
	const re_header = /^\s*(?:\*\*)?(?:# )?(.+?)(?:\*\*)?\s*$/m;
	const matches_header = content.match(re_header);

	if (matches_frontmatter) {
		return matches_frontmatter[1];
	} else if (matches_header) {
		const header = matches_header[1];
		return header.slice(0, 70).trim();
	} else {
    throw new Error(`Missing title in content '${content}'`);
	}
}

function botched_escapes(filename: string): string {
  return botched_transformations(filename)
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
}

function botched_transformations(filename: string): string {
	return filename
	  .replaceAll(".", "-")
	  .replaceAll(":", "-")
		.replaceAll("?", "-")
		.replaceAll("&", "_")
	  .replaceAll("%", "-");
}
