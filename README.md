
# @amao/window-messenger

> 基于 `window.postMessage` 的类型安全、事件驱动的通信库，用于 iframe 和窗口之间的通信。

灵感来源于 Node.js 的 `EventEmitter`，并且提供了完整的 TypeScript 类型支持与事件映射类型。

## ✨ 特性

- 🔒 类型安全的事件通信，支持泛型
- 🪟 基于 `window.postMessage` 实现
- 🧩 支持 iframe 或同源跨窗口通信
- 🛠 轻量级，无依赖

## 📦 安装

```bash
npm install @amao/window-messenger
```

或者

```bash
yarn add @amao/window-messenger
```

## 🔧 使用

### 定义共享事件映射

```ts
interface MyEvents {
  ready: { time: number };
  ping: string;
  pong: string;
}
```

### 父页面

```ts
import { WindowMessenger } from '@amao/window-messenger';

const messenger = new WindowMessenger<MyEvents>(iframeRef.value!.contentWindow!);

messenger.on('pong', (msg) => {
  console.log('👶 子页面返回：', msg);
});

messenger.on('ready', ({ time }) => {
  console.log('🚀 子页面已就绪', time);
  messenger.emit('ping', 'Who are you?');
});
```

### 子页面

```ts
import { WindowMessenger } from '@amao/window-messenger';

const messenger = new WindowMessenger<MyEvents>(window.parent);

messenger.on('ping', (msg) => {
  console.log('💬 来自父页面：', msg);
  messenger.emit('pong', "I'm 揽佬, 来财 来");
});

messenger.emit('ready', { time: Date.now() });
```

## 🧩 API

### `new WindowMessenger<T extends EventMap>(targetWindow: Window, targetOrigin = '*')`

创建一个新的 Messenger 实例。

- `T`：事件映射的类型。
- `targetWindow`：通信的目标 window。
- `targetOrigin`：目标窗口的源，默认为 `'*'`。

### `on<K extends keyof T>(event: K, callback: (payload: T[K]) => void): () => void`

监听事件。

### `emit<K extends keyof T>(event: K, payload: T[K]): void`

发送事件。

### `off<K extends keyof T>(event: K, callback: (payload: T[K]) => void): void`

移除事件监听。

## 🔒 安全说明

此库默认将消息发送到 `targetOrigin = '*'`。在生产环境中，建议明确指定目标窗口的 origin 以增强安全性，避免中间人攻击。

---

## 🪪 许可证

[MIT](./LICENSE)

```