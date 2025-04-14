type Listener<T = any> = (payload: T) => void;

export interface EventMap {
    [event: string]: any;
}

export interface WindowMessengerOptions {
    targetWindow: Window;
    targetOrigin?: string;
}

/**
 * 基于 window.postMessage 的事件总线封装
 *
 * @description
 * - 支持泛型事件映射（EventMap）：
 *      - 所有事件名必须在接口中定义
 *      - 事件 payload 自动类型推断
 *
 * - 典型应用场景：
 *      - 父页面与 iframe 之间通信
 *      - 页面与子窗口（window.open）之间通信
 *
 * @example
 * // 定义事件映射
 * interface MyEvents {
 *     ready: { time: number };
 *     ping: string;
 *     pong: string;
 * }
 *
 * // 父页面
 *
 * const messenger = new WindowMessenger<MyEvents>(iframeRef.value!.contentWindow!);
 *
 * messenger.on('pong', (msg) => {
 *     console.log('来自子页面消息：', msg);
 * });
 *
 * messenger.on('ready', ({ time }) => {
 *     console.log('子页面 ready', time);
 *
 *     messenger.emit('ping', 'Who are you?');
 * });
 *
 * // 子页面
 *
 * const messenger = new WindowMessenger<MyEvents>(window.parent);
 *
 * messenger.on('ping', (msg) => {
 *     console.log('来自父页面消息：', msg);
 *
 *     messenger.emit('pong', "I'm 揽佬, 来财 来");
 * });
 *
 * messenger.emit('ready', { time: Date.now() });
 *
 * // 子页面 ready 1744619164984
 * // 来自父页面消息： Who are you?
 * // 来自子页面消息： I'm 揽佬, 来财 来
 */
export class WindowMessenger<T extends EventMap = Record<string, any>> {
    private listeners: Map<keyof T, Set<Listener>> = new Map();
    private targetWindow: Window;
    private targetOrigin: string;
    private handleMessage: (event: MessageEvent) => void;

    /**
     * 构造函数：支持直接传入 Window 或配置对象
     * @param options - 可传入目标窗口对象，或包含目标窗口与 origin 的配置对象
     */
    constructor(options: Window | WindowMessengerOptions) {
        if (this.isWindow(options)) {
            this.targetWindow = options;
            this.targetOrigin = "*";
        } else {
            this.targetWindow = options.targetWindow;
            this.targetOrigin = options.targetOrigin ?? "*";
        }

        // 绑定消息处理器
        this.handleMessage = (event: MessageEvent) => {
            // 安全检查：确保来源窗口与 origin 匹配
            if (this.targetOrigin !== "*" && event.origin !== this.targetOrigin) return;

            const { type, payload } = event.data || {};
            const fns = this.listeners.get(type);

            // type && console.log('type', type);

            if (fns) {
                fns.forEach((fn) => fn(payload));
            }
        };

        window.addEventListener("message", this.handleMessage);
    }

    /**
     * 发送消息给目标窗口
     * @param type 消息事件名
     * @param payload 消息数据
     */
    emit<K extends keyof T>(type: K, payload: T[K]) {
        this.targetWindow.postMessage({ type, payload }, this.targetOrigin);
    }

    /**
     * 监听某个事件
     * @param type 事件名
     * @param listener 响应函数
     */
    on<K extends keyof T>(type: K, listener: (payload: T[K]) => void) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(listener);
    }

    /**
     * 移除事件监听器
     * @param type 事件名
     * @param listener 要移除的函数
     */
    off<K extends keyof T>(type: K, listener: (payload: T[K]) => void) {
        const set = this.listeners.get(type);
        if (set) {
            set.delete(listener);
            if (set.size === 0) this.listeners.delete(type);
        }
    }

    /**
     * 销毁通信通道：移除所有监听器
     */
    destroy() {
        window.removeEventListener("message", this.handleMessage);
        this.listeners.clear();
    }

    /**
     * 判断一个对象是否是 Window 对象
     * @param obj
     * @returns
     */
    private isWindow(obj: any): obj is Window {
        return obj && typeof obj === "object" && "postMessage" in obj && "window" in obj;
    }
}
