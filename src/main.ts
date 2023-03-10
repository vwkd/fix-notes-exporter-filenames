import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
import { dirname, join } from "https://deno.land/std@0.179.0/path/mod.ts";

const ROOT = Deno.args[1];

if (!ROOT) {
  throw new Error(`argument of tree root path missing.`);
}

console.log(`Uppercasing notes in '${ROOT}'...`);

// walk through files
for await (const {path, name, isFile, isDirectory, isSymlink} of walk(ROOT)) {
	// console.log(`Processing entry '${JSON.stringify(path)}'`);
	if (isSymlink) {
		console.warn(`WARNING: Skipping symlink '${path}'`);
		continue;
	} else if (isDirectory) {
		console.info(`NOTE: Manually rename directory '${path}'`);
	} else if (isFile) {
		if (!path.endsWith(".md")) {
      console.warn(`WARNING: Skipping non-markdown file '${path}'`);
			continue;
		}

		console.log(`Uppercasing file '${path}'`);

		const dirpath = dirname(path);
		// filename without ".md" extension
		const filename = name.slice(0,-3);
		// console.log(dirpath, filename);

		// frontmatter title
		const content = await Deno.readTextFile(path);
  //   const frontmatter = extract(content);
		// const title = frontmatter.attrs.title;
		// console.log(frontmatter, title);
		const title = get_title(content);
		const titleBotched = unnecessary_umlaute(title);
		const titleBotchedLowercase = unnecessary_umlaute(title.toLowerCase());
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
			console.warn(`WARNING: Skipping title different from filename '${path}'`);
		}
	}
}

function get_title(content: string): string {
  const re = /^----\ntitle: (.+)$/m;
	const matches = content.match(re);
	return matches[1]
}

function unnecessary_umlaute(filename: string): string {
  return unnecessary_escapes(filename)
		// .replaceAll("Ä", "ä")
		// .replaceAll("Ö", "ö")
		// .replaceAll("Ü", "ü")
		.replaceAll("ä", "\u0061\u0308")
		.replaceAll("ö", "\u006F\u0308")
		.replaceAll("ü", "\u0075\u0308")
}

function unnecessary_escapes(filename: string): string {
  return filename
	  .replaceAll(".", "-")
	  .replaceAll(":", "-")
		.replaceAll("?", "-");
}
