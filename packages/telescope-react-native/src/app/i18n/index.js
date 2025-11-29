import React from 'react';
import NodeFlag from '../../components/NodeFlag';

export const languages = [
  {
    title: '简体中文',
    flag: (
      <NodeFlag
        flag="cn"
        width={70}
        height={35}
        backgroundColor="transparent"
      />
    ),
    code: 'cn',
  },
  // {
  //   title: '繁體中文',
  //   flag: <NodeFlag flag='hk' width={70} height={35} backgroundColor='transparent'/>,
  //   code: 'tc',
  // },
  // {
  //   title: 'Русский язык',
  //   flag: <NodeFlag flag='ru' width={70} height={35} backgroundColor='transparent'/>,
  //   code: 'ru',
  // },
  // {
  //   title: 'English',
  //   flag: <NodeFlag flag='us' width={70} height={35} backgroundColor='transparent'/>,
  //   code: 'en',
  // },
];

export const resources = {
  cn: {
    translation: require('./cn').default,
  },
  tc: {
    translation: require('./tc').default,
  },
  ru: {
    translation: require('./ru').default,
  },
  en: {
    translation: require('./en').default,
  },
};
