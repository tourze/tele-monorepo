import React, { memo } from 'react';
import {StyleSheet, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import isObject from 'lodash/isObject';

const STALE_THRESHOLD_MS = 30 * 1000;

const styles = StyleSheet.create({
  gray: {
    color: '#52525b',
  },
  blue: {
    color: '#73c0ff',
  },
  muted: {
    color: '#94a3b8',
  },
});

function SpeedDisplay({
  speed,
}: {
  speed:
    | { speed?: number; updatedAt?: number; cached?: boolean }
    | number
    | null
    | undefined
    | boolean;
}) {
  const {t} = useTranslation();

  let updatedAt: number | undefined;
  let cached = false;
  if (isObject(speed) && speed.speed !== undefined) {
    updatedAt = typeof speed.updatedAt === 'number' ? speed.updatedAt : undefined;
    cached = Boolean(speed.cached);
    speed = speed.speed;
  }

  // console.log('render speed变化', speed, item);
  if (speed === false) {
    return (
      <Text style={styles.gray}>{t('Component_ServerNode_ConnectFailed')}</Text>
    );
  }
  if (speed === null || speed === undefined) {
    return (
      <Text style={styles.gray}>{t('Component_ServerNode_Checking')}</Text>
    );
  }

  if (
    !cached &&
    typeof updatedAt === 'number' &&
    Number.isFinite(updatedAt) &&
    Date.now() - updatedAt > STALE_THRESHOLD_MS
  ) {
    // 使用陈旧值也展示，避免回退占位符
    return <Text style={styles.muted}>{speed}ms</Text>;
  }

  if (typeof speed !== 'number') {
    return (
      <Text style={styles.gray}>{t('Component_ServerNode_Checking')}</Text>
    );
  }
  if (cached) {
    return <Text style={styles.muted}>{speed}ms</Text>;
  }
  return <Text style={styles.blue}>{speed}ms</Text>;
}

export default memo(SpeedDisplay);
