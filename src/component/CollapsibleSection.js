
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const CollapsibleSection = ({ title, icon, children }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity onPress={toggleExpand} style={styles.sectionHeader}>
        <Icon name={icon} size={20} color="#444" style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#666" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {expanded && (
        <Card style={styles.card}>{children}</Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  card: {
    padding: 12,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});

export default CollapsibleSection;
