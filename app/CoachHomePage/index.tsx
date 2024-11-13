import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomAlert from "@/components/CustomAlert";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import firebase from "firebase/app"
import { doc, getDoc, updateDoc, getDocs, query, where, collection, getFirestore } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface Player {
  name: string;
  player_id: string;
  assigned_drills: string;
  training_sessions: string;
  // Add other fields as needed
}

export default function CoachHomeScreen() {

  const [userData, setUserData] = useState({
    assigned_players: [],
    coach_id: "",
    coach_name: "",
    email: "",
    experience: 0,
    password: "",
    phone_no: 0,
    team_id: "",
    username: "",
  });

  const router = useRouter();
  const [assignedPlayersData, setAssignedPlayersData] = useState<Player[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
          fetchPlayersData(parsedUserData.assigned_players);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchPlayersData = async (playerIds: string[], forceRefresh = false) => {
    const db = getFirestore();
    const playersArray: Player[] = [];
    console.log("Fetching data for player IDs:", playerIds); // Debug log
  
    try {
      setLoading(true);
      const cachedPlayers = await AsyncStorage.getItem("cachedPlayersData");

    if (cachedPlayers && !forceRefresh) {
      console.log("Using cached players data");
      setAssignedPlayersData(JSON.parse(cachedPlayers));
      return;
    }

      const playerCollectionRef = collection(db, "player"); // Ensure the correct collection name
  
      for (let userPlayerId of playerIds) {
        // Query Firestore for the document with this player_id field
        const q = query(playerCollectionRef, where("player_id", "==", userPlayerId));
        const querySnapshot = await getDocs(q);
  
        // If the player is found, add it to the playersArray
        querySnapshot.forEach((doc) => {
          playersArray.push(doc.data() as Player); // Add player data to the array
          console.log("Fetched player data:", doc.data()); // Debug log
        });
  
        // If no player found for the ID, log it
        if (querySnapshot.empty) {
          console.log("No such player found for ID:", userPlayerId);
        }
      }
  
      setAssignedPlayersData(playersArray); // Update the state with player data
      console.log("Assigned players data updated:", playersArray); // Debug log

      await AsyncStorage.setItem("cachedPlayersData", JSON.stringify(playersArray));
    } catch (error) {
      console.error("Error fetching players:", error); // Handle errors
    } finally{
      setLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlayersData(userData.assigned_players, true); // Force refresh data from Firestore
    setRefreshing(false); // Stop the refreshing spinner
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          Welcome, <Text style={styles.coachText}>{userData.coach_name}</Text>
        </Text>
      </View>
      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
       </View>
      ):(<>

      <ScrollView contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      >
        {/* Assigned Players Section */}
        <TouchableOpacity style={styles.section} onPress={() => router.push("/CoachAssignedPlayers")}>
          <Text style={styles.sectionTitle}>Assigned Players</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assignedPlayersData.map((player, index) => (
              <TouchableOpacity key={index} onPress={() => router.push("/CoachAssignedPlayers")}>
                <View style={styles.playerCard}>
                  <Image
                    //source={{ uri: player.profile_pic }} // Display player image
                    source={require("@/assets/images/assignedplayer.png")} 
                    style={styles.playerImage}
                  />
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>

        {/* Training Sessions Section */}
        <TouchableOpacity style={styles.section} onPress={() => router.push("/CoachUpcomingTrainingSessions")}>
          <Text style={styles.sectionTitle}>Training Sessions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assignedPlayersData.map((player, index) => (
              <TouchableOpacity key={index} style={styles.sessionCard} onPress={() => router.push("/CoachUpcomingTrainingSessions")}>
                <Image
                  source={require("@/assets/images/assignedplayer.png")} // Replace with player image URL
                  style={styles.sessionImage}
                />
                <Text style={styles.sessionName}>{player.name}</Text>
                <Text style={styles.sessionDetails}>{player.training_sessions}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </ScrollView>
      </>)}
      <CustomAlert 
    visible={alertVisible} 
    message={alertMessage} 
    onConfirm={handleAlertConfirm} 
    onCancel={handleAlertConfirm}
    />

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachAssignedPlayers")}
        >
          <Image
            source={require("@/assets/images/group.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachUpcomingTrainingSessions")}
        >
          <Image
            source={require("@/assets/images/upcomingmatches.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/home.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachManage&AssignDrills")}
        >
          <Image
            source={require("@/assets/images/assign.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
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
    backgroundColor: "#121212", // Dark background color
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100, // Padding to avoid navbar overlap
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  section: {
    marginBottom: 20,
    width: "100%",
  },
  
  titleContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 33,
    color: 'darkgrey', // General text color (white or any color)
    fontWeight: 'bold',
  },
  coachText: {
    color: '#005B41', // Green color for 'Coach'
  },
  sectionTitle: {
    color: "darkgrey",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 30,
    textAlign: "center",
  },
  playerCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginRight: 10,
    paddingVertical: 15,
    alignItems: "center",
    width: 120,
  },
  playerImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  playerName: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  sessionCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginRight: 10,
    padding: 18,
    alignItems: "center",
    width: 150,
  },
  sessionImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  sessionName: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  sessionDetails: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e1e1e", // Dark navbar background
    paddingVertical: 7,
    borderTopLeftRadius: 50, // Extra rounded top corners for a sleek look
    borderTopRightRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: "center",
    padding: 10,
  },
  navIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  highlight: {
    position: "absolute",
    bottom: 30, // Slightly raised pop-up effect
    backgroundColor: "#005B41", // Teal highlight
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00e676", // Bright shadow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#1e1e1e",
    borderWidth: 5,
  },
});