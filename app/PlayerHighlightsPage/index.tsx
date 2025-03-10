import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';


interface match {
  dateTime: string;
  ground_id: string;
  match_id: string;
  highlights: string[];
  team1: string;
  team2: string;
  result: string;
  umpire_id: string;
}

export default function PlayerHighlightsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matchesList, setMatchesList] = useState<match[]>([]);
  const [userData, setUserData] = useState({
      name: '',
      username: '',
      phone_no: '',
      role: "",
      password: '',
      player_id: '', 
      fitness_status: "",
      matches_played: 0,
      best_bowling: "",
      highlights: [],
      team_id: "",
      preferred_hand: "",
      bowling_hand: "",
      training_sessions: [],
      assigned_drills: "",
      weight: 0,
      height: 0,
      age: 0,
      email: "",
      fiveWickets: 0,
      requestAccepted: false,
      runsScored : 0,
      ballsFaced : 0,
      battingAverage : 0,
      battingStrikeRate : 0,
      noOfTimesOut : 0,
      centuries : 0,
      halfCenturies : 0,
      oversBowled : 0,
      ballsBowled : 0,
      runsConceded : 0,
      wicketsTaken : 0,
      bowlingAverage : 0,
      economyRate : 0,
      bowlingStrikeRate : 0,
      profile_pic: '',
      maidenOvers: 0,
    });

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const storedUserData = await AsyncStorage.getItem("userData");
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            console.log("Fetched User Data:", parsedUserData); // Debugging
            setUserData(parsedUserData);
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, []);

    useEffect(() => {
        if (userData.team_id) {
          fetchMatchIDs();
        }
      }, [userData.team_id]);

    const fetchMatchIDs = async () => {
      try{
        setLoading(true);
        const teamID = userData.team_id;
        const matchCollectionRef = collection(db, 'match');
        const q1 = query(matchCollectionRef, where('team1', '==', teamID), where('result', '==', 'completed'));
        const q2 = query(matchCollectionRef, where('team2', '==', teamID), where('result', '==', 'completed'));
        const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const matches: match[] = [];
        querySnapshot1.forEach((doc) => {
          matches.push(doc.data() as match);
        }
        );
        querySnapshot2.forEach((doc) => {
          matches.push(doc.data() as match);
        }
        );
        console.log("Fetched Matches:", matches); 
        setMatchesList(matches);
      }    
      catch (error) {
        console.log("Error fetching matches:", error);
      }
      finally{
        setLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Your Highlights</Text>
      </View>
      { loading? (
        <View style={styles.loaderContainer}>
                  <ActivityIndicator size='large' color='#005B41' />
              </View>
      ):(<>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

      {matchesList.length === 0 ? (
          <Text style={styles.videoTitle}>No matches found.</Text>
        ) : (
          matchesList.map((match, index) => (
            <TouchableOpacity 
              style={styles.videoContainer} 
              key={index} 
            >
              <Text style={styles.videoTitle}>Match {index + 1}</Text>
              <Text style={styles.videoTitle2}>Match ID: {match.match_id}</Text>
              <Text style={styles.videoTitle2}>vs: {match.team1 === userData.team_id? match.team2: match.team1}</Text>
              <Text style={styles.videoTitle2}>Location: {match.ground_id !== ''? match.ground_id: 'Not found'}</Text>
              <Text style={styles.videoTitle2}>Date: {match.dateTime}</Text>
              <TouchableOpacity
                      style={styles.matchesButton}
                      onPress={() => router.push({ pathname: '/PlayerHighlightsPage2', params: { match_id: match.match_id, player_id : userData.player_id } })}
                    >
                      <Text style={styles.matchesButtonText}>View Highlights</Text>
                    </TouchableOpacity>
            </TouchableOpacity>
          ))
      )}
      </ScrollView>
      </>)}

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerDrills')}>
          <Image
            source={require('@/assets/images/drills.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerFitness')}>
          <Image
            source={require('@/assets/images/fitness.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerHomePage')}>
          <Image
            source={require('@/assets/images/home.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerCommunity')}>
          <Image
            source={require('@/assets/images/group.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require('@/assets/images/cloud.png')} // Replace with your home icon URL
              style={styles.navIcon}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerSettings')}>
          <Image
            source={require('@/assets/images/settings.png')} // Replace with your settings icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
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
    zIndex:1000,
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
    marginRight:30,
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
  matchesButton: {
    backgroundColor: "#005B41", // Blue color for the Attributes button
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginVertical: 5,
    width: "85%",
    alignSelf: "center",
  },
  matchesButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  video: {
    width: '100%',
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
    paddingHorizontal:20,
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
});