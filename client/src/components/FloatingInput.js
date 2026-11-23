
import React from 'react';
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
} from 'react-native';

export default function FloatingInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  const [focused, setFocused] = React.useState(false);

  const animatedValue = React.useRef(
    new Animated.Value(value ? 1 : 0)
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: focused || value.length > 0 ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error
      ? '#d32f2f'
      : focused
        ? '#0a7ea4'
        : '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: error
            ? '#d32f2f'
            : focused
              ? '#0a7ea4'
              : '#ccc',
        },
      ]}
    >
      <Animated.Text
        pointerEvents="none"
        style={labelStyle}
      >
        {label}
      </Animated.Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  input: {
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    fontSize: 16,
    color: '#000',
  },
});
