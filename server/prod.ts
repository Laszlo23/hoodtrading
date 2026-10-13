import { createServer } from "node:http";
import { handle } from "./api";

const SITE = "https://hoodtrading.aibusiness.fun";
const PORT = Number(process.env.PORT || 3055);

function joinPage(code: string): string {
  const safe = code.replace(/[^A-Za-z0-9-]/g, "").slice(0, 24) || "HOOD";
  const page = `${SITE}/join/${safe}`;
  const dest = `/?ref=${encodeURIComponent(safe)}`;
  const title = `Join HOOD Desk with ${safe}`;
  const description = `Stake HOOD, hold xHOOD. Open the desk with ${safe} and pick up 50 points.`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="HOOD Desk" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${page}" />
  <meta property="og:image" content="${SITE}/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${SITE}/og.png" />
  <meta http-equiv="refresh" content="1;url=${dest}" />
  <link rel="canonical" href="${page}" />
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #f4f6f0; font-family: Georgia, serif; }
    a { color: #111408; background: #ccff00; text-decoration: none; border-radius: 999px; padding: 12px 18px; font-family: Inter, sans-serif; font-weight: 700; }
    p { color: #8a9278; font-family: Inter, sans-serif; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>The street is open. This page continues into the desk.</p>
    <a href="${dest}">Enter the desk</a>
  </main>
</body>
</html>`;
}

const server = createServer((req, res) => {
  const path = req.url?.split("?")[0] ?? "";
  const join = path.match(/^\/join\/([^/]+)\/?$/);
  if (join && (req.method === "GET" || req.method === "HEAD")) {
    const html = joinPage(decodeURIComponent(join[1]));
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "public, max-age=60");
    res.setHeader("content-length", Buffer.byteLength(html));
    res.end(req.method === "HEAD" ? undefined : html);
    return;
  }
  void handle(req, res).then((done) => {
    if (!done) {
      res.statusCode = 404;
      res.end();
    }
  }).catch(() => {
    res.statusCode = 500;
    res.end();
  });
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`hoodtrading api ${PORT}\n`);
});
