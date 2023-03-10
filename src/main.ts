import { walk } from "https://deno.land/std@0.178.0/fs/walk.ts";
import { dirname, join } from "https://deno.land/std@0.179.0/path/mod.ts";
import { extract } from "https://deno.land/std@0.179.0/encoding/front_matter/yaml.ts";

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
		console.warn(`WARNING: Manually rename directory '${path}'`);
	} else if (isFile) {
		if (!path.endsWith(".md")) {
      console.warn(`WARNING: Skipping non-markdown file '${path}'`);
			continue;
		}

		console.log(`Uppercasing file '${path}'`);

		const dirpath = dirname(path);
		// filename without ".md" extension
		const filename = name.slice(0,-3);
		console.log(dirpath, filename);

		// frontmatter title
		const content = await Deno.readTextFile(path);
    const title = extract(content).title;

		// if lowercase title equals filename, rename filename to title add `.md` extension
		if (title.toLowerCase() == filename) {
			const pathNew = join(dirpath, title + ".md");
			await Deno.rename(path, pathNew);
		} else {
			console.warn(`WARNING: Skipping title different from filename '${path}'`);
		}
	}
}
