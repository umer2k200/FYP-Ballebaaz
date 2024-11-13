import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getFirestore, doc, collection, query, where, getDocs, updateDoc,getDoc} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import CustomAlert from "@/components/CustomAlert";
import { useFocusEffect } from '@react-navigation/native';


interface Player {
  name: string;
  player_id: string;
  assigned_drills: string;
}

interface Session {
  playerName: string;
  sessionType: string;
  date: string;
  time: string;
  location: string;
}

export default function CoachTrainingSessions() {
  const [assignedPlayersData, setAssignedPlayersData] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSession, setNewSession] = useState<Partial<Session>>({});
  const [trainingSessions, setTrainingSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const navigation = useNavigation();

  // Fetch user data and assigned players on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          fetchPlayersData(parsedUserData.assigned_players);
        }
  
        // Fetch cached training sessions
        const cachedSessions = await AsyncStorage.getItem("cachedTrainingSessions");
        if (cachedSessions) {
          setTrainingSessions(JSON.parse(cachedSessions));
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally{
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Fetch player data based on assigned players
  const fetchPlayersData = async (playerIds: string[], forceRefresh = false) => {
    const playersArray: Player[] = [];

    try {
      const cachedPlayers = await AsyncStorage.getItem("cachedPlayersData");

      if (cachedPlayers && !forceRefresh) {
        console.log("Using cached players data");
        setAssignedPlayersData(JSON.parse(cachedPlayers));
        return;
      }

      const playerCollectionRef = collection(db, "player");

      for (let userPlayerId of playerIds) {
        const q = query(playerCollectionRef, where("player_id", "==", userPlayerId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          playersArray.push(doc.data() as Player);
        });

        if (querySnapshot.empty) {
          console.log("No such player found for ID:", userPlayerId);
        }
      }

      setAssignedPlayersData(playersArray);
      await AsyncStorage.setItem("cachedPlayersData", JSON.stringify(playersArray));
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const fetchTrainingSessions = async (playerId: string) => {
    try {
      const sessionsArray: Session[] = [];
      const playerCollectionRef = collection(db, "player");
  
      // Query Firestore for the document with this player_id
      const q = query(playerCollectionRef, where("player_id", "==", playerId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Assuming there's only one matching document
        const userDoc = querySnapshot.docs[0];
        const userDocId = userDoc.id; // Get the document ID dynamically
  
        // Create the reference to the Firestore document using the fetched userDocId
        const userDocRef = doc(db, "player", userDocId);
        const playerDoc = await getDoc(userDocRef);
  
        if (playerDoc.exists()) {
          console.log("Player document found:", playerDoc.data()); // Debugging log
          const playerData = playerDoc.data();
          const trainingSessionsString = playerData?.training_sessions || "";
  
          // Split the sessions string into individual sessions
          const sessionEntries = trainingSessionsString.split("|").map((entry: string) => entry.trim());
  
          // Format the entries into session objects
          sessionEntries.forEach((entry: string) => {
            const [dateAndType, location] = entry.split(" at ");
            const [date, sessionType] = dateAndType.split(" - ");
  
            sessionsArray.push({
              playerName: playerData.name, // Assuming you want to include the player's name
              sessionType: sessionType || "",
              date: date || "",
              time: "", // You can set this if you have a specific format
              location: location || "",
            });
          });
          setTrainingSessions(sessionsArray);
          await AsyncStorage.setItem("cachedTrainingSessions", JSON.stringify(sessionsArray));
        } else {
          console.log("No such player document!");
        }
      } else {
        console.log("No matching player found!");
      }
    } catch (error) {
      console.error("Error fetching training sessions:", error);
    }
  };

  // Refresh player data
  const onRefresh = async () => {
    setRefreshing(true);
    const storedUserData = await AsyncStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      await fetchPlayersData(parsedUserData.assigned_players, true);
    }
    setRefreshing(false);
  };

  // Handle adding a new session
  const handleAddSession = async () => {

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Validate the date format
  if (!newSession.date || !dateRegex.test(newSession.date)) {
    setAlertMessage("Please enter a valid date in the format YYYY-MM-DD.");
    setAlertVisible(true)
    return;
  }

  // Validate the time format
  if (!newSession.time || !timeRegex.test(newSession.time)) {
    setAlertMessage("Please enter a valid time in the format HH:MM.");
    setAlertVisible(true);
    return;
  }

    if (
      newSession.playerName &&
      newSession.sessionType &&
      newSession.date &&
      newSession.time &&
      newSession.location
    ) {
      try {
        setLoading(true);
        // Find the selected player
        const selectedPlayer = assignedPlayersData.find(
          (player) => player.name === newSession.playerName
        );

        if (!selectedPlayer) {
          setAlertMessage("Player not found");
          setAlertVisible(true);
          return;
        }

        // Create a reference to the "player" collection
        const playerCollectionRef = collection(db, "player");

        // Query Firestore for the document with this player_id
        const q = query(playerCollectionRef, where("player_id", "==", selectedPlayer.player_id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const userDoc = querySnapshot.docs[0];
          const userDocId = userDoc.id; // Get the document ID dynamically

          // Create the reference to the Firestore document using the fetched userDocId
          const userDocRef = doc(db, "player", userDocId);

          const updatedSessions = `${newSession.date} - ${newSession.sessionType} at ${newSession.location}`;

          // Update player's training_sessions
          await updateDoc(userDocRef, {
            training_sessions: updatedSessions, // Optionally store it as an array and append
          });

          setAlertMessage("Session added successfully");
          setAlertVisible(true);
          setModalVisible(false);
          setNewSession({
            playerName: "",
            sessionType: "",
            date: "",
            time: "",
            location: "",
          });

          fetchTrainingSessions(selectedPlayer.player_id);

        } else {
          setAlertMessage("No matching player document found");
          setModalVisible(true);
        }
      } catch (error) {
        console.error("Error adding session:", error);
        setAlertMessage('Failed to add session'); // Provide specific error feedback
        setAlertVisible(true)
      } finally{
        setLoading(false);
      }
    } else {
      setAlertMessage("Please fill in all the fields");
      setAlertVisible(true);
    }
};

const handleAlertConfirm = () => {
  setAlertVisible(false);
};

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Training Sessions</Text>
      </View>
    {loading? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
     </View>
    ):(<>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {trainingSessions.map((session, index) => (
          <View key={index} style={styles.sessionCard}>
            <Text style={styles.sessionInfo}>
              Player:{" "}
              <Text style={styles.sessionInfo2}>{session.playerName}</Text>
            </Text>
            <Text style={styles.sessionInfo}>
              Session:{" "}
              <Text style={styles.sessionInfo3}>{session.sessionType}</Text>
            </Text>
            <Text style={styles.sessionInfo}>
              Date: <Text style={styles.sessionInfo3}>{session.date}</Text> |
              Time: <Text style={styles.sessionInfo3}>{session.time}</Text>
            </Text>
            <Text style={styles.sessionInfo}>
              Location:{" "}
              <Text style={styles.sessionInfo3}>{session.location}</Text>
            </Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Next Session</Text>
      </TouchableOpacity>
      </>)}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >

        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Next Session</Text>
            <Picker
              selectedValue={newSession.playerName}
              style={styles.modalInput}
              itemStyle={{ color: 'white' }}
              onValueChange={(itemValue) => setNewSession({ ...newSession, playerName: itemValue})}
            >
              {assignedPlayersData.map((player) => (
                <Picker.Item key={player.player_id} label={player.name} value={player.name} />
              ))}
            </Picker>
            <TextInput
              style={styles.modalInput}
              placeholder="Session Type"
              placeholderTextColor="#888"
              value={newSession.sessionType || ""}
              onChangeText={(text) =>
                setNewSession({ ...newSession, sessionType: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date"
              placeholderTextColor="#888"
              value={newSession.date || ""}
              onChangeText={(text) =>
                setNewSession({ ...newSession, date: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Time"
              placeholderTextColor="#888"
              value={newSession.time || ""}
              onChangeText={(text) =>
                setNewSession({ ...newSession, time: text })
              }
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location"
              placeholderTextColor="#888"
              value={newSession.location || ""}
              onChangeText={(text) =>
                setNewSession({ ...newSession, location: text })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.addButtonModal}
                onPress={handleAddSession}
              >
                <Text style={styles.addButtonTextModal}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/upcomingmatches.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachHomePage")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

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
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    marginTop: 70,
    marginBottom: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 33,
    color: "darkgrey",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 20,
    height: 40,
  },
  scrollContainer: {
    alignItems: "center",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  sessionCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 15,
    width: "95%",
    marginBottom: 15,
  },
  sessionInfo: {
    color: "white",
    fontSize: 16,
  },
  sessionInfo2: {
    color: "#005B41",
    fontWeight: "bold",
  },
  sessionInfo3: {
    color: "darkgrey",
  },
  addButton: {
    backgroundColor: "#005B41",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
  },
  modalInput: {
    backgroundColor: "#333",
    borderRadius: 10,
    color: "#fff",
    padding: 10,
    marginBottom: 20,
    width: "100%",
  },

  closeButton: {
    backgroundColor: "#f00",
    borderRadius: 10,
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addButtonModal: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    padding: 10,
    width: 100,
    marginRight:15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  addButtonTextModal: {
    color: "#fff",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    
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