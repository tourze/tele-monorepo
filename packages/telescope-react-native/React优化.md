# React 组件拆分与性能优化计划

## 现状与总体目标
- `src/app/App.tsx`、`src/app/routes/Home.tsx`、`src/app/routes/Landing.tsx` 等核心页面同时承担初始化、业务逻辑与 UI 渲染，组件内部状态与副作用高度耦合，导致重复渲染频繁、代码难以扩展。
- 多个页面（例如 `src/app/routes/play/Apps.tsx`、`src/app/routes/user-center/ListLinks.tsx`）采用 `ScrollView` + 内联函数渲染长列表或卡片，缺乏虚拟化与渲染缓存，滚动性能存在隐患。
- 通用组件（如 `src/components/list/ListItem.tsx`、`src/components/button` 系列）缺少 `React.memo`、`useCallback` 的配合使用，易随父组件状态变化而重复渲染。
- 状态层 `src/hooks/useStorage.ts` 统一分发所有 key 的更新事件，导致订阅相同 hook 的组件在无关 key 更新时也会参与 diff，需要更细粒度的选择逻辑。
- 目标：在不改变业务功能的前提下，拆分复杂组件，构建可复用的逻辑层与展示层，降低首屏与热点页面的渲染成本，并为后续性能监控与预加载策略打基础。

## 执行要求
- [x] TODO-Rule-单项闭环：每项优化工作完成后必须即时更新本文件，包含状态变更与实际处理说明，确保文档与实现保持一致。
  - 完成说明：当前迭代已补充执行规则，并首次按要求更新文档与状态，后续每次变更必须同步维护。
- [x] TODO-Rule-记录规范：每次提交需注明涉及的 TODO 编号、改动范围及验证方式，便于追踪。
  - 完成说明：文档内各 TODO 项均明确编号与处理说明模版，提交时已在记录中注明所涉任务。

## TODO 总览
- [ ] TODO-Home-拆分：重构 `Home` 页的逻辑层与展示层，实现按职责拆分与渲染隔离。
- [ ] TODO-Landing-状态机：为 `Landing` 页引入显式状态机与重试机制，提升可靠性。
- [ ] TODO-App-入口治理：梳理应用入口初始化流程，拆分 `App` 组件职责。
- [x] TODO-Play-列表优化：对运营模块的列表渲染做虚拟化与 memo 化改造。
  - 完成说明：`Play` 模块 `Apps.tsx`、`Peoples.tsx` 均替换为 `FlatList`，结合 `useCmsList`、`AppGridItem`、`PeopleCard` 实现虚拟化和子项 memo 化，避免滚动重绘。
- [x] TODO-UserCenter-组件化：优先优化用户中心页面与通用组件的渲染效率。
  - 完成说明：用户中心入口改为 `FlatList`，并补齐 `GridMenus`、`UserHeader`、通用按钮与列表的 memo/可配置接口，实现组件化治理。
- [x] TODO-Storage-细粒度订阅：为 `useStorage` 与相关状态层提供选择器能力。
- [ ] TODO-Performance-工具链：完善性能监控、调试与验证链路。

## 拆分与模块化优先级

### 1. 首页 `Home` 模块（`src/app/routes/Home.tsx`）
- **问题定位**：文件当前约 190 行（`wc -l` 统计 192），虽较早期已有所缩减，但仍直接承载 VPN 生命周期、测速调度、存储读写与导航副作用；`ConnectBtn.tsx` 长达 294 行，内含自动断开、节点挑选、Loading 控制与埋点等复杂逻辑，使页面渲染与业务副作用高度耦合。
- **拆分方案**：
  - [ ] TODO-Home-拆分：逻辑 hook 重构
    - 方法：提炼 `useHomeConnection`、`useSpeedInspector`、`useHomeNotifications` 等 hook；对现有副作用按照 VPN 生命周期、测速调度、导航副作用三个维度拆分，使用 `useRef` 保持跨渲染状态。
    - 方向：将与设备事件或定时任务相关的监听统一放入 hook，暴露状态、动作与清理函数，避免 `Home` 组件直接与底层 API 交互。
    - 进展：首阶段已抽离 `useHomeSpeedMonitor`，将测速缓存、批量 ping 调度移出页面组件，为后续连接与通知逻辑拆分铺路。
    - 进展：`useHomeConnection` 接管自动重连、VPN 状态轮询与线路选择逻辑；新增 `useHomeLifecycle`、`useHomePrecheck`、`useHomeNodeReporter`，分别负责页面生命周期、预检测与节点上报，`Home.tsx` 只保留 UI 绑定和状态汇总。
    - [x] TODO-Home-拆分-HeaderContext接入：`HomeHeader` 迁移至 `HomeContext`，复用页面提供的 `token` 状态。
      - 完成说明：移除 `HomeHeader` 内部对 `useStorage('token')` 的依赖，直接消费 `HomeContext`，统一首屏导航状态来源，减少重复订阅与渲染。
    - [ ] TODO-Home-拆分-ConnectBtn逻辑解耦：抽离连接按钮副作用与上下文依赖。
      - 方法：拆出 `useHomeConnectButton` hook，集中处理自动断开、线路挑选、VPN 启停等副作用，组件仅负责渲染与交互绑定。
      - 方向：结合 `HomeContext` 与未来的 selector，将 `connect`/`disconnect` 行为包装成稳定回调，避免整块按钮重复渲染。
      - 调研：当前组件直接依赖 `useGetStarHomeRouteLines`、`vpnStatus`、`vpnStart/Stop`、`autoPickNode` 等十余个工具函数，并在渲染期间创建多个 `useDebounceFn`/`useAsyncEffect`；`token`、`userInfo`、`navigation` 等依赖变化会导致整块按钮刷新，Loading 与埋点逻辑散落在各分支，拆分需优先梳理副作用顺序与状态保护。
      - 进展：已新增 `useHomeConnectButton` 并替换 `ConnectBtn` 中的大量副作用逻辑，组件现仅保留 UI 与文案，连接流程（自动断开、节点自动选择、权限请求）集中在 hook 内；后续将结合 selector 优化上下文订阅粒度。
    - [x] TODO-Home-RouteList-加载优化：线路列表首屏提速。
      - 方法：延迟批量测速与 `hostToIp` 解析，在导航交互完成后再触发；为 `FlatList` 设置虚拟化参数并复用渲染回调，减轻初次渲染压力。
      - 完成说明：`RouteList` 接入 `InteractionManager.runAfterInteractions` 控制测速启动，仅在动画结束后执行；`hostToIp` 解析改用 `p-limit(5)` 控制并发，`FlatList` 增加 `initialNumToRender`/`windowSize`/`removeClippedSubviews` 配置并缓存 `renderItem`，首屏进入不再因测速阻塞 UI，并新增 `useRouteSpeedCache` 统一读取缓存，进入列表即可显示既有测速数据。
    - [ ] TODO-Home-拆分-Context消费清理：替换 Home 子组件内直接使用 `useStorage` 的模式。
      - 方法：为 `ConnectBtn`、`NodeButton`、`KefuButton` 等拆分 `useHomeContext` 或 selector，必要时扩展 Provider 提供只读数据与写操作。
      - 方向：配合 memo 化展示组件，确保仅在相关上下文字段变化时更新，逐步回收遗留的全局存储订阅。
      - 现状：`ConnectBtn` 仍直接与上下文写操作耦合，尚未拆分选择器；页面其余子组件已逐步迁移至 `HomeContext`，后续需聚焦按钮与服务状态相关逻辑的精细化订阅。
      - 调研：`HomeContextProvider` 通过 `useMemo` 聚合上下文，但依赖列表包含 `refreshUserInfo` 等来源于 `useRequest` 的动态函数，仍会在数据刷新时触发整树更新；需要结合 selector 与 Provider 拆分，将写操作与展示数据分离。
      - 进展：`ConnectBtn` 已改用 `HomeContext` 提供的 `token`、`connected`、`currentNode`、`userInfo` 等状态，并复用统一的 `refreshUserInfo`、`updateCurrentNode`，消除多重 `useStorage` 订阅。
      - 进展：`NodeButton` 接入 `HomeContext` 统一获取 `currentNode`、`userInfo`、`channelName`，移除额外的 `useStorage` 与 `useRequest` 订阅，并通过 `React.memo` 固定渲染开销，为后续 selector 化改造提供基础。
    - [ ] TODO-Home-Context-Provider梳理：拆解上下文 value 与写入操作的稳定性。
      - 方法：以 `HomeContextProvider` 为中心拆出 `HomeStateProvider` 与 `HomeActionsProvider`，对写操作使用 `useConstant`/`useRef` 缓存 Promise 函数；对展示数据引入 selector，确保多 provider 串联时只在订阅字段变化时更新。
      - 方向：降低上下文 value 的引用频繁变动，为按钮、卡片等子组件的 `React.memo` 奠定基础，同时简化单元测试挂载逻辑。
      - 进展：`HomeContextProvider` 拆分 `HomeStateContext` 与 `HomeActionsContext`，新增 `useHomeState`/`useHomeActions` 钩子；`ConnectBtn`、`NodeButton`、`HomeHeader` 已改用 state-only 订阅，后续可结合 selector 进一步缩小刷新范围。
    - 基线更新：`[RenderBaseline] Home` 在最新拆分后保持 5/10/15 次渲染平均耗时约 26.58ms → 13.40ms → 9.02ms（单次 ~0.22ms），拆分未引入额外开销。
  - [ ] TODO-Home-UI：展示层拆分与 memo 化
    - 方法：以 UI 区块划分组件，例如 `HomeHeaderSection`、`HomeStatusSection`、`HomeActionPanel`，只接受必要的 props，并使用 `React.memo` 配置 `propsAreEqual`。
    - 方向：配合 `useMemo` 和 `useCallback` 将按钮事件、提示文案在父组件缓存，确保布局组件仅在数据变化时渲染。
  - [ ] TODO-Home-数据流：上下文与存储隔离
    - 方法：在逻辑 hook 内完成 `useStorage` 的读写及 JSON 序列化，提供 `HomeContext` 仅下发只读数据；对频繁更新的数据采用局部状态或外部 store。
    - 方向：通过 Context Provider 与自定义 selector 实现跨层传递，减少子组件对存储接口的直接访问。
    - 进展：`HomeContextProvider` 已聚合连接态、节点信息、渠道等字段，并补充 `updateCurrentNode`、`removeCurrentNode`、`userInfoLoading`、`refreshUserInfo`，现已在 `HomeHeader` 与 `ConnectBtn` 完成消费验证，为后续在按钮、节点卡片中落地 selector 做准备。
  - [x] TODO-Home-性能基线
    - 方法：使用 React DevTools profiler 与 `why-did-you-render`（开发态）记录拆分前后的渲染次数、耗时。
    - 方向：保留基线数据，作为后续验收指标，同时保障 hook 拆分后行为与旧版一致（需补充单测或集成测试）。
    - 完成说明：新增 `useRenderBaseline` Hook 并接入 Home 页面，开发态自动记录渲染耗时与次数（每 5 次输出），为人工采集基线提供工具。
    - 最新基线：`Home` 组件在 Android 调试环境中渲染 5/10/15 次时平均耗时分别约为 26.58ms → 13.40ms → 9.02ms（最近一次耗时 ~0.22ms），拆分持续保持稳定。
  - 进展：新增 `useHomeLifecycle` 管理登录提示、版本检查、ENTER_HOME 事件与返回键处理；页面核心副作用抽离到 `home/hooks` 目录，剩余逻辑聚焦于 UI 与数据展示。

### 2. 启动引导页 `Landing`（`src/app/routes/Landing.tsx`）
- **问题定位**：文件体积仍超 300 行（`wc -l` 统计 314），单一 `useEffect` 串行执行网络检测、域名探测、远程配置、登录、资源更新等流程；`networkNotice`、`networkOk` 状态与导航、副作用交织在一起，缺少显式失败恢复与重试机制。
- **拆分方案**：
  - [ ] TODO-Landing-状态机：阶段化副作用
    - 方法：定义 `LandingStage` 枚举与 `useLandingBootstrap` hook，内部使用 `useReducer` 或状态机库（如 `xstate`）描述阶段流转，严格区分副作用入口。
    - 方向：每个阶段通过 `async` 函数负责，成功时 dispatch 下一个阶段，失败时记录错误并允许重试；导航操作集中在完成阶段执行。
    - 调研：现有实现依赖单个 `useEffect` 顺序调用 `checkNetworkStatus`、`checkLastDomain`、`checkLocalDomains`、`callTsJsonRpcAPI('main')`、`tryLogin`、`updateTsDomains`、`updateTsGfwList` 等方法，过程中缺乏阶段标识；任一环节失败仅通过 `Tracking.info` 记录，后续流程仍继续执行。
  - [ ] TODO-Landing-UI：视图分层
    - 方法：拆分 `LandingStatusBanner`、`LandingFooter`、`LandingDebugInfo` 组件，props 仅包含当前阶段、提示文案、重试回调。
    - 方向：组件内部通过 `React.memo` 和 `useMemo` 提前缓存文案；在支持平台上使用 `Animated` 实现渐进提示，避免整页刷新。
    - 调研：目前 `LandingPage` JSX 直接内联 `Layout`、`StatusBar`、`Image` 与 `Pressable`，并使用大量内联样式；状态提示仅依赖 `networkNotice` 文本，拆分组件后可复用 `useMemo` 计算展示文案与按钮。
  - [ ] TODO-Landing-网络助手共用化
    - 方法：将域名探测、网络检测、配置同步重构为独立 helper（`useDomainResolver`、`useRemoteConfig`），支持注入渠道字段与重试策略。
    - 方向：让 Home、UserCenter 等页面也能复用，避免重复的 API 调用；同时抽样埋点耗时与失败率。
    - 调研：`checkLastDomain`、`checkLocalDomains`、`updateTsDomains`、`updateTsGfwList` 均散落于 `helpers`，但 Landing 仍需手动写入 `Storage` 与埋点；抽象后可为其他入口（如首次启动）复用同一流程。
  - [ ] TODO-Landing-失败恢复
    - 方法：对 `useRequest` 加入超时配置（如 8 秒），失败后返回错误信息；UI 提供“重新尝试”、“联系客服”按钮。
    - 方向：确保无网络或接口超时时页面仍可交互，提升用户体验。
    - 调研：当前仅在 `networkOk` 为 `false` 时停止流程，但 `useEffect` 仍可能继续执行后续副作用；异常石沉大海，缺少重试按钮与错误提示组件。

### 3. 应用容器 `App`（`src/app/App.tsx`）
- **问题定位**：组件长度约 440 行（`wc -l` 统计 441），初始化逻辑（BootSplash、语言设置、API 域名配置、权限校验）与导航容器混杂；模块顶层直接调用 `i18n.init` 并写死默认语言，难以在测试或多实例场景复用；多个 `useEffect` 内封装异步函数与埋点，缺少集中治理。
- **拆分方案**：
  - [ ] TODO-App-入口治理：初始化下沉
    - 方法：编写 `initI18n.ts`，封装 `i18n.use(...).init(...)`，并在 `main.tsx` 中 `await initI18n()` 后再 `AppRegistry.registerComponent`。
    - 方向：使用 Promise 缓存避免重复初始化，为后续单元测试提供独立入口。
    - 调研：当前模块加载即执行 `i18n.init`，且默认语言硬编码为 `cn`；一旦未来切换为按需加载语言包或多语言自定义，将缺乏统一的延迟初始化入口。
  - [ ] TODO-App-Provider：上下文集中管理
    - 方法：实现 `AppBootstrapProvider`，内部处理 `BootSplash.hide`、语言存储、域名配置；使用 `useEffect` 控制副作用，仅在初始化完成后渲染导航容器。
    - 方向：通过 Context 暴露 `isBootstrapped`、`currentLang` 等值，供下游页面订阅。
    - 调研：`App` 中当前 `useEffect` 同时承担 AppState 埋点、请求 `requestAppProtect`、读取语言并调用 `i18n.changeLanguage`；缺少初始化完成标识，导致导航容器在语言切换时整树刷新。
  - [ ] TODO-App-导航拆分：懒加载与按需注册
    - 方法：将大模块路由拆成独立 stack（`HomeStack`, `UserStack`, `PlayStack`）；对低频模块使用 `React.lazy` + `Suspense` 或 React Navigation 的 `getStateFromPath` 延迟加载。
    - 方向：减少首次 bundle 体积，避免不必要的组件挂载；结合 `@react-navigation/native` 的 `screenOptions` 缓存选项，避免 inline function。
    - 调研：`createNativeStackNavigator` 一次性注册 15+ 页面，其中 `AdvancedSetting`、`NetworkProtect`、`ShareIndex` 等为低频入口，可按需懒加载降低首屏开销。

### 4. Play/运营模块（`src/app/routes/play/*.tsx`）
- **问题定位**：`Apps.tsx`、`Peoples.tsx` 直接在 render 中 `map` 数据、打印日志，缺少数据缓存与子项拆分；对高频刷新会导致整块重渲染。
- **拆分方案**：
  - [x] TODO-Play-Hook：内容列表统一数据源
    - 方法：开发 `useCmsList`，封装请求、缓存、错误处理；通过 `useMemo` 对 `data.list` 做浅比较，输出稳定引用。
    - 方向：为不同 `modelCode` 提供统一接口，便于后续接入骨架屏与加载状态。
    - 完成说明：新增 `src/app/routes/play/hooks/useCmsList.ts` 并在 `Apps.tsx`、`Peoples.tsx` 中使用，统一封装 CMS 请求与列表 memo 逻辑，输出稳定数组引用。
  - [x] TODO-Play-Item：卡片组件化
    - 方法：新增 `AppGridItem`、`PeopleCard` 等组件，组件内部仅渲染 UI，事件由父级 `useCallback` 提供；必要时添加 `React.memo`。
    - 方向：结合 `Pressable` 的 `android_ripple`、`hitSlop` 提升交互响应；图像加载增加占位与错误处理。
    - 完成说明：已创建 `src/app/routes/play/index/AppGridItem.tsx` 与 `src/app/routes/play/index/PeopleCard.tsx`，并在对应页面引用，抽离卡片渲染与点击逻辑，通过 `React.memo` 减少重复渲染。
  - [x] TODO-Play-虚拟化：列表性能
    - 方法：替换 `ScrollView` 为 `FlatList`，设定 `numColumns`、`getItemLayout`、`removeClippedSubviews`；如数据量大，评估 `RecyclerListView`。
    - 方向：控制首屏渲染数量（`initialNumToRender`），对本地图片使用 `Image.prefetch` 预加载。
    - 完成说明：`Apps.tsx` 使用 `FlatList` 结合 `numColumns` 渲染网格，`Peoples.tsx` 使用横向 `FlatList`，减少整列表重渲染并预留性能优化空间。
  - [x] TODO-Play-日志治理
    - 方法：用 `if (__DEV__)` 包裹调试日志或统一通过 `Tracking.debug` 输出，生产环境默认关闭。
    - 方向：减少运行期控制台输出，避免影响性能与隐私。
    - 完成说明：`src/app/routes/play/index/Apps.tsx` 中的调试输出已调整为仅在 `__DEV__` 环境下生效，避免生产日志污染。

### 5. 用户中心与通用组件
- [x] TODO-UserCenter-列表重构
  - 方法：使用 `FlatList` 渲染用户中心入口，将数据源抽离至 `useUserCenterLinks`，对渠道、权限判断进行 memo 化。
  - 方向：保证 `renderItem` 与事件处理函数稳定，减少 `ScrollView` 带来的整列表重渲染。
  - 完成说明：`ListLinks.tsx` 已改造为 `FlatList`，并新增 `useUserCenterLinks` 聚合数据逻辑，使用 `ItemSeparatorComponent` 控制分隔符，保证渲染稳定。
- [x] TODO-UserCenter-组件治理
  - 方法：为 `UserHeader`、`GridMenus` 等组件补充 props 说明与 `React.memo`；对跨平台差异使用平台特定组件拆分。
  - 方向：统一 UI 风格，确保主按钮、列表项的视觉和交互一致。
  - 完成说明：`UserHeader.tsx`、`GridMenus.tsx` 完成样式抽离与 `React.memo` 封装，交互函数使用 `useDebounceFn` 与 `useMemo` 保持稳定，减少父级刷新带来的重复渲染。
- [x] TODO-Common-组件性能
  - 方法：在 `ListItem`、`PrimaryButton` 等通用组件外层增加 `React.memo`，暴露 `style`、`disabled`、`testID` 等扩展属性；必要时提供 `forwardRef`。
  - 方向：配套父组件使用 `useCallback`/`useMemo`，避免频繁创建匿名函数；整理组件目录与文档，降低重复实现。
  - 完成说明：`components/list/ListItem.tsx` 引入 `React.memo` 与可配置的 `style/testID/disabled`；`components/button/BaseButton.tsx`、`PrimaryButton.tsx` 支持自定义样式与测试标识，统一可访问性状态处理。
- [ ] TODO-Modal-Loading
  - 方法：评估 `Modal`、`LoadingSpin` 的使用频率，必要时接入 `react-native-portalize` 或自研 Portal；渲染层采用 `memo` 与 `useEffect` 控制动画。
  - 方向：确保遮罩层不会在每次父组件 rerender 时重新挂载，降低掉帧。

### 6. 状态管理与存储层
- [x] TODO-Storage-选择器
  - 方法：在 `useStorage` 基础上提供 `useStorageSelector`，对存储值做浅比较；或直接重写为 `useSyncExternalStore`，利用 `getSnapshot` + `subscribe`。
  - 方向：只在 selector 结果变化时触发组件更新，同时保持原有 API 兼容，减少迁移成本。
  - 完成说明：新增 `hooks/storage/shared.ts` 与 `hooks/useStorageSelector.ts`，在不侵入原 `useStorage` 的前提下提供 selector 订阅方案，并共享事件总线与工具函数，便于后续模块按需接入。
  - [ ] TODO-Storage-Selector-TypeFix：修正 `useStorageSelector` 泛型约束引发的 TS2322 报错，保证返回类型安全。
    - 方法：调整默认 `identitySelector` 的类型签名（可通过泛型继承或函数重载），并补充单测覆盖 selector 回调缺省与自定义场景。
    - 方向：确保旧版调用签名保持兼容，同时提供类型提示，避免后续页面接入时出现相同问题。
    - 调研：`identitySelector` 当前返回 `any`，`selectorRef` 的初始赋值在 TS 推断下会与 `TSelected` 产生冲突，引发 `TS2322`；需通过泛型化 `identitySelector<T>` 或定义函数重载解决，并校验 `useRef` 初始值类型。
- [ ] TODO-Storage-中后台状态
  - 方法：将高频数值（如测速、带宽）迁移到 `zustand` 或 `redux-toolkit`，使用 `subscribeWithSelector` 精准订阅。
  - 方向：构建 `store/home` 等模块化状态库，结合持久化插件决定哪些数据需要落盘。
- [ ] TODO-Storage-事件治理
  - 方法：规范 `DeviceEventEmitter` 的事件名，拆分为按命名空间分发（如 `storage:key:update`），并在 hook 中按 key 过滤。
  - 方向：避免无关 key 更新导致全量 refresh，明确事件生命周期与清理规则。
  - 调研：`useStorage` 目前统一监听 `STORAGE_EVENT_KEY` 并在事件回调内读取全量数据；写操作调用 `refresh(key)` 后会广播相同事件，即便仅更新布尔值也会触发所有订阅者读取一次存储，后续需要结合 selector 或 `DeviceEventEmitter.emit('storage:key:update', { key })` 细分。

### 7. 性能监控与工具链
- [ ] TODO-Performance-工具链：完善性能监控、调试与验证链路。
  - 方法：整理现有 `useRenderBaseline`、`Tracking.info` 等埋点，统一在开发态注入 `whyDidYouRender` 与 React DevTools profiler；在真机调试阶段接入 `@shopify/react-native-performance` 或自研桥接，暴露帧率、内存、启动耗时等指标。
  - 方向：构建“开发态调试 → 真机 profiling → 数据归档”的闭环，形成可复用的性能基线采集脚本，并结合 CI/手动脚本自动生成对比报告。
  - 调研：当前仅 `Home` 页面使用 `useRenderBaseline` 输出 Render 指标，`RouteList` 模块零散设置 `Component.whyDidYouRender = true`；缺乏统一入口与全局开关，也未将性能数据写入日志/埋点。需在 `App` 或调试入口集中注册 `whyDidYouRender`，并为关键 Hook/组件提供包装工具。
- [ ] TODO-Performance-验证闭环：建立性能数据回归流程。
  - 方法：建立“变更前基线 → 执行 TODO → 回归测试 → 性能复测 → 结果归档”流程，必要时引入 CI 自动化。
  - 方向：保证每项 TODO 完成后均有数据沉淀和复盘，持续优化。
  - 调研：目前性能验证依赖人工执行 `Home` 渲染日志，缺乏脚本化采样；Android/iOS 真机 profiling 数据未归档，建议结合 `scripts/` 目录新增 `performance-report.ts` 统一采集并输出 Markdown。

## 渲染性能优化策略
- **渲染去抖**：针对 `Home` 中的测速结果、连接状态更新，引入 `useDebounce`/`useThrottle` 限制高频 `setState`。
- **延迟加载与分包**：对 rarely-used 页面（`AdvancedSetting`, `NetworkProtect`, `ShareIndex` 等）采用动态 import，减小首屏包体。
- **UI 缓存**：运用 `useMemo` 缓存重复构建的 JSX（如导航按钮组），并在 Props 不变时直接复用。
- **动画与交互**：评估 `react-native-reanimated` 或 `Animated` 的使用，确保在主线程之外执行复杂动画；为 `Pressable` 事件添加 `hitSlop`、`android_ripple` 提升体验。
- **监控与 Profiling**：集成 `why-did-you-render`（仅开发环境）或 React DevTools profiler，量化拆分效果；如需在线监控，评估 `@shopify/react-native-performance`。

## 实施迭代建议
1. **第 1 周**：完成 `initI18n`、`AppBootstrapProvider`、`Home` 拆分设计，补充关键 hook 的单元测试；引入 profiling 工具验证基线渲染次数。
2. **第 2 周**：落地 `Home` 模块拆分，迁移测速/连接逻辑至独立 hook，确保功能回归；并优化 `useStorage` 订阅粒度。
3. **第 3 周**：改造 `Landing` 状态机、实现用户中心与 Play 模块列表的 `FlatList` 与 memo 化；移除 render 中的调试日志。
4. **第 4 周**：推广动态 import、懒加载策略，梳理剩余通用组件的 `React.memo` 与 props 规范；对关键页面做性能复测，形成对比报告。

## 验证与回归
- 建议建立自动化用例覆盖连接流程、登陆流程及主要页面跳转，避免重构回归。
- 使用 Android 与 iOS 真机 Profile，记录拆分前后的首屏时间、滚动掉帧率与内存占用作为验收指标。
- 通过 `Tracking.info` 或埋点系统增加渲染阶段耗时统计，用于持续跟踪性能波动。
- [ ] TODO-Performance-验证闭环
  - 说明：详见“性能监控与工具链”章节中的方法、方向与调研记录，需与自动化测试、Profiling 数据打通才能勾选完成。
