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

  search(word: string) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(word : string) {
    let node = this.root;
    for(const char of word) {
        if(!node.children[char]) return false;
        node = node.children[char];
    }
    return true;
  }
}
