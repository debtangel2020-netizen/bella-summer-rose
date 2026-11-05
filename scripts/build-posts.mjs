// Reads every blog post in content/blog/*.md and bundles them into lib/posts.generated.json.
// Runs automatically before each build (see "build" in package.json).
import { promises as fs } from "fs";
import path from "path";

const dir = path.join(process.cwd(), "content", "blog");
const out = path.join(process.cwd(), "lib", "posts.generated.json");

function parse(file, raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      let value = line.slice(i + 1).trim();
      if (/^".*"$/.test(value) || /^'.*'$/.test(value)) value = value.slice(1, -1);
      meta[key] = value;
    }
  }
  const slug = (meta.slug || file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, ""))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const dateFromName = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || dateFromName || new Date().toISOString().slice(0, 10),
    summary: meta.summary || "",
    category: meta.category || "",
    body: body.trim(),
    source: "auto",
  };
}

let files = [];
try {
  files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md")).sort();
} catch {
  files = [];
}
const posts = [];
for (const f of files) posts.push(parse(f, await fs.readFile(path.join(dir, f), "utf8")));
posts.sort((a, b) => b.date.localeCompare(a.date));
await fs.writeFile(out, JSON.stringify(posts, null, 2));
console.log(`Bundled ${posts.length} blog post(s).`);
