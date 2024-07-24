import {Dimensions, StyleSheet, View} from 'react-native';
import React from 'react';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Touchable, {useGestureHandler} from 'react-native-skia-gesture';
import {Group, Path, Skia, SkPath} from '@shopify/react-native-skia';

const svgPaths = [
  'M20 400 L40 380 L60 400 L60 440 L40 460 L20 440 Z',
  'M60 400 L80 390 L100 400 L100 440 L80 450 L60 440 Z',
  'M100 400 L120 380 L140 400 L140 440 L120 460 L100 440 Z',
  'M140 400 L160 370 L180 400 L180 440 L160 470 L140 440 Z',
  'M180 400 L200 360 L220 400 L220 440 L200 480 L180 440 Z',
  'M220 400 L240 350 L260 400 L260 440 L240 490 L220 440 Z',
  'M260 400 L280 340 L300 400 L300 440 L280 500 L260 440 Z',
  'M300 400 L320 330 L340 400 L340 440 L320 510 L300 440 Z',
  'M340 400 L360 320 L380 400 L380 440 L360 520 L340 440 Z',
  'M160 400 L180 380 L200 400 L200 420 L180 440 L160 420 Z',
  'M220 400 L240 380 L260 400 L260 420 L240 440 L220 420 Z',
  'M280 400 L300 380 L320 400 L320 420 L300 440 L280 420 Z',
  'M20 460 L40 440 L60 460 L60 500 L40 520 L20 500 Z',
  'M60 460 L80 450 L100 460 L100 500 L80 510 L60 500 Z',
  'M100 460 L120 440 L140 460 L140 500 L120 520 L100 500 Z',
  'M140 460 L160 430 L180 460 L180 500 L160 530 L140 500 Z',
  'M180 460 L200 420 L220 460 L220 500 L200 540 L180 500 Z',
  'M220 460 L240 410 L260 460 L260 500 L240 550 L220 500 Z',
  'M260 460 L280 400 L300 460 L300 500 L280 560 L260 500 Z',
  'M300 460 L320 390 L340 460 L340 500 L320 570 L300 500 Z',
  'M340 460 L360 380 L380 460 L380 500 L360 580 L340 500 Z',
]
  .map(Skia.Path.MakeFromSVGString)
  .filter(Boolean) as SkPath[];

const {width, height} = Dimensions.get('screen');

const PinchPan = () => {
  function clamp(val: number, min: number, max: number) {
    'worklet';
    return Math.min(Math.max(val, min), max);
  }

  // ================= PAN =======================
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);
  const tapActive = useSharedValue(false);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      tapActive.value = false;
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate(event => {
      tapActive.value = false;
      const maxTranslateX = width / 2;
      const maxTranslateY = height / 2;

      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        -maxTranslateX,
        maxTranslateX,
      );
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        -maxTranslateY,
        maxTranslateY,
      );
    });
  // ============================================

  // ================== pinch ===================
  const scale = useSharedValue(1);
  const startScale = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      tapActive.value = false;
      startScale.value = scale.value;
    })
    .onUpdate(event => {
      tapActive.value = false;
      scale.value = clamp(startScale.value * event.scale, 1, 20);
    });
  // ============================================

  // ================== tap ===================
  const tap = useGestureHandler({
    onStart: () => {
      'worklet';
      tapActive.value = true;
    },
    onEnd: touchInfo => {
      'worklet';
      if (tapActive.value) {
        console.log('tap end', touchInfo);
      }
    },
  });
  // ============================================

  const composed = Gesture.Simultaneous(pan, pinch);

  const animatedTransformPinch = useDerivedValue(() => [
    {scale: scale.value, translateX: width / 2, translateY: height / 2.7},
  ]);
  const animatedTransformPan = useDerivedValue(() => [
    {translateX: translationX.value},
    {translateY: translationY.value},
    {scale: 0.5},
  ]);

  return (
    <View style={styles.fill}>
      <GestureHandlerRootView>
        <GestureDetector gesture={composed}>
          <Touchable.Canvas style={styles.fill}>
            {/* pinch */}
            <Group transform={animatedTransformPinch}>
              {/* pan */}
              <Group transform={animatedTransformPan}>
                {svgPaths.map(path => (
                  <Group
                    transform={[
                      {translateX: -width / 2},
                      {translateY: -height / 2},
                    ]}
                    key={Math.random()}>
                    <Touchable.Path path={path} color="grey" {...tap} />
                    <Path
                      path={path}
                      style="stroke"
                      strokeWidth={4}
                      color="black"
                    />
                  </Group>
                ))}
              </Group>
            </Group>
          </Touchable.Canvas>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default PinchPan;

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
