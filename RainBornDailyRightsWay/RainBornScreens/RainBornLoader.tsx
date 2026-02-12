import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RainBornRoutesList } from '../RainBornNavigation/RainBornRoutes';

type NavigationProp = StackNavigationProp<RainBornRoutesList, 'RainBornLoader'>;

const LOADER_DURATION_MS = 5000;

const RainBornLoader: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('RainBornOnboard');
    }, LOADER_DURATION_MS);
    return () => clearTimeout(t);
  }, [navigation]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('../RainBornAssets/images/bgs/onboard.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.centered}>
        <Animated.View
          style={[styles.horseshoeWrap, { transform: [{ rotate: spin }] }]}
        >
          <Image
            source={require('../RainBornAssets/images/ldr.png')}
            style={styles.horseshoe}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horseshoeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horseshoe: {
    width: 180,
    height: 280,
  },
});

export default RainBornLoader;
