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
    return;
  }

  if (!rooms.has(roomId)) {
    rooms.set(roomId, []);
  }

  rooms.get(roomId)?.push(ws);

  ws.on("message", (data) => {
    const { event, message } = JSON.parse(data.toString());
    switch (event) {
      case wsEvents.sendMessage:
        const IncMessage = message;
        const parsed_message = matchAbuseWords(IncMessage);
        const room = rooms.get(roomId);
        if (!room) return;
        room.forEach((client) => {
          if (client != ws && client.readyState == WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: wsEvents.IncMessage,
                message: parsed_message,
              })
            );
          }
        });
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    const room = rooms.get(roomId);
    if (room) {
      rooms.set(
        roomId,
        room.filter((client) => client !== ws)
      );
    }
  });
});

function matchAbuseWords(message: string) {
  let node = root.root;
  let result = "";
  let currentWord = "";
  let isAbuse = false;

  for (let i = 0; i < message.length; i++) {
    let char = message[i];
    if (char == " " || char == "." || char == ",") {
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
      result += char;
      currentWord = "";
      node = root.root;
      isAbuse = false;
      continue;
    }
    currentWord += char;
    if (!node.children[char]) {
      node = root.root;
      isAbuse = false;
      continue;
    }
    node = node.children[char];
    isAbuse = node.isEnd;
    if (i === message.length - 1 && currentWord) {
      result += isAbuse ? "*".repeat(currentWord.length) : currentWord;
    }
  }
  return result;
}

async function loadTrieInMemory() {
  const abused_words = await loadAbusedWords(bucket);
  if (!abused_words) return;
  abused_words.forEach((word) => {
    root.insert(word);
  });
}

loadTrieInMemory();
