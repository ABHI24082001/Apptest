import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const EmptyListComponent = ({
  iconName = 'file-document-outline',
  iconSize = 56,
  iconColor = '#9CA3AF',
  text = 'No records found',
  subText = null,
  cardStyle = {},
  contentStyle = {},
  textStyle = {},
  subTextStyle = {},
  showCard = true,
}) => {
  const Content = () => (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 48,
          paddingHorizontal: 24,
          minHeight: 200,
        },
        contentStyle
      ]}
    >
      {/* Icon with subtle background circle */}
      <View style={{
        width: iconSize + 24,
        height: iconSize + 24,
        borderRadius: (iconSize + 24) / 2,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <MaterialIcon
          name={iconName}
          size={iconSize}
          color={iconColor}
        />
      </View>

      {/* Main text */}
      <Text 
        style={[
          {
            fontSize: 18,
            fontWeight: '600',
            color: '#374151',
            textAlign: 'center',
            marginBottom: subText ? 8 : 0,
            letterSpacing: 0.3,
          },
          textStyle
        ]}
      >
        {text}
      </Text>

      {/* Sub text */}
      {subText && (
        <Text 
          style={[
            {
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 20,
              maxWidth: 280,
            },
            subTextStyle
          ]}
        >
          {subText}
        </Text>
      )}
    </View>
  );

  if (!showCard) {
    return <Content />;
  }

  return (
    <View 
      style={[
        {
          margin: 16,
          marginVertical: 24,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F1F5F9',
        },
        cardStyle
      ]}
    >
      <Content />
    </View>
  );
};

export default EmptyListComponent;
