import React, {useRef, useEffect, useCallback} from 'react';
import {Animated, View, Easing} from 'react-native';
import AppSafeArea from './AppSafeArea';
import CustomBottomTab from './CustomBottomTab';

const ScrollAwareContainer = ({
  children,
  navigation,
  currentRoute,
  showBottomTab = true,
  onScroll,
  bottomTabStyle,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabAnimatedValue = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);
  const scrollVelocity = useRef(0);

  // Smoother animation configuration
  const animationConfig = {
    duration: 300,
    useNativeDriver: true,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Smooth easing curve
  };

  // Debounced scroll end detection
  const handleScrollEnd = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      // Show tab if scroll velocity is low and near top
      if (Math.abs(scrollVelocity.current) < 0.5 && lastScrollY.current < 100) {
        Animated.timing(tabAnimatedValue, {
          toValue: 0,
          ...animationConfig,
        }).start();
      }
    }, 150);
  }, [tabAnimatedValue]);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const deltaY = currentScrollY - lastScrollY.current;
        
        // Calculate scroll velocity for smoother detection
        scrollVelocity.current = deltaY;
        isScrolling.current = true;
        
        // More responsive thresholds
        const hideThreshold = 30;
        const showThreshold = 20;
        const minScrollDistance = 5;
        
        // Only animate if scroll distance is meaningful
        if (Math.abs(deltaY) > minScrollDistance) {
          if (deltaY > 0 && currentScrollY > hideThreshold) {
            // Scrolling down - hide tab with smooth animation
            Animated.timing(tabAnimatedValue, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }).start();
          } else if (deltaY < 0 || currentScrollY < showThreshold) {
            // Scrolling up or near top - show tab with smooth animation
            Animated.timing(tabAnimatedValue, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
              easing: Easing.out(Easing.back(1.2)),
            }).start();
          }
        }
        
        lastScrollY.current = currentScrollY;
        handleScrollEnd();
        
        if (onScroll) {
          onScroll(event);
        }
      },
    }
  );

  // Reset tab visibility when route changes with smooth animation
  useEffect(() => {
    Animated.timing(tabAnimatedValue, {
      toValue: 0,
      ...animationConfig,
    }).start();
  }, [currentRoute]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // Helper function to add scroll handling to ScrollView children
  const enhanceScrollableChildren = (child) => {
    if (!child || !React.isValidElement(child)) {
      return child;
    }

    // Check if the child is a ScrollView or similar scrollable component
    if (child.type?.displayName === 'ScrollView' || 
        child.props?.contentContainerStyle !== undefined ||
        child.type?.name === 'ScrollView') {
      return React.cloneElement(child, {
        onScroll: handleScroll,
        scrollEventThrottle: 8, // Reduced for smoother detection
        contentContainerStyle: [
          child.props?.contentContainerStyle || {},
          {paddingBottom: showBottomTab ? 80 : 0},
        ],
        // Enhanced scroll performance
        removeClippedSubviews: true,
        showsVerticalScrollIndicator: child.props?.showsVerticalScrollIndicator ?? true,
        bounces: child.props?.bounces ?? true,
        decelerationRate: child.props?.decelerationRate ?? 'normal',
      });
    }

    // For other components, recursively check their children
    if (child.props?.children) {
      return React.cloneElement(child, {
        ...child.props,
        children: React.Children.map(child.props.children, enhanceScrollableChildren),
      });
    }

    return child;
  };

  return (
    <AppSafeArea>
      <View style={{flex: 1}}>
        {React.Children.map(children, enhanceScrollableChildren)}
      </View>
      
      {showBottomTab && (
        <CustomBottomTab
          navigation={navigation}
          currentRoute={currentRoute}
          animatedValue={tabAnimatedValue}
          style={bottomTabStyle}
        />
      )}
    </AppSafeArea>
  );
};

export default ScrollAwareContainer;
