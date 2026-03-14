# Problem Statement: Realtime Abuse Masker

## Context

A live streaming platform allows creators to broadcast video to up to **100 participants** simultaneously. All participants in a stream are connected to the **same WebSocket server**. During a live stream, participants can send text messages that are broadcast to all other participants in real time.

The platform needs to ensure that **abusive or offensive words are masked** before being delivered to other participants (e.g., `shit` → `****`, `fuck` → `****`).

---

## Requirements

### Functional
- Participants join a live stream room via WebSocket
- Any participant can send a message to the room
- Before broadcasting, the server must scan each message and **mask abusive words** with `*` characters
- The abuse word list is maintained externally and must be **loaded into memory** on server startup

### Non-Functional
- Masking must happen **in-process** — no network calls per message
- The solution must handle **high message throughput** with minimal latency
- The abuse word list must be **updatable** without redeploying the server

---

## Constraints

- Abuse dictionary is stored as a text file on **blob storage (S3)**
- Server downloads and loads the dictionary into memory at startup
- Max **100 WebSocket clients** per room
- Each message is a JSON payload: `{ event: "sendMessage", message: "..." }`

---

## What NOT to do

> Creating a separate "Abuse Masker" microservice that the WebSocket server calls via HTTP is a **poor design**.

- Every message would require a TCP connection (3-way handshake + 2-way teardown)
- Even with persistent connections, network I/O adds unacceptable latency at scale
- **Not everything needs to be a service** — if logic is fast and stateless, keep it in-process

---

## The Core Challenge

Given the abuse dictionary loaded in memory, design a function:

```typescript
function matchAbuseWords(message: string): string
```

That:
1. Scans the input message
2. Identifies abusive words (exact word match, bounded by spaces/punctuation)
3. Replaces each abusive word with `*` repeated for its length
4. Returns the cleaned message

### Example

```
Input:  "mondays are shit."
Output: "mondays are ****."

Input:  "what the fuck is this"
Output: "what the **** is this"
```

---

## Abuse List Management

The abuse word list needs to be updatable by internal teams (e.g., Product Managers) without touching server code.

Design an **Abuse Admin Service** that:
- Provides a UI to add/remove abusive words
- Persists the updated list to S3
- Allows the WebSocket server to reload the updated list