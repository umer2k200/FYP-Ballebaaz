


import React, { useState , useEffect} from 'react';
import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, Linking,Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_KEY = 'AIzaSyD8_5HhOGBOYBKkWMHVm_mSJgUFozq03KU';
interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export default function DrillsScreen() {
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    phone_no: 0,
    role: "",
    password: "",
    player_id: "",
    strike_rate: 0,
    fitness_status: "",
    matches_played: 0,
    best_bowling: "",
    economy: 0,
    highlights: [],
    team_id: "",
    preferred_hand: "",
    bowling_hand: "",
    average: 0,
    training_sessions: [],
    assigned_drills: "",
    wickets_taken: 0,
    weight: 0,
    height: 0,
    age: 0,
    email: "",
    fiveWickets: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data in drills:", parsedUserData); // Debugging
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [popupVisible, setPopupVisible] = useState<boolean>(true);
  const router = useRouter();
  const navigation = useNavigation();

   
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Toggle Modal Visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const searchVideos = async () => {
    try {
      // Define default keywords related to cricket drills
      const drillKeywords = "drills coaching tutorials";
      // Combine the user input query with drill keywords
      const cricketDrillQuery = `${query} cricket drills ${drillKeywords}`; 
  
      // Fetch YouTube data with the combined query
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${cricketDrillQuery}&type=video&maxResults=10&key=${API_KEY}`
      );
      setVideos(response.data.items);
    } catch (error) {
      console.error(error);
    }
  };

  const openVideo = (videoId: string) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(youtubeUrl);
  };

  return (
    <View style={styles.container}>
      {/* Popup Message */}
      {popupVisible && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>Your coach has assigned you:</Text>
          <Text style={styles.popupText}>{userData.assigned_drills} drills</Text>
          <TouchableOpacity onPress={() => setPopupVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Drills</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a drill..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={searchVideos} style={styles.searchIconContainer}>
          {/* Replace with your search icon or use a vector icon library */}
          <Image
            source={require('@/assets/images/search_icon.png')} // Your search icon image path
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Drills List */}
      <ScrollView contentContainerStyle={styles.drillList}>
        {videos.map((video) => (
          <TouchableOpacity key={video.id.videoId} onPress={() => openVideo(video.id.videoId)} style={styles.drillItem}>
            <Image
              source={{ uri: video.snippet.thumbnails.default.url }}
              style={styles.drillThumbnail}
              resizeMode='cover'
            />
            <Text style={styles.drillTitle}>{video.snippet.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

       {/* Navbar */}
       <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require('@/assets/images/drills.png')}
              style={styles.navIcon}
            />
          </View>
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerBookGround')}>
          <Image
            source={require('@/assets/images/stadium.png')}
            style={styles.navIcon}
          />
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Image source={require('@/assets/images/home.png')} style={styles.navIcon} />
          
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerTeamsRanking')}>
          <Image
            source={require('@/assets/images/ranking.png')}
            style={styles.navIcon}
          />
         
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={toggleModal}>
          <Image
            source={require('@/assets/images/more.png')}
            style={styles.navIcon}
          />
         
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.expandedNavbar}>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerGenerateKit'); }}>
              <Image
                source={require('@/assets/images/kit.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Fitness</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerCommunity'); }}>
              <Image
                source={require('@/assets/images/community.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerHighlightsPage'); }}>
              <Image
                source={require('@/assets/images/cloud.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Highlights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerSettings'); }}>
              <Image
                source={require('@/assets/images/settings.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Settings</Text>
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the drills section
  },
  popup: {
    position: 'absolute',
    top: 220,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 25,
    borderRadius: 10,
    zIndex: 1000,
  },
  popupText: {
    color: 'lightgrey',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#005B41',
    padding: 10,
    width:'50%',
    borderRadius:10,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'lightgrey',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    backgroundColor: '#005B41',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginLeft: 15,
    tintColor: '#fff',
  },
  headerText: {
    flex: 1,
    fontSize: 30,
    paddingRight: 35,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Center align items vertically
    paddingHorizontal: 15,
    paddingVertical: 25,
    backgroundColor: '#005B41',
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    height: 45,
    flex: 1, // Allow input to take up available space
    paddingHorizontal: 15,
    color: 'lightgrey',
  },
  searchIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Spacing between input and icon
  },
  searchIcon: {
    width: 24, // Adjust the width of the icon as needed
    height: 24, // Adjust the height of the icon as needed
  },
  drillList: {
    paddingHorizontal: 15,
    backgroundColor: '#121212', // Dark background for the drills list
    paddingVertical: 10,
    paddingBottom: 100, // Extra padding to prevent navbar overlap
  },
  drillItem: {
    flexDirection: 'row', // Align image and text horizontally
    alignItems: 'center', // Center items vertically
    marginVertical: 5, // Spacing between items
    paddingVertical: 10,
  },
  drillThumbnail: {
    width: 155,
    height: 90,
    borderRadius: 10, // Rounded corners for image
  },
  drillTitle: {
    color: 'lightgrey', 
    marginLeft: 15,
    flex:1, 
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  highlight: {
    position: 'absolute',
    bottom: 35, // Slightly raised pop-up effect
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
  navIcon: {
    width: 35,
    height: 35,
    tintColor: '#fff', // Make icons white
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
  },
  expandedNavbar: {
    width: '50%',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  navItemExpanded: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  expandedNavText: {
    color: '#fff',
    fontSize: 18,
  },

});
