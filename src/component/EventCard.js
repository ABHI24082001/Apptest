// components/EventCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EVENT_TYPES = {
  holiday: { name: 'Holiday', color: '#FF5252', bg: '#FFEBEE', icon: 'celebration' },
  shift: { name: 'Shift', color: '#4CAF50', bg: '#E8F5E9', icon: 'work' },
  'week-off': { name: 'Week Off', color: '#2196F3', bg: '#E3F2FD', icon: 'weekend' },
  leave: { name: 'Leave', color: '#FF9800', bg: '#FFF8E1', icon: 'beach-access' },
  meeting: { name: 'Meeting', color: '#9C27B0', bg: '#F3E5F5', icon: 'meeting-room' },
  empty: { name: '', color: '#999', bg: '#f5f5f5', icon: 'event-busy' },
};

const EventCard = ({ item }) => {
  const typeConfig = EVENT_TYPES[item.type] || EVENT_TYPES.shift;

  if (item.type === 'empty') {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <Text style={styles.emptyText}>{item.name}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: typeConfig.bg }]}>
      <View style={styles.header}>
        <MaterialIcons name={typeConfig.icon} size={20} color={typeConfig.color} />
        <Text style={[styles.typeText, { color: typeConfig.color }]}>
          {typeConfig.name}
        </Text>
      </View>
      <Text style={styles.title}>{item.name}</Text>
      {item.time && (
        <View style={styles.timeRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      )}
      {item.description && <Text style={styles.desc}>{item.description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 1,
  },
  emptyCard: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  desc: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default EventCard;
