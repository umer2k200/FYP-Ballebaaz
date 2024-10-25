import React, { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig';
import CustomAlert from '@/components/CustomAlert';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';

interface TeamData {
  captain_id: string;
  captain_name: string;
  coach_id: string;
  highest_score: number;
  highlights: string;
  matches_lost: number;
  matches_played: number;
  matches_won: number;
  players: string;
  ranking: string;
  team_id: string;
  team_name: string;
  wl_ratio: number;
}

export default function TeamOwnerProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  const [teamOwnerData,setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id:"",
    username:  "",
    password: "",

  })

  const [teamData, setTeamData] = useState({
     captain_id:"",
    captain_name:"",
    coach_id:"",
    highest_score: '',
    highlights:"",
    matches_lost: 0,
    matches_played: 0,
    matches_won: 0,
    players:"",
    ranking:"",
    team_id:"",
    team_name: "",
    wl_ratio: 0,
    profile_pic: "",
  });

  const [teamExists, setTeamExists] = useState(true);

  const [userData, setUserData] = useState({
    username: "",
    phone_no: 0,
    email: "",
    team_id: "",
  });

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setTeamOwnerData(parsedUserData);
          //await fetchTeamData();
          if (parsedUserData.team_id === '') {
            setTeamExists(false);
            console.log("Team does not exist");
          }
          else{
            console.log("Team exists");
            await fetchTeamData();
          }
          setLoading(false);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchTeamData = async () => {
        try {
          // setLoading(true);
      
          // Step 1: Get the current team owner data from AsyncStorage
          const storedTeamOwnerData = await AsyncStorage.getItem("userData");
          
          if (storedTeamOwnerData) {
            const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
      
            // Assuming team_id is stored in the team owner data
            const teamOwnerTeamId = parsedTeamOwnerData.team_id;
      
            // Step 2: Query the "team" collection for the document with this team_id
            const teamCollectionRef = collection(db, "team");
      
            const q = query(teamCollectionRef, where("team_id", "==", teamOwnerTeamId));
            const querySnapshot = await getDocs(q);
      
            if (!querySnapshot.empty) {
              // Assuming there's only one matching document
              const teamDoc = querySnapshot.docs[0];
              const teamDocId = teamDoc.id;
              const teamData2 = teamDoc.data(); // Explicitly cast the data to TeamData type
      
              // Step 3: Use teamData for rendering or updating state
              console.log("Fetched Team Data:", teamData2);
              setTeamData(teamData2 as any); // Assuming you have setTeamData to update your state
      
            } else {
              console.log("No team found with this team ID");
            }
          } else {
            console.log("Team owner data not found in AsyncStorage");
          }
        } catch (error) {
          console.error("Error fetching team data: ", error);
        } finally {
          // setLoading(false);
        }
      };


  // Toggle Modal Visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>
      {/* Notification Icon */}
      <TouchableOpacity style={styles.notItem} onPress={() => router.push('/TeamOwnerAccReq')}>
          <Image
            source={require('@/assets/images/notification.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Picture */}
        {teamExists ? (<>
        <View style={styles.profilePicContainer}>
          <Image
            source={teamData.profile_pic? {uri: teamData.profile_pic}: require('@/assets/images/assignedplayer.png')} // Replace with dynamic profile pic URL if needed
            style={styles.profilePic}
          />
        </View>

        {/* Profile Name */}
        <Text style={styles.profileName}>{teamData.team_name}</Text>
        {/* Career Stats Card */}
        <View style={styles.statsCard}>
          {/* <Text style={styles.statsTitle}>Stats</Text> */}
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Matches Played</Text>
            <Text style={styles.statValue}>{teamData.matches_played}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Matches Won</Text>
            <Text style={styles.statValue}>{teamData.matches_won}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Matches Lost</Text>
            <Text style={styles.statValue}>{teamData.matches_lost}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>W/L Ratio</Text>
            <Text style={styles.statValue}>{teamData.matches_won>-1 && teamData.matches_lost>0 ? (teamData.matches_won/teamData.matches_lost).toFixed(2).concat('%'): 'N/A'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Highest Score</Text>
            <Text style={styles.statValue}>{teamData.highest_score? teamData.highest_score: 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Captain</Text>
            <Text style={styles.statValue}>{teamData.captain_name}</Text>
          </View>
        </View>
        {/* Upcoming Matches Button */}
      <TouchableOpacity style={styles.matchesButton} onPress={() => router.push('/TeamOwnerUpcomingMatches')}>
        <Text style={styles.matchesButtonText}>Upcoming Matches</Text>
      </TouchableOpacity>
        </>):(
          <TouchableOpacity
          style={styles.addGroundButton}
          onPress={() => router.push("/TeamOwnerAddTeam")} // Navigate to add ground screen
        >
          <Text style={styles.addGroundText}>Register Team</Text>
        </TouchableOpacity>
        )}
      </ScrollView>

      
      </>
      )}

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerDrills')}>
          <Image
            source={require('@/assets/images/drills.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerBookGround-2')}>
          <Image
            source={require('@/assets/images/stadium.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require('@/assets/images/home.png')}
              style={styles.navIcon}
            />
          </View>
        </View>
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

      {/* Modal for expanded navigation */}
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
              <Text style={styles.expandedNavText}>AI Kit Generation</Text>
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
        backgroundColor: '#121212', // Dark background color
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingBottom: 50,
      },
      scrollContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 100, // Add extra padding to avoid content being hidden behind the navbar
      },
      addGroundButton: {
        backgroundColor: "#005B41", // Teal color
        padding:15,
        borderRadius: 10,
        marginTop: 20,
        width: "60%",
        alignSelf: "center",
        alignItems: "center",
      },
      addGroundText: {
        color: "#fff",
        fontSize: 16,
      },
      loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
        zIndex:1000,
      },
      profilePicContainer: {
        borderRadius: 75,
        padding: 5,
        borderColor: '#00bfa5', // Teal border for a highlight effect
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // Adds shadow for Android
        marginBottom: 20,
        marginTop: 25,
      },
      profilePic: {
        width: 150,
        height: 150,
        borderRadius: 75, // Circular profile picture
      },
      profileName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
      },
      profileBio: {
        fontSize: 16,
        color: '#00bfa5', // Teal color for bio to match the theme
        marginBottom: 20,
      },
      statsCard: {
        backgroundColor: '#1e1e1e',
        borderRadius: 15,
        padding: 20,
        width: '110%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5, // Adds shadow for Android
        marginBottom: 20, // Space between stats and navbar
      },
      statsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: 'white',
        textAlign: 'center',
      },
      statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
      },
      statLabel: {
        fontSize: 16,
        color: 'white',
      },
      statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
      },
      matchesButton: {
        backgroundColor: '#005B41', // Blue color for the Attributes button
        padding: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginVertical: 15,
      },
      matchesButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
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
      notItem: {
        padding: 10,
        top:35,
        marginLeft:-20,
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
        fontSize: 16,
      },
      closeButton: {
        backgroundColor: '#005B41',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 15,
      },
      closeButtonText: {
        color: '#fff',
        fontSize: 18,
      },
})

