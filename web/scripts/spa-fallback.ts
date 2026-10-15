/**
GitHub Pages has no SPA fallback: an unknown path serves `404.html`. Copying the app shell there
makes deep links (`/algebra/04_sep23_determinant_properties/`) boot the router.
*/
const dist = new URL("../dist/", import.meta.url);

await Bun.write(new URL("404.html", dist), Bun.file(new URL("index.html", dist)));
console.log("dist/404.html written");
