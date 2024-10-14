import React from 'react';
import { View, Image, StyleSheet } from 'react-native';


const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      {/* Add any other content for the splash screen here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Set the background color to white
  },
  logo: {
    width: 200, // Adjust the width and height as needed
    height: 200,
  },
});

export default SplashScreen;