import {
  Animated,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import React, { useRef } from 'react';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const RainBornAnimatedTouchable: React.FC<TouchableOpacityProps> = props => {
  const dailyRightsScaleAnim = useRef(new Animated.Value(1)).current;

  const dailyRightsOnPressIn = (event: GestureResponderEvent) => {
    Animated.spring(dailyRightsScaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 35,
      bounciness: 0,
    }).start();
    props.onPressIn?.(event);
  };

  const dailyRightsOnPressOut = (event: GestureResponderEvent) => {
    Animated.spring(dailyRightsScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
    props.onPressOut?.(event);
  };

  const dailyRightsStyleWithPressAnim: StyleProp<ViewStyle> = [
    props.style as StyleProp<ViewStyle>,
    { transform: [{ scale: dailyRightsScaleAnim }] },
  ];

  return (
    <AnimatedTouchableOpacity
      {...props}
      style={dailyRightsStyleWithPressAnim}
      onPressIn={dailyRightsOnPressIn}
      onPressOut={dailyRightsOnPressOut}
    />
  );
};

export default RainBornAnimatedTouchable;
