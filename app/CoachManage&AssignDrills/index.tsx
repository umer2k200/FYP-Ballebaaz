import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, RefreshControl, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import CustomAlert from "@/components/CustomAlert";

interface Player {
  name: string;
  player_id: string;
  age: number;
  role: string;
  preferred_hand: string;
  strike_rate: number;
  training_sessions: string;
  weight: number;
  assigned_drills: string;
  profile_pic: string;
  bowling_hand: string;
  economy: number;
  best_bowling: string;
}

interface Drill {
  drillName: string;
}

export default function CoachManageandAssignDrills() {
  const [assignedPlayersData, setAssignedPlayersData] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [newDrill, setNewDrill] = useState<Partial<Drill>>({});
  const [assignedDrills, setAssignedDrills] = useState<Drill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const navigation = useNavigation(); // Used to navigate between screens
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          fetchPlayersData(parsedUserData.assigned_players);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchPlayersData = async (playerIds: string[], forceRefresh = false) => {
    const db = getFirestore();
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

  const onRefresh = async () => {
    setRefreshing(true);
    const storedUserData = await AsyncStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      await fetchPlayersData(parsedUserData.assigned_players, true);
    }
    setRefreshing(false);
  };

  const handleAddDrill =  async () => {
    if(
      newDrill.drillName
    ) {
      try {
        // Find the selected player
        const selectedP = selectedPlayer

        if (!selectedP) {
          setAlertMessage("Player not found");
          setAlertVisible(true);
          return;
        }

        // Create a reference to the "player" collection
        const playerCollectionRef = collection(db, "player");

        // Query Firestore for the document with this player_id
        const q = query(playerCollectionRef, where("player_id", "==", selectedP.player_id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const userDoc = querySnapshot.docs[0];
          const userDocId = userDoc.id; // Get the document ID dynamically

          // Create the reference to the Firestore document using the fetched userDocId
          const userDocRef = doc(db, "player", userDocId);

          const updatedDrills = `${newDrill.drillName}`;

          // Update player's training_sessions
          await updateDoc(userDocRef, {
            assigned_drills: updatedDrills, // Optionally store it as an array and append
          });

          setAlertMessage("Session added successfully");
          setAlertVisible(true);
          setModalVisible(false);
          setNewDrill({
            drillName: "",
          });

        } else {
          setAlertMessage("No matching player document found");
          setAlertVisible(true);
        }
      } catch (error) {
        console.error("Error adding session:", error);
        setAlertMessage('Failed to add session'); // Provide specific error feedback
        setAlertVisible(true);
      }
    } else {
      setAlertMessage("Please fill in all the fields");
      setAlertVisible(true);
    }
  }

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Add Drills</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {assignedPlayersData.map((player, index) => (
          <TouchableOpacity key={index} style={styles.playerCard} onPress={() => handlePlayerPress(player)}>
            <View style={styles.playerInfoContainer}>
              <Image
                source={require("@/assets/images/assignedplayer.png")}
                style={styles.playerImage}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.roleDetails}>Role: {player.role}</Text>
                <Text style={styles.drillsDetails}>Drill: {player.assigned_drills}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Player Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Drill</Text>
            <TextInput
            style={styles.modalInput}
            placeholder="Add Drill"
            placeholderTextColor="#888"
            value={newDrill.drillName || ""}
              onChangeText={(text) =>
                setNewDrill({ ...newDrill, drillName: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.addButtonModal}
                onPress={handleAddDrill}
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachUpcomingTrainingSessions")}
        >
          <Image
            source={require("@/assets/images/upcomingmatches.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachHomePage")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/assign.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

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
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    width: "95%",
    alignSelf: "center",
  },
  playerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
  },
  roleDetails: {
    color: "#aaa",
    fontSize: 14,
  },
  drillsDetails: {
    color: "#aaa",
    fontSize: 14,
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
    marginBottom: 15,
  },
  modalDetails: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
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
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addButtonModal: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    width: 80,
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