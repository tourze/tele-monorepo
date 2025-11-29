import React, { createContext, useContext, useMemo } from 'react';

type HomeState = {
  connected: boolean;
  token: string | null;
  trialLogin: boolean;
  currentNode: any;
  userInfo: any;
  userInfoLoading: boolean;
  channelName?: string | null;
  homeReconnect: boolean;
  currentAppState: string;
};

type HomeActions = {
  setConnected: (value: boolean) => Promise<void>;
  updateHomeReconnect: (value: boolean) => Promise<void>;
  updateCurrentNode: (value: any) => Promise<void>;
  removeCurrentNode: () => Promise<void>;
  refreshUserInfo: () => Promise<any>;
};

type HomeContextValue = HomeState & HomeActions;

const HomeStateContext = createContext<HomeState | undefined>(undefined);
const HomeActionsContext = createContext<HomeActions | undefined>(undefined);

type Props = HomeContextValue & {
  children?: React.ReactNode;
};

export const HomeContextProvider = ({
  children,
  ...value
}: Props) => {
  const stateValue = useMemo<HomeState>(() => ({
    connected: value.connected,
    token: value.token,
    trialLogin: value.trialLogin,
    currentNode: value.currentNode,
    userInfo: value.userInfo,
    userInfoLoading: value.userInfoLoading,
    channelName: value.channelName,
    homeReconnect: value.homeReconnect,
    currentAppState: value.currentAppState,
  }), [
    value.connected,
    value.token,
    value.trialLogin,
    value.currentNode,
    value.userInfo,
    value.userInfoLoading,
    value.channelName,
    value.homeReconnect,
    value.currentAppState,
  ]);

  const actionsValue = useMemo<HomeActions>(() => ({
    setConnected: value.setConnected,
    updateHomeReconnect: value.updateHomeReconnect,
    updateCurrentNode: value.updateCurrentNode,
    removeCurrentNode: value.removeCurrentNode,
    refreshUserInfo: value.refreshUserInfo,
  }), [
    value.setConnected,
    value.updateHomeReconnect,
    value.updateCurrentNode,
    value.removeCurrentNode,
    value.refreshUserInfo,
  ]);

  return (
    <HomeStateContext.Provider value={stateValue}>
      <HomeActionsContext.Provider value={actionsValue}>
        {children}
      </HomeActionsContext.Provider>
    </HomeStateContext.Provider>
  );
};

export const useHomeState = () => {
  const context = useContext(HomeStateContext);
  if (!context) {
    throw new Error('useHomeState must be used within HomeContextProvider');
  }
  return context;
};

export const useHomeActions = () => {
  const context = useContext(HomeActionsContext);
  if (!context) {
    throw new Error('useHomeActions must be used within HomeContextProvider');
  }
  return context;
};

export const useHomeContext = () => {
  const state = useHomeState();
  const actions = useHomeActions();
  return useMemo(() => ({
    ...state,
    ...actions,
  }), [state, actions]);
};
