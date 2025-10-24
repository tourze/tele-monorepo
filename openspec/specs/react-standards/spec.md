# React 开发规范

## Purpose

定义 Vibe-Shell 项目中 React 应用开发的统一标准和最佳实践，确保代码质量和一致性。

## Requirements

### Requirement: 组件开发规范

所有 React 组件必须遵循统一的开发模式和结构。

#### Scenario: 函数组件定义
- **WHEN** 创建新的 React 组件
- **THEN** 必须使用函数式组件 + Hooks 模式
- **AND** 组件命名使用 PascalCase
- **AND** 优先使用箭头函数定义

```javascript
// 正确示例
const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);

  return <div>{user?.name}</div>;
};

export default UserProfile;
```

#### Scenario: Props 类型定义
- **WHEN** 定义组件 Props
- **THEN** 使用 TypeScript 接口定义
- **AND** 接口命名格式为 `ComponentNameProps`
- **AND** 为所有 Props 提供明确的类型定义

```javascript
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
  children?: React.ReactNode;
}
```

#### Scenario: 自定义 Hooks
- **WHEN** 创建可复用的状态逻辑
- **THEN** 自定义 Hook 必须以 `use` 开头
- **AND** 返回值类型明确
- **AND** 遵循 Hooks 使用规则

```javascript
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, loading, error };
};
```

### Requirement: 文件和目录结构

React 组件必须有清晰的文件组织结构。

#### Scenario: 组件文件组织
- **WHEN** 创建复杂组件
- **THEN** 按功能模块组织文件结构
- **AND** 使用 index.ts 作为入口文件
- **AND** 样式文件使用 `.module.less` 后缀

```
components/
├── UserProfile/
│   ├── index.ts           # 导出入口
│   ├── UserProfile.tsx    # 主组件
│   ├── types.ts           # 类型定义
│   ├── hooks.ts           # 自定义 Hooks
│   └── styles.module.less # 样式文件
```

#### Scenario: 页面组件组织
- **WHEN** 创建页面级组件
- **THEN** 放置在 `src/pages/` 目录下
- **AND** 按路由路径组织子目录
- **AND** 每个页面可有独立的 components 子目录

### Requirement: 状态管理

应用状态管理必须遵循项目既定模式。

#### Scenario: UmiJS Models 使用 (utc-react)
- **WHEN** 需要全局状态管理
- **THEN** 使用 UmiJS 内置的 model 系统
- **AND** model 文件放置在 `src/models/` 目录
- **AND** 遵循 dva 模式规范

```javascript
// src/models/user.ts
export default {
  namespace: 'user',
  state: {
    currentUser: null,
    loading: false,
  },
  effects: {
    *fetchUser({ payload }, { call, put }) {
      yield put({ type: 'setLoading', payload: true });
      // ...
    },
  },
  reducers: {
    setLoading(state, { payload }) {
      return { ...state, loading: payload };
    },
  },
};
```

#### Scenario: 本地状态管理
- **WHEN** 组件内部状态
- **THEN** 优先使用 `useState` 和 `useReducer`
- **AND** 复杂状态逻辑使用 `useReducer`
- **AND** 避免过度使用全局状态

### Requirement: 样式开发

样式开发必须遵循项目既定的 CSS 方案。

#### Scenario: Less Modules 使用 (utc-react)
- **WHEN** 编写组件样式
- **THEN** 使用 CSS Modules with Less
- **AND** 文件命名格式为 `ComponentName.module.less`
- **AND** 使用 BEM 命名规范

```less
.userProfile {
  &__header {
    display: flex;
    align-items: center;
  }

  &__content {
    margin-top: 16px;
  }

  &--loading {
    opacity: 0.6;
  }
}
```

#### Scenario: 动态样式 (antd-style)
- **WHEN** 需要主题相关的动态样式
- **THEN** 使用 antd-style 库
- **AND** 创建样式对象并使用主题变量

```javascript
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
  },
}));
```

### Requirement: API 通信模式

API 调用必须使用统一的通信模式。

#### Scenario: 统一 API 调用 (utc-react)
- **WHEN** 进行后端 API 调用
- **THEN** 使用 `callAPI` 工具函数
- **AND** 所有调用遵循 JSON-RPC 格式
- **AND** 在 services 目录中创建专门的 API 函数

```javascript
// src/services/user.ts
import { callAPI } from './common';

export async function fetchUserProfile(userId: string) {
  return callAPI('getUserProfile', { userId });
}

export async function updateUserProfile(data: UpdateUserData) {
  return callAPI('updateUserProfile', data);
}
```

#### Scenario: 错误处理
- **WHEN** API 调用失败
- **THEN** 统一错误处理机制
- **AND** 显示用户友好的错误信息
- **AND** 记录必要的错误日志

### Requirement: 代码质量控制

代码必须符合质量标准以确保可维护性。

#### Scenario: ESLint 规则遵循
- **WHEN** 编写代码
- **THEN** 遵循项目的 ESLint 配置
- **AND** 文件行数不超过限制 (页面组件 300行，其他 500行)
- **AND** 函数行数不超过限制 (工具函数 50行，其他 100行)

#### Scenario: TypeScript 严格模式
- **WHEN** 使用 TypeScript
- **THEN** 启用严格模式
- **AND** 避免使用 `any` 类型
- **AND** 为所有函数参数和返回值提供类型

### Requirement: 性能优化

React 组件必须考虑性能优化。

#### Scenario: 组件优化
- **WHEN** 组件频繁重渲染
- **THEN** 使用 `React.memo` 包装组件
- **AND** 对于昂贵计算使用 `useMemo`
- **AND** 对于函数引用使用 `useCallback`

```javascript
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  const handleUpdate = useCallback((newData) => {
    onUpdate(newData);
  }, [onUpdate]);

  return <div>{/* 渲染逻辑 */}</div>;
});
```

#### Scenario: 列表渲染优化
- **WHEN** 渲染长列表
- **THEN** 为每个列表项提供稳定的 `key` prop
- **AND** 考虑使用虚拟滚动
- **AND** 避免在渲染函数中创建新对象

### Requirement: 测试友好的代码

代码结构必须便于测试。

#### Scenario: 组件可测试性
- **WHEN** 设计组件
- **THEN** 将业务逻辑与 UI 分离
- **AND** 通过 Props 传入依赖
- **AND** 避免在组件中直接调用外部 API

#### Scenario: Mock 数据管理
- **WHEN** 需要测试数据
- **THEN** 在测试目录中创建 mock 数据
- **AND** 保持 mock 数据与真实数据结构一致

### Requirement: 兼容性考虑

代码必须考虑不同项目的兼容性。

#### Scenario: 依赖版本兼容
- **WHEN** 选择第三方库
- **THEN** 考虑与 React 16 和 React 17 的兼容性
- **AND** 优先选择社区维护良好的库
- **AND** 避免引入过于沉重的依赖

#### Scenario: 浏览器兼容性
- **WHEN** 使用现代 JavaScript 特性
- **THEN** 确保目标浏览器支持
- **AND** 必要时添加 polyfill
- **AND** 考虑 IE11 兼容性 (seven-fish 项目)