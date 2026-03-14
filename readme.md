# System-Design-Problems-With-Prototypes

> Real system design problems — each with a working prototype, architecture breakdown, and implementation notes.

This repository bridges the gap between theoretical system design and actual code. Every problem comes with a **working prototype** you can run locally, not just diagrams and bullet points.

---

## What's Inside

Each problem folder contains:

- `problem_statement.md` — the problem, constraints, and requirements
- `solution.md` — architecture decisions, trade-offs, and complexity analysis
- `prototype/` — a runnable implementation of the solution

---

## Problems

| # | Problem | Core Concept | Prototype |
|---|---------|-------------|-----------|
| 01 | [Realtime Abuse Masker](#01-realtime-abuse-masker) | Trie, WebSocket, In-process filtering | ✅ |

---

## 01 — Realtime Abuse Masker

**Problem:** A live streaming platform with up to 100 participants per room needs to mask abusive words in real-time chat messages before broadcasting them to other participants.

**Key Design Decision:** The abuse masker runs **in-process** inside the WebSocket server — no separate microservice. Making a network call per message (TCP handshake + teardown) would be unacceptably slow at scale.

**Data Structure:** A **Trie** loaded from S3 on startup. Single O(N) pass over each message character-by-character — no tokenization, no extra memory allocation per message.

```
Architecture:

Participants ──WS──► WebSocket Server ◄── S3 (abuse-list.txt)
                          │
                    Trie in memory
                    matchAbuseWords()
                          │
             ──WS──► All other participants
```

**Stack:** TypeScript, Bun, `ws`

```bash
cd 01-realtime-abuse-masker/prototype
bun install
bun run dev
```

**What it covers:**
- Trie vs Set vs naive array — when each is appropriate
- Why not to make abuse masking a microservice
- Character-by-character scanning with graceful reset on unknown characters
- Abuse Admin Service pattern for updating the word list without redeployment

---

## Running Any Prototype

Each prototype is self-contained. Navigate to the `prototype/` folder and follow the README inside. Most require only:

```bash
bun install
bun run dev
```

Environment variables (like S3 bucket names) are documented in each prototype's `.env.example`.

---

## Design Philosophy

### Not everything is a service

A common mistake in system design is reaching for a microservice whenever a concern feels "separate." This repo demonstrates when to keep logic **in-process** — and why that decision can be the difference between a fast system and a slow one.

### Prototypes over pseudocode

Every solution here compiles and runs. Design decisions are validated against real constraints, not hypothetical ones.

### Trade-offs over "best practices"

Each solution document explains *why* a particular approach was chosen and what it gives up. There is no universally correct answer — only context-appropriate decisions.

---

## Folder Structure

```
System-Design-Problems-With-Prototypes/
├── 01-realtime-abuse-masker/
│   ├── problem_statement.md
│   ├── solution.md
│   └── prototype/
│       ├── src/
│       │   ├── index.ts
│       │   ├── trie.ts
│       │   ├── s3.ts
│       │   └── utils/
│       ├── package.json
│       └── .env.example
└── README.md
```

---

## Contributing

If you want to add a new problem:

1. Create a folder: `XX-problem-name/`
2. Add `problem_statement.md` following the existing format
3. Add `solution.md` with architecture, trade-offs, and complexity analysis
4. Add a working `prototype/` with a `README.md` and `.env.example`
5. Open a PR — include a one-line summary of the core design insight

---

## Inspired By

These problems are inspired by real engineering challenges and the system design work of [Arpit Bhayani](https://arpitbhayani.me/), whose notes on pragmatic system design inform much of the thinking here.

---

## License

MIT