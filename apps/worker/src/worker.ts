import { createServer } from "node:http";

const port = Number(process.env.WORKER_PORT ?? 3002);
let heartbeat = new Date().toISOString();

setInterval(() => {
  heartbeat = new Date().toISOString();
}, 5000);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "worker", heartbeat }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`worker listening on ${port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`shutting down worker (${signal})`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
