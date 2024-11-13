import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, RefreshControl, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import CustomAlert from "@/components/CustomAlert";

interface Player { 
  name: string;
  username: string;
  phone_no: string;
  password: string;
  fitness_status: string;
  matches_played: number;
  highlights: [];
  team_id: string;
  height: number;
  email: string;
  fiveWickets: number;
  requestAccepted: boolean;
  runsScored: number;
  ballsFaced: number;
  battingAverage: number;
  battingStrikeRate: number;
  noOfTimesOut: number;
  centuries: number;
  halfCenturies: number;
  oversBowled: number;
  ballsBowled: number;
  runsConceded: number;
  wicketsTaken: number;
  bowlingAverage: number;
  bowlingStrikeRate: number;
  economyRate: number;
  player_id: string;
  age: number;
  role: string;
  preferred_hand: string;
  training_sessions: string;
  weight: number;
  assigned_drills: string;
  bowling_hand: string;
  best_bowling: string;
  profile_pic: string;
}

export default function CoachAssignedPlayers() {
  const [assignedPlayersData, setAssignedPlayersData] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
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
          fetchPlayersData(parsedUserData.assigned_players);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
      finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchPlayersData = async (playerIds: string[], forceRefresh = false) => {
    const db = getFirestore();
    const playersArray: Player[] = [];

    try {
      setLoading(true);
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
    finally{
      setLoading(false);
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
    // setAlertMessage("Update failed");
    // setAlertVisible(true);
  };

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  return (
    <>
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Assigned Players</Text>
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
        {assignedPlayersData.map((player, index) => (
          <TouchableOpacity key={index} style={styles.playerCard} onPress={() => handlePlayerPress(player)}>
            <View style={styles.playerInfoContainer}>
              <Image
                source={player.profile_pic?{uri: player.profile_pic} : require('@/assets/images/assignedplayer.png')}
                style={styles.playerImage}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.roleDetails}>Role: {player.role}</Text>
                <Text style={styles.drillsDetails}>Session: {player.training_sessions}</Text>
                <TouchableOpacity style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>View Player Highlights</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </>)}

      {/* Player Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedPlayer && (
              <>
                <Text style={styles.modalTitle}>{selectedPlayer.name}</Text>
                <Text style={styles.modalDetails}>Age: {selectedPlayer.age}</Text>
                <Text style={styles.modalDetails}>Role: {selectedPlayer.role}</Text>
                <Text style={styles.modalDetails}>Preferred Hand: {selectedPlayer.preferred_hand}</Text>
                <Text style={styles.modalDetails}>Bowling Hand: {selectedPlayer.bowling_hand}</Text>
                <Text style={styles.modalDetails}>Best Bowling: {selectedPlayer.best_bowling}</Text>
                <Text style={styles.modalDetails}>
                  Training Session: {selectedPlayer.training_sessions}
                </Text>
                <Text style={styles.modalDetails}>Weight: {selectedPlayer.weight} kg</Text>
                <Text style={styles.modalDetails}>Assigned Drills: {selectedPlayer.assigned_drills}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/group.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

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
    <CustomAlert 
      visible={alertVisible} 
      message={alertMessage} 
      onConfirm={handleAlertConfirm} 
      onCancel={handleAlertConfirm}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e1e1e', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
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
    backgroundColor: "#1e1e1e",
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