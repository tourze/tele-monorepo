import { noop } from 'lodash';
import { useCallback } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useSafeState } from 'ahooks';

const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fcfcfc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ccc',
    borderRadius: 5,
  },
  focus: {
    backgroundColor: '#fff',
    borderColor: '#2d5bff',
  },
});

function TsInput({
    placeholder = '',
    value = '',
    onChangeText = noop,
  }) {
  const [focus, setFocus] = useSafeState(false);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, [setFocus]);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, [setFocus]);

  return (
    <TextInput
      style={[
        styles.wrapper,
        focus && styles.focus,
      ]}
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

export default TsInput;
