import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 4173);
const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const file = assets.get(pathname) ?? (pathname.match(/^\/(?:mk-music-url|s)\/[a-z0-9]+\/?$/i)
    ? assets.get("/index.html")
    : null);

  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to read app files");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`MK MUSIC URL is running at http://localhost:${port}`);
});