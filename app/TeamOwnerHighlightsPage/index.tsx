import React from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av'; // Using 'expo-av' for video playback
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';

export default function PlayerHighlightsScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Match Highlights</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* First Video Container */}
        <View style={styles.videoContainer}>
          <Text style={styles.videoTitle}>Highlight 1</Text>
          {/* Uncomment the Video component when you have the video */}
          {/* <Video
            source={require('@/assets/images/video1.mp4')} // Path to the first video
            rate={1.0}
            volume={1.0}
            isMuted={false}
            shouldPlay={true}
            useNativeControls
            style={styles.video}
          /> */}
        </View>

        {/* Second Video Container */}
        <View style={styles.videoContainer}>
          <Text style={styles.videoTitle}>Highlight 2</Text>
          {/* Uncomment the Video component when you have the video */}
          {/* <Video
            source={require('@/assets/images/video2.mp4')} // Path to the second video
            rate={1.0}
            volume={1.0}
            isMuted={false}
            shouldPlay={false}
            useNativeControls
            style={styles.video}
          /> */}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Light grayish background for a professional look
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginLeft: 15,
    tintColor: '#fff',
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 30,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Add extra padding to avoid content being hidden behind the navbar
  },
  videoContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Adds shadow for Android
    width: '100%', // Ensures video container covers 100% of the screen width
    height: 250, // Set a fixed height for consistency (adjust as needed)
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9, // Set a 16:9 aspect ratio for responsive video scaling
    borderRadius: 10,
  },
});
