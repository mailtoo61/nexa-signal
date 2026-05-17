import React, { type PropsWithChildren } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { designTokens } from '../../shared/design/tokens';

export function MobileShell({
  children,
}: PropsWithChildren): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width >= 900;
  const frameWidth = isDesktopWeb ? Math.min(460, width - 48) : width;
  const frameHeight = isDesktopWeb ? Math.min(920, height - 40) : height;

  return (
    <SafeAreaView style={styles.root}>
      <View
        style={[
          styles.frame,
          isDesktopWeb && styles.frameDesktop,
          { width: frameWidth, height: frameHeight },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: designTokens.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#050B19',
  },
  frameDesktop: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#2B447033',
    shadowColor: '#57D8FF',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
});
