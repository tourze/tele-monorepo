import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: 'row',
    padding: 15,
  },
  text: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: '#bbb'
  },
  rightBlock: {
    flex: 2,
  },
});

function TsListItem({ title, description, style = null, accessoryRight = null }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {React.isValidElement(accessoryRight) && (
        <View style={styles.rightBlock}>
          {accessoryRight}
        </View>
      )}
    </View>
  );
}

export default TsListItem;
