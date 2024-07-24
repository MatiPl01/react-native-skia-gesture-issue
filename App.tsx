import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

import Touchable, {useGestureHandler} from 'react-native-skia-gesture';

export default function App() {
  const cx = useSharedValue(100);
  const cy = useSharedValue(100);

  const context = useSharedValue({x: 0, y: 0});

  const circleGesture = useGestureHandler({
    onStart: () => {
      'worklet'; // Remember the 'worklet' keyword
      context.value = {
        x: cx.value,
        y: cy.value,
      };
    },
    onActive: ({translationX, translationY}) => {
      'worklet';
      cx.value = context.value.x + translationX;
      cy.value = context.value.y + translationY;
    },
  });

  return (
    <GestureHandlerRootView style={styles.fill}>
      <Touchable.Canvas style={styles.fill}>
        <Touchable.Circle
          cx={cx}
          cy={cy}
          r={50}
          color="red"
          {...circleGesture}
        />
      </Touchable.Canvas>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
