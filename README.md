# DNS Adblock (Work in Progress)

A lightweight Node.js DNS forwarder that sits on your local network (eventually on a cheap Raspberry Pi) and proxies DNS queries to an upstream resolver (currently Google Public DNS `8.8.8.8`). Planned next step: filter out ad / tracking domains so streaming shows (e.g. Sopranos) load fast without a barrage of ads.

---

## ✨ Current Status

- Listens on UDP port **53**.
- Receives raw DNS queries from clients on your network.
- Forwards queries unchanged to upstream resolver `8.8.8.8`.
- Receives upstream responses and sends them back to the original client.
- Logs queries and responses (basic domain decoding coming online).

This is **not** blocking ads yet; filtering layer and caching are still to be implemented.

---

## 🔭 Roadmap

| Phase | Goal                        | Notes                                                              |
| ----- | --------------------------- | ------------------------------------------------------------------ |
| 1     | Raw forwarding (DONE)       | Plumbing + logging                                                 |
| 2     | Domain parsing improvements | Properly decode question section, handle compression pointers      |
| 3     | Blocklists                  | Load public lists (e.g. EasyList, Pi-hole style) + in-memory match |
| 4     | Response modification       | Return NXDOMAIN / 0.0.0.0 for blocked domains                      |
| 5     | Metrics + caching           | Cache A/AAAA responses; expose Prom endpoint                       |
| 6     | Raspberry Pi deploy         | Systemd service, health checks                                     |

---

## 🧱 Architecture (Simplified)

```
┌──────────┐      DNS Query       ┌──────────────┐      Forward      ┌───────────────┐
│ Client(s)│ ───────────────────▶ │ This Server  │ ────────────────▶ │ Upstream (8.8.8.8)│
└──────────┘                      │  (udp4 53)   │                   └───────────────┘
    ▲                             │              │                          ▼
    │          DNS Response       │              │       DNS Response       │
    └─────────────────────────────┴──────────────┴──────────────────────────┘
                     (Future: Filtering + Cache layer in the middle)
```

### Data Flow

1. Client sends DNS packet to this server on UDP/53.
2. Server logs and forwards the raw packet to upstream resolver.
3. Upstream replies; server logs and relays response back to original client.
4. (Future) Before forwarding upstream / responding: check blocklist & optionally short‑circuit with synthetic response.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (for the built-in `node:test` features + modern APIs)
- UDP port 53 available (requires elevated privileges or capability on Linux)

### Build & Run

The current start script builds TypeScript then runs `dist/index.js`:

```bash
npm run start
```

If you want to run the TypeScript server file directly during development:

```bash
npx ts-node src/index.ts
```

(Adjust path if the entrypoint differs.)

### Running on Port 53

On macOS or Linux you may need sudo:

```bash
sudo npm run start
```

On Linux you can alternatively grant the binary the capability:

```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

Then you can run without sudo. (Remember this persists until removed.)

---

## 📡 Pointing Devices to It

1. Find the machine's LAN IP (e.g. `192.168.1.42`).
2. On another device's network settings, set DNS to that IP only (or primary).
3. Watch logs for incoming queries.

> Tip: Many routers let you set a custom DNS at the DHCP level so all clients automatically use your server.

---

## 🧪 Testing

The repo uses `node:test` in `src/__tests__/`. Current `package.json` test script:

```json
"test": "ts-node ./src/__tests__/*.test.ts"
```

Run:

```bash
npm test
```

If you prefer the native runner without ts-node overhead you can switch to:

```bash
node --test --import ts-node/register src/__tests__/**/*.test.ts
```

Or compile first and test against JS output.

### Example Test Intent

`server.test.ts` asserts that the UDP server binds and logs the startup message. (Adjustments may be needed so the mock sees the `console.log` after binding.)

---

## 🛡️ Security & Limitations

- No rate limiting or abuse protection yet.
- No TLS (DNS over HTTPS / TLS) support; pure UDP port 53.
- No caching: every query hits upstream, adding latency vs local cache.
- No filtering: all domains currently pass through.
- Running as root / elevated may pose risk; isolate on its own box (Raspberry Pi) and keep system patched.

---

## ⚠️ Disclaimer

Educational / personal use.

---

## 🙋 FAQ

**Why Google DNS?** Reliable + globally available; can be swapped for Cloudflare `1.1.1.1` later.

**Why not Pi-hole?** This is a learning project to build pieces incrementally and understand DNS internals.

**Can I add blocklists now?** Yes—next step is wiring a loader; see roadmap.
