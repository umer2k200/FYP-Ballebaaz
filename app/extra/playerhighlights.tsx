import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { storage } from '@/firebaseConfig';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Video, ResizeMode } from 'expo-av';
import CustomAlert from '@/components/CustomAlert';

export default function PlayerHighlightsScreen2() {
  const router = useRouter();
  const { match_id, player_id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'batting' | 'bowling'>('batting');
  const [battingHighlights, setBattingHighlights] = useState<string[]>([]);
  const [bowlingHighlights, setBowlingHighlights] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showCombineButton, setShowCombineButton] = useState(true);
  const [concatenatedOutputExists, setConcatenatedOutputExists] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false); // Add a refresh flag

  const SERVER_URL = "http://192.168.101.138:5001";


  // useEffect(() => {
  //   fetchHighlights();
  // }, [match_id, player_id, selectedTab]);

  useEffect(() => {
    setCurrentVideoIndex(0);
  }, [selectedTab]);

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const path = selectedTab === 'batting' ? `highlights/players/${player_id}/${match_id}/batting/` : `highlights/players/${player_id}/${match_id}/bowling/`;
      console.log('Fetching highlights from path:', path);
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      // Check if concatenated_output.mp4 exists
      // const concatenatedFileExists = result.items.some(item => item.name === 'concatenated_output.mp4');
      // setShowCombineButton(!concatenatedFileExists);

      const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
      if (selectedTab === 'batting') {
        setBattingHighlights(urls);
      } else {
        setBowlingHighlights(urls);
      }
    } catch (e) {
      console.error('Error fetching highlights:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  const handleNextVideo = () => {
    const highlights = selectedTab === 'batting' ? battingHighlights : bowlingHighlights;
    if (highlights.length === 1) {
      setAlertMessage("Only one highlight available.");
      setAlertVisible(true);
      return;
    }
    if (currentVideoIndex === highlights.length - 1) {
      setAlertMessage("This is the last highlight.");
      setAlertVisible(true);
      return
    }
    setCurrentVideoIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviosVideo = () => {
    const highlights = selectedTab === 'batting' ? battingHighlights : bowlingHighlights;
    if (highlights.length === 1) {
      setAlertMessage("Only one highlight available.");
      setAlertVisible(true);
      return;
    }
    if (currentVideoIndex === 0) {
      setAlertMessage("This is the first highlight.");
      setAlertVisible(true);
      return;
    }
    setCurrentVideoIndex((prevIndex) => prevIndex - 1);
  };

  // Function to check if concatenated_output.mp4 exists
  const checkConcatenatedOutputExists = async () => {
    try {
      const path = selectedTab === 'batting' ? `highlights/players/${player_id}/${match_id}/batting/` : `highlights/players/${player_id}/${match_id}/bowling/`;
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      const exists = result.items.some(item => item.name === 'concatenated_output.mp4');
      setConcatenatedOutputExists(exists);
      return exists;
    } catch (e) {
      console.error('Error checking for concatenated_output.mp4:', e);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const exists = await checkConcatenatedOutputExists();
      if (!exists) {
        await handleCombine();
        setRefreshFlag((prev) => !prev); // Toggle the flag to trigger useEffect
      } else {
        fetchHighlights(); // If handleCombine does not run, fetch highlights instantly
      }
    };
    init();
  }, []);

  // Add refreshFlag as a dependency to fetchHighlights
  useEffect(() => {
    if (refreshFlag || concatenatedOutputExists) {
      fetchHighlights();
    }
  }, [refreshFlag, concatenatedOutputExists]);

  // // Automatically run handleCombine when the screen loads, but only if concatenated_output.mp4 does not exist
  // useEffect(() => {
  //   const init = async () => {
  //     const exists = await checkConcatenatedOutputExists();
  //     if (!exists) {
  //      await handleCombine();
  //     }

  //     fetchHighlights(); 
  //   };
  //   init();
  // }, []);

  const handleCombine = async () => {
    try {
      setLoading2(true);
      const response = await fetch(`${SERVER_URL}/concatenate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: player_id,
          match_id: match_id,
          type: selectedTab, // 'batting' or 'bowling'
          entity_type: "player",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlertMessage("Videos loaded successfully!");
      } else {
        setAlertMessage(result.error || "Failed to concatenate videos.");
      }
    } catch (error) {
      console.error('Error concatenating videos:', error);
      setAlertMessage("An error occurred while concatenating videos.");
    } finally {
      setLoading2(false);
      setAlertVisible(true);
    }
  };


  const renderVideoPlayer = () => {
    const highlights = selectedTab === 'batting' ? battingHighlights : bowlingHighlights;
    if (loading) {
      return <ActivityIndicator size="large" color="#005B41" />;
    }
    if (highlights.length === 0) {
      return <Text style={styles.videoTitle}>No highlights available.</Text>;
    }
    return (
      <View style={styles.videoContainer}>
        {loading2 && (
          <View style={styles.loaderOverlay}>
            <View style={styles.loaderBackground} />
            <View style={styles.loaderContent}>
              <ActivityIndicator size="large" color="#005B41" />
              <Text style={styles.loaderText}>Fetching Videos, please wait...</Text>
            </View>
          </View>
        )}
        <View style={styles.videoIndicator}>
          <Text style={styles.videoIndicatorText}>
            {currentVideoIndex + 1}/{highlights.length}
          </Text>
        </View>
        <Video
          source={{ uri: highlights[currentVideoIndex] }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
          isMuted
        />
        <View style={styles.navigationButtons}>

          {/* <TouchableOpacity onPress={handlePreviosVideo} style={styles.navButton}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity> */}
          {/* 
          {showCombineButton && (
            <TouchableOpacity onPress={handleCombine} style={styles.navButton}>
              <Text style={styles.navButtonText}>Combine</Text>
            </TouchableOpacity>
          )} */}
{/* 
          <TouchableOpacity onPress={downloadVideo} style={styles.navButton}>
            <Text style={styles.navButtonText}>Download</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity onPress={handleNextVideo} style={styles.navButton}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity> */}

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Highlights</Text>
      </View>



      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabButton, selectedTab === 'batting' && styles.activeTab]} onPress={() => setSelectedTab('batting')}>
          <Text style={styles.tabText}>Batting</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, selectedTab === 'bowling' && styles.activeTab]} onPress={() => setSelectedTab('bowling')}>
          <Text style={styles.tabText}>Bowling</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderContent}>
                        <ActivityIndicator size="large" color="#005B41" />
                        <Text style={styles.loaderText}>Fetching Videos, please wait...</Text>
                      </View>
          {/* <ActivityIndicator size='large' color='#005B41' /> */}
        </View>
      ) : (<>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderVideoPlayer()}
        </ScrollView>
      </>)}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Light grayish background for a professional look
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 20,
    backgroundColor: '#005B41', // Header background color
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'white',
  },
  videoContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Adds shadow for Android
    width: '90%', // Ensures video container covers 100% of the screen width
    height: '210%',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  videoTitle2: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginBottom: 10,
    color: 'white',
  },
  videoIndicator: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
  videoIndicatorText: {
    color: '#fff',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#005B41',
  },
  tabText: {
    fontSize: 18,
    color: '#fff',
  },
  video: {
    width: '100%',
    height: '100%',
    aspectRatio: 16 / 9, // Set a 16:9 aspect ratio for responsive video scaling
    borderRadius: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e', // Dark navbar background
    paddingVertical: 7,
    borderTopLeftRadius: 50, // Extra rounded top corners for a sleek look
    borderTopRightRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  navIcon: {
    width: 25, // Slightly larger icons
    height: 25,
    tintColor: '#fff', // Light icon color
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    width: '95%',
  },
  navButton: {
    backgroundColor: '#005B41',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
  },
  highlight: {
    position: 'absolute',
    bottom: 30, // Slightly raised pop-up effect
    backgroundColor: '#005B41', // Teal highlight
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676', // Bright shadow effect for the highlight
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#1e1e1e',  // Darker border color for contrast
    borderWidth: 5,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it appears on top of everything
  },
  loaderBackground: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(1, 1, 1, 1)', // Semi-transparent black background
  },
  loaderContent: {
    alignItems: 'center', // Center the content horizontally
  },
  loaderText: {
    marginTop: 16, // Add some space between the ActivityIndicator and the text
    fontSize: 16,
    color: '#FFFFFF', // White text color
  },
});