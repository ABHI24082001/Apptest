import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

const OnLeaveUsers = ({leaveUsers = []}) => {
  const navigation = useNavigation();
  const hasData = leaveUsers && leaveUsers.length > 0;

  const renderUserItem = ({item}) => {
    const hasImage = !!item.image;

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
        onPress={() => {
          /* Handle user selection if needed */
        }}
      >
        {hasImage ? (
          <Image source={item.image} style={styles.userImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="account-circle" size={44} color="#7986cb" />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || 'Unnamed'}
          </Text>
          <Text style={styles.role} numberOfLines={2}>
            {item.role || 'No Role Assigned'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.containerCard}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          {/* <Icon
            name="calendar-clock"
            size={22}
            color="#1976D2"
            style={styles.titleIcon}
          /> */}
          <Text style={styles.sectionTitle}>Who is on Leave</Text>
        </View>

        {hasData && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('WhoLeave')}
          >
            <View style={styles.viewAllRow}>
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={20} color="#1976D2" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {hasData ? (
        <FlatList
          data={leaveUsers}
          renderItem={renderUserItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          snapToInterval={132} // Card width + margin
          decelerationRate="fast"
        />
      ) : (
        <View style={styles.noDataContainer}>
          <View style={styles.noDataCard}>
            <Icon name="account-off-outline" size={42} color="#9ca3af" />
            <Text style={styles.noDataText}>No one is on leave today</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    borderRadius: 16,
    marginHorizontal: 7,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0f0fc',
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#1976D2',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleIcon: {
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.3,
  },

  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  listContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
  },

  userCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#dde8f3',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5eeff',
  },

  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f0fe',
    borderWidth: 1,
    borderColor: '#d1e2fc',
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    width: '100%',
  },

  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },

  role: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 3,
  },

  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  noDataCard: {
    width: 200,
    height: 130,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
  },

  noDataText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default OnLeaveUsers;
