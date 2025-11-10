---
name: js-react-hooks-expert
description: 当需要深度掌握 React Hooks 最佳实践、ahooks 库使用、性能优化与常见问题解决时，加载本技能获取专家级指导与实战方案。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# React Hooks 专家技能

## 适用场景

- 在复杂业务场景下设计和优化 Hooks（数据流、状态管理、性能瓶颈）。
- 快速应用 ahooks 库提供的企业级 Hooks 解决方案。
- 诊断和修复 Hooks 相关的常见问题（闭包陷阱、依赖地狱、竞态条件）。
- 设计可复用、可测试、高性能的自定义 Hooks 架构。

## 前置准备

- React 18+ 环境，支持 Concurrent Features（可选）。
- 安装 ahooks：`npm install ahooks` 或 `pnpm add ahooks`。
- 启用 `eslint-plugin-react-hooks` 规则：`exhaustive-deps`、`rules-of-hooks`。
- TypeScript 项目配置严格模式：`strict: true`。

---

## 第一部分：多场景下的 Hooks 最佳实践

### 1.1 数据获取与异步状态管理

**场景**：从 API 获取数据，处理加载、错误、重试、缓存。

**最佳实践**：

```typescript
// ❌ 不推荐：手动管理多个状态
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ 推荐：使用 useRequest（ahooks）或自定义封装
import { useRequest } from 'ahooks';

function useUserData(userId: string) {
  return useRequest(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    {
      refreshDeps: [userId],        // 依赖变化时自动重新请求
      cacheKey: `user-${userId}`,   // 启用缓存
      staleTime: 5000,              // 缓存有效期
      retryCount: 3,                // 自动重试
      onError: (error) => {
        console.error('Failed to fetch user:', error);
      }
    }
  );
}

// 使用
const { data, loading, error, refresh } = useUserData('123');
```

**关键点**：
- 使用专业库（ahooks/swr/react-query）避免重复造轮子。
- 提供缓存、重试、轮询、依赖刷新等开箱即用能力。
- 统一错误处理和加载状态管理。

---

### 1.2 表单状态与验证

**场景**：管理表单输入、验证、提交、重置。

**最佳实践**：

```typescript
import { useRequest, useMount, useUnmount } from 'ahooks';

// ✅ 使用 ahooks 的 useControllableValue 实现受控组件
import { useControllableValue } from 'ahooks';

function FormInput(props: any) {
  const [value, setValue] = useControllableValue(props);

  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}

// ✅ 结合 useRequest 处理表单提交
function useFormSubmit(onSubmit: (data: any) => Promise<any>) {
  const { loading, run } = useRequest(onSubmit, {
    manual: true,
    onSuccess: (result) => {
      message.success('提交成功');
    },
    onError: (error) => {
      message.error(error.message);
    }
  });

  return { submitting: loading, submit: run };
}
```

**关键点**：
- 使用 `useControllableValue` 实现受控/非受控双模式。
- 表单提交使用 `useRequest` 的 `manual: true` 模式手动触发。
- 分离表单状态管理和业务逻辑。

---

### 1.3 事件监听与订阅管理

**场景**：监听 DOM 事件、WebSocket、第三方库事件。

**最佳实践**：

```typescript
import { useEventListener, useMount, useUnmount } from 'ahooks';

// ✅ 使用 ahooks 的 useEventListener 自动清理
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEventListener('resize', () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  });

  useMount(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  });

  return size;
}

// ✅ WebSocket 订阅管理
function useWebSocket(url: string) {
  const [data, setData] = useState(null);
  const wsRef = useRef<WebSocket | null>(null);

  useMount(() => {
    wsRef.current = new WebSocket(url);
    wsRef.current.onmessage = (e) => setData(JSON.parse(e.data));
  });

  useUnmount(() => {
    wsRef.current?.close();
  });

  return data;
}
```

**关键点**：
- 使用 `useEventListener` 自动处理添加/移除监听器。
- 使用 `useMount`/`useUnmount` 替代 `useEffect`，语义更清晰。
- 订阅类操作必须在清理函数中取消订阅。

---

### 1.4 性能优化：防抖与节流

**场景**：搜索输入、窗口滚动、按钮点击频繁触发。

**最佳实践**：

```typescript
import { useDebounceFn, useThrottleFn, useDebounce } from 'ahooks';

// ✅ 防抖：搜索输入
function SearchInput() {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, { wait: 500 });

  const { data } = useRequest(
    () => searchAPI(debouncedKeyword),
    { refreshDeps: [debouncedKeyword] }
  );

  return (
    <input
      value={keyword}
      onChange={e => setKeyword(e.target.value)}
    />
  );
}

// ✅ 节流：滚动事件
function ScrollHandler() {
  const { run: handleScroll } = useThrottleFn(
    () => {
      console.log('Scrolled to:', window.scrollY);
    },
    { wait: 200 }
  );

  useEventListener('scroll', handleScroll);

  return null;
}
```

**关键点**：
- `useDebounce`：值变化后延迟更新（搜索、输入验证）。
- `useDebounceFn`：函数防抖（按钮提交）。
- `useThrottleFn`：函数节流（滚动、拖拽）。

---

### 1.5 状态持久化

**场景**：将状态同步到 localStorage、sessionStorage。

**最佳实践**：

```typescript
import { useLocalStorageState, useSessionStorageState } from 'ahooks';

// ✅ 自动同步到 localStorage
function useUserPreferences() {
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: 'light'
  });

  const [language, setLanguage] = useLocalStorageState('language', {
    defaultValue: 'zh-CN',
    serializer: (v) => JSON.stringify(v),
    deserializer: (v) => JSON.parse(v)
  });

  return { theme, setTheme, language, setLanguage };
}
```

**关键点**：
- 自动处理序列化/反序列化。
- 跨标签页同步（localStorage 支持）。
- 提供默认值和类型安全。

---

### 1.6 复杂状态管理

**场景**：多步骤表单、购物车、编辑器状态。

**最佳实践**：

```typescript
import { useReducer, useMemo } from 'react';
import { useCreation } from 'ahooks';

// ✅ 使用 useReducer 管理复杂状态
type State = {
  step: number;
  data: Record<string, any>;
  errors: Record<string, string>;
};

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'SET_ERROR'; field: string; error: string };

function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'UPDATE_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value }
      };
    // ... 其他 case
    default:
      return state;
  }
}

function useMultiStepForm() {
  const [state, dispatch] = useReducer(formReducer, {
    step: 0,
    data: {},
    errors: {}
  });

  // ✅ 使用 useCreation 替代 useMemo（性能更优）
  const actions = useCreation(
    () => ({
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      updateField: (field: string, value: any) =>
        dispatch({ type: 'UPDATE_FIELD', field, value })
    }),
    []
  );

  return { state, actions };
}
```

**关键点**：
- 复杂状态使用 `useReducer` 而非多个 `useState`。
- 使用 `useCreation` 替代 `useMemo` 避免空数组依赖。
- 保持 action 纯函数化，便于测试。

---

### 1.7 竞态条件处理

**场景**：快速切换 Tab、搜索词变化导致请求乱序。

**最佳实践**：

```typescript
import { useRequest } from 'ahooks';

// ✅ ahooks 自动处理竞态
function useTabData(tabId: string) {
  const { data, loading } = useRequest(
    () => fetchTabData(tabId),
    {
      refreshDeps: [tabId],
      // 自动取消上一次请求
      ready: !!tabId
    }
  );

  return { data, loading };
}

// ❌ 手动处理竞态（不推荐）
function useTabDataManual(tabId: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchTabData(tabId).then(result => {
      if (!cancelled) setData(result);
    });

    return () => { cancelled = true; };
  }, [tabId]);

  return data;
}
```

**关键点**：
- 使用 `useRequest` 的 `refreshDeps` 自动取消旧请求。
- 手动处理需使用 `AbortController` 或标志位。

---

## 第二部分：ahooks 核心 Hooks 详解

### 2.1 生命周期类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useMount` | 组件挂载时执行 | 初始化数据、订阅事件 |
| `useUnmount` | 组件卸载时执行 | 清理定时器、取消订阅 |
| `useUpdateEffect` | 仅在更新时执行（跳过首次） | 监听依赖变化，排除初始化 |

```typescript
import { useMount, useUnmount, useUpdateEffect } from 'ahooks';

function Component() {
  useMount(() => {
    console.log('组件已挂载');
  });

  useUnmount(() => {
    console.log('组件即将卸载');
  });

  useUpdateEffect(() => {
    console.log('依赖更新了（首次不执行）');
  }, [dependency]);
}
```

---

### 2.2 状态管理类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useBoolean` | 管理布尔状态 | 开关、Modal 显隐 |
| `useToggle` | 在两个状态间切换 | Tab 切换、主题切换 |
| `useSetState` | 类似 Class 组件的 setState | 对象状态合并更新 |
| `useLocalStorageState` | 持久化到 localStorage | 用户偏好、缓存 |
| `useSessionStorageState` | 持久化到 sessionStorage | 临时会话数据 |

```typescript
import { useBoolean, useToggle, useSetState } from 'ahooks';

// ✅ 布尔状态
const [visible, { toggle, setTrue, setFalse }] = useBoolean(false);

// ✅ 切换状态
const [status, { toggle, set }] = useToggle('active', 'inactive');

// ✅ 对象状态
const [state, setState] = useSetState({
  name: '',
  age: 0,
  email: ''
});
setState({ name: 'Alice' }); // 自动合并，无需展开
```

---

### 2.3 请求类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useRequest` | 异步请求管理 | API 调用、数据获取 |
| `usePagination` | 分页请求 | 表格、列表分页 |
| `useInfiniteScroll` | 无限滚动加载 | 瀑布流、Feed 流 |

```typescript
import { useRequest, usePagination } from 'ahooks';

// ✅ 基础请求
const { data, loading, error, run, refresh } = useRequest(fetchUserList, {
  manual: false,          // 自动执行
  cacheKey: 'userList',   // 缓存 key
  staleTime: 60000,       // 缓存 1 分钟
  retryCount: 3           // 失败重试 3 次
});

// ✅ 分页
const { data, loading, pagination } = usePagination(
  ({ current, pageSize }) => fetchList({ page: current, size: pageSize }),
  {
    defaultPageSize: 10
  }
);
```

---

### 2.4 副作用类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useDebounce` | 防抖值 | 搜索框输入 |
| `useDebounceFn` | 防抖函数 | 表单提交 |
| `useThrottle` | 节流值 | 滚动位置 |
| `useThrottleFn` | 节流函数 | 滚动事件处理 |
| `useInterval` | 定时器 | 轮询、倒计时 |
| `useTimeout` | 延迟执行 | Toast 自动关闭 |

```typescript
import { useDebounce, useThrottleFn, useInterval } from 'ahooks';

// ✅ 防抖搜索
const [keyword, setKeyword] = useState('');
const debouncedKeyword = useDebounce(keyword, { wait: 500 });

// ✅ 节流滚动
const { run: handleScroll } = useThrottleFn(() => {
  console.log('Scroll:', window.scrollY);
}, { wait: 200 });

// ✅ 定时轮询
useInterval(() => {
  fetchData();
}, 3000); // 每 3 秒执行
```

---

### 2.5 DOM 与 UI 类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useEventListener` | 事件监听 | 全局事件、组件事件 |
| `useClickAway` | 点击外部区域 | 下拉菜单关闭 |
| `useScroll` | 监听滚动位置 | 返回顶部按钮 |
| `useSize` | 监听元素尺寸 | 响应式布局 |
| `useHover` | 监听 hover 状态 | 悬停提示 |
| `useFocusWithin` | 监听焦点状态 | 表单聚焦样式 |

```typescript
import { useEventListener, useClickAway, useScroll, useSize } from 'ahooks';

// ✅ 全局键盘事件
useEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ✅ 点击外部关闭
const ref = useRef(null);
useClickAway(() => {
  setVisible(false);
}, ref);

// ✅ 滚动位置
const scroll = useScroll(document);
const showBackTop = scroll?.top > 300;

// ✅ 元素尺寸
const ref = useRef(null);
const size = useSize(ref);
```

---

### 2.6 高级工具类

| Hook | 描述 | 使用场景 |
|------|------|----------|
| `useCreation` | 性能优化的 useMemo | 避免空依赖数组 |
| `useLatest` | 获取最新值（不触发渲染） | 闭包陷阱修复 |
| `useMemoizedFn` | 持久化函数引用 | 避免子组件重渲染 |
| `useReactive` | 响应式对象 | 类似 Vue 的 reactive |
| `useLockFn` | 防止并发执行 | 表单重复提交 |

```typescript
import { useCreation, useLatest, useMemoizedFn, useLockFn } from 'ahooks';

// ✅ useCreation：替代 useMemo
const expensiveValue = useCreation(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// ✅ useLatest：解决闭包陷阱
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useLatest(count);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // 始终是最新值
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ✅ useMemoizedFn：持久化函数
const handleClick = useMemoizedFn(() => {
  console.log(count); // 始终访问最新 count
});

// ✅ useLockFn：防止并发
const { run: submit } = useLockFn(async () => {
  await submitForm();
}, []);
```

---

## 第三部分：常见问题与解决方案

### 3.1 闭包陷阱

**问题**：定时器、事件监听器中获取不到最新状态。

```typescript
// ❌ 问题代码
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 始终是 0
      setCount(count + 1); // 无法正常递增
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖导致闭包
}

// ✅ 解决方案 1：使用 useLatest
import { useLatest } from 'ahooks';

function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useLatest(count);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // 最新值
      setCount(c => c + 1); // 使用函数式更新
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}

// ✅ 解决方案 2：使用函数式更新
setCount(prevCount => prevCount + 1);
```

---

### 3.2 依赖地狱

**问题**：useEffect 依赖数组过长，难以维护。

```typescript
// ❌ 问题代码
useEffect(() => {
  fetchData(userId, categoryId, startDate, endDate, filters);
}, [userId, categoryId, startDate, endDate, filters]); // 依赖过多

// ✅ 解决方案 1：使用 useRequest
const { data } = useRequest(
  () => fetchData({ userId, categoryId, startDate, endDate, filters }),
  { refreshDeps: [userId, categoryId, startDate, endDate, filters] }
);

// ✅ 解决方案 2：提取自定义 Hook
function useFetchData(params: FetchParams) {
  return useRequest(() => fetchData(params), {
    refreshDeps: [params.userId, params.categoryId]
  });
}

// ✅ 解决方案 3：使用 useDeepCompareEffect（谨慎使用）
import { useDeepCompareEffect } from 'ahooks';

useDeepCompareEffect(() => {
  fetchData(filters); // filters 深度比较
}, [filters]);
```

---

### 3.3 内存泄漏

**问题**：组件卸载后仍执行 setState。

```typescript
// ❌ 问题代码
useEffect(() => {
  fetchData().then(data => {
    setData(data); // 组件卸载后报错
  });
}, []);

// ✅ 解决方案 1：使用 useRequest 自动处理
const { data } = useRequest(fetchData);

// ✅ 解决方案 2：手动取消
useEffect(() => {
  let cancelled = false;

  fetchData().then(data => {
    if (!cancelled) setData(data);
  });

  return () => { cancelled = true; };
}, []);

// ✅ 解决方案 3：使用 useUnmountedRef
import { useUnmountedRef } from 'ahooks';

function Component() {
  const unmountedRef = useUnmountedRef();

  useEffect(() => {
    fetchData().then(data => {
      if (!unmountedRef.current) {
        setData(data);
      }
    });
  }, []);
}
```

---

### 3.4 无限循环

**问题**：useEffect 触发状态更新，导致无限重渲染。

```typescript
// ❌ 问题代码
const [list, setList] = useState([]);

useEffect(() => {
  setList([...list, newItem]); // 依赖 list 导致循环
}, [list]);

// ✅ 解决方案 1：移除依赖
useEffect(() => {
  setList(prev => [...prev, newItem]);
}, []); // 仅执行一次

// ✅ 解决方案 2：使用 ref 存储
const listRef = useRef([]);

useEffect(() => {
  listRef.current = [...listRef.current, newItem];
}, []);
```

---

### 3.5 过度重渲染

**问题**：父组件更新导致子组件不必要的重渲染。

```typescript
// ❌ 问题代码
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => { // 每次渲染都是新函数
    console.log('Clicked');
  };

  return <Child onClick={handleClick} />;
}

// ✅ 解决方案 1：使用 useMemoizedFn
import { useMemoizedFn } from 'ahooks';

function Parent() {
  const handleClick = useMemoizedFn(() => {
    console.log('Clicked');
  });

  return <Child onClick={handleClick} />;
}

// ✅ 解决方案 2：React.memo + useCallback
const Child = React.memo(({ onClick }) => {
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <Child onClick={handleClick} />;
}
```

---

### 3.6 异步更新丢失

**问题**：快速连续调用 setState，部分更新丢失。

```typescript
// ❌ 问题代码
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
  setCount(count + 1); // 不会累加到 2
}

// ✅ 解决方案：使用函数式更新
function increment() {
  setCount(c => c + 1);
  setCount(c => c + 1); // 正确累加到 2
}
```

---

### 3.7 跨组件状态共享

**问题**：多个组件需要共享同一状态。

```typescript
// ✅ 解决方案 1：使用 Context + useContext
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const { theme, setTheme } = useContext(ThemeContext);
}

// ✅ 解决方案 2：使用 zustand（推荐）
import create from 'zustand';

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// 任意组件中使用
const { count, increment } = useStore();
```

---

## 质量校验

- ESLint `exhaustive-deps` 规则零警告。
- 使用 React DevTools Profiler 检查无不必要的重渲染。
- ahooks 使用的 Hooks 必须有对应的 TypeScript 类型声明。
- 自定义 Hooks 提供单元测试覆盖（`@testing-library/react-hooks`）。

## 失败与回滚

- 闭包陷阱导致状态错误：使用 `useLatest` 或函数式更新修复。
- 内存泄漏警告：检查 useEffect 清理函数，补充取消逻辑。
- 性能问题：使用 Profiler 定位瓶颈，应用 `useMemoizedFn`/`React.memo`。
- 依赖循环：简化依赖数组，提取独立 Hook 或使用 `useRequest`。

## 交付物

- Hooks 使用文档与示例代码。
- 性能分析报告（Profiler 截图/数据）。
- 单元测试覆盖率报告。
- 常见问题排查清单与修复记录。
