# Solution: Realtime Abuse Masker

## Architecture Overview

```
Participants ──WS──┐
Participants ──WS──┤──► WebSocket Server ──► S3 (abuse list)
Participants ──WS──┘         │
                             │ (Trie in memory)
Creator    ──WS──────────────┘

                    Abuse Admin UI ──► S3
                    (Product Manager)
```

---

## Approach 1: Tokenize + Set Lookup ❌ (Naive)

### How it works
1. Load all abuse words into a `Set` (hash table)
2. Tokenize the incoming message into words (`message.split(" ")`)
3. For each word, check if it exists in the Set
4. If found → replace with `*`s, else copy as-is

### Code
```typescript
const abusedWords = new Set(["shit", "fuck", ...]);

function matchAbuseWords(message: string): string {
  const words = message.split(" ");
  return words.map(word =>
    abusedWords.has(word.toLowerCase()) ? "*".repeat(word.length) : word
  ).join(" ");
}
```

### Time & Space Complexity
| Step | Complexity |
|---|---|
| Split into tokens | O(M) time + O(W) extra space |
| Set lookup per word | O(L) per word (hash compute) |
| Total | O(M) time, O(W) space |

M = message length, W = number of words, L = avg word length

### Drawbacks
- Tokenization allocates an extra array of W strings → **extra memory per message**
- Hash computation for every word is **expensive at scale**
- Cannot do prefix/substring matching

---

## Approach 2: Trie (Character-by-Character) ✅

### How it works
- Build a Trie from all abuse words at server startup
- Iterate **character by character** through the message (single pass)
- Reset the Trie pointer on delimiters (space, `.`, `,`) or on unknown characters
- When `node.isEnd = true` and next char is a delimiter/EOS → mask the word

### Why Trie over Set?
| | Trie | Set |
|---|---|---|
| Time per message | O(M) | O(M) |
| Extra space | None (in-place) | O(W) tokens |
| Prefix matching | ✅ | ❌ |
| Cache locality | Moderate | Good |
| Hash collision | Never | Rare but possible |

Both are O(M), but **Trie needs zero extra memory per message** — no tokenization array.

---

## Trie Implementation

```typescript
// trie.ts
class TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

export class Trie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }
}
```

---

## Core Masking Function

```typescript
function matchAbuseWords(message: string): string {
  let node = root.root;
  let result = "";
  let currentWord = "";
  let isAbuse = false;

  for (let i = 0; i < message.length; i++) {
    const char = message[i];

    if (char === " " || char === "." || char === ",") {
      // Word boundary — flush current word
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
      result += char;           // preserve delimiter
      currentWord = "";
      node = root.root;         // reset trie pointer
      isAbuse = false;
    } else {
      currentWord += char;
      if (!node.children[char]) {
        node = root.root;       // char not in trie — reset gracefully
        isAbuse = false;
      } else {
        node = node.children[char];
        isAbuse = node.isEnd;   // true if full abuse word matched so far
      }
    }

    // Handle last word with no trailing delimiter
    if (i === message.length - 1 && currentWord) {
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
    }
  }

  return result;
}
```

### Trace: `"mondays are shit."`

```
m → in trie? no → reset, currentWord="m"
o,n,d,a,y,s → trie resets each time, isAbuse=false
' ' → result += "mondays ", reset

a,r,e → not in trie, isAbuse=false
' ' → result += "are ", reset

s → trie: root→s ✅
h → trie: s→h ✅
i → trie: h→i ✅
t → trie: i→t ✅, node.isEnd=true → isAbuse=true
'.' → result += "****", result += "."

Final: "mondays are ****."  ✅
```

---

## Time Complexity

| Operation | Complexity | Notes |
|---|---|---|
| `matchAbuseWords` | **O(M)** | Single pass, O(1) per char |
| Load Trie on startup | O(N × L) | One-time cost |
| Broadcast to room | O(C) | C = clients in room |
| **Total per message** | **O(M + C)** | |

M = message length, N = abuse words count, L = avg word length, C = room size

---

## Full WebSocket Server

```typescript
// index.ts
import { WebSocket, WebSocketServer } from "ws";
import url from "url";
import { loadAbusedWords } from "./s3";
import { Trie } from "./trie";
import { wsEvents } from "./utils/ws-events";

const rooms: Map<string, WebSocket[]> = new Map();
const bucket = process.env.BUCKET || "abused-words";
const wss = new WebSocketServer({ port: 8000 });
const root = new Trie();

wss.on("connection", (ws: WebSocket, req) => {
  const parsedUrl = url.parse(req.url!, true);
  const roomId = parsedUrl.query.roomId as string;

  if (!roomId) {
    ws.close();
    return;           // ← critical: stop execution after close
  }

  if (!rooms.has(roomId)) rooms.set(roomId, []);
  rooms.get(roomId)?.push(ws);

  ws.on("message", (data) => {
    const { event, message } = JSON.parse(data.toString());
    switch (event) {
      case wsEvents.sendMessage:
        const parsed_message = matchAbuseWords(message);
        const room = rooms.get(roomId);
        if (!room) return;
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: wsEvents.IncMessage,
              message: parsed_message,
            }));
          }
        });
        break;
    }
  });

  ws.on("close", () => {
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(roomId, room.filter((client) => client !== ws));
    }
  });
});

function matchAbuseWords(message: string): string {
  let node = root.root;
  let result = "";
  let currentWord = "";
  let isAbuse = false;

  for (let i = 0; i < message.length; i++) {
    const char = message[i];
    if (char === " " || char === "." || char === ",") {
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
      result += char;
      currentWord = "";
      node = root.root;
      isAbuse = false;
    } else {
      currentWord += char;
      if (!node.children[char]) {
        node = root.root;
        isAbuse = false;
      } else {
        node = node.children[char];
        isAbuse = node.isEnd;
      }
    }
    if (i === message.length - 1 && currentWord) {
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
    }
  }
  return result;
}

async function loadTrieInMemory() {
  const abused_words = await loadAbusedWords(bucket);
  if (!abused_words) return;
  abused_words.forEach((word) => root.insert(word));
}

loadTrieInMemory();
```

---

## Abuse List Management

### Problem
The abuse dictionary needs to be updated without redeploying the server.

### Solution: Abuse Admin Service

```
Product Manager
      │
      ▼
Abuse Admin UI  ──── updates ────► S3 (abuse-list.txt)
                                        │
                              server polls / webhook
                                        │
                                        ▼
                              reload Trie in memory
```

### Reload Strategy Options

| Strategy | How | Trade-off |
|---|---|---|
| **Poll S3** | `setInterval` every N minutes | Simple, slight delay |
| **SNS/SQS trigger** | S3 event → queue → server | Real-time, more infra |
| **Admin HTTP endpoint** | POST `/reload` on server | Manual trigger, simple |

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Masking location | In-process (same server) | No network hop per message |
| Data structure | Trie | O(M) scan, no tokenization overhead |
| Dictionary storage | S3 | Decoupled, updatable without redeploy |
| Abuse service? | ❌ No separate service | TCP overhead kills latency at scale |