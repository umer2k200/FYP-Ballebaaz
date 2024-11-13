import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import CustomAlert from "@/components/CustomAlert";

interface player {
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
  const router = useRouter();
  const navigation = useNavigation();
  

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  const [userData, setUserData] = useState({
    username: "",
    phone_no: 0,
    email: "",
    team_id: "",
  });

  const [bookingsList, setBookingsList] = useState<player[]>([]); // Store fetched booking details here

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          await fetchTeamData(); // Call to fetch team data
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchPlayerDetails = async (playerIds: string[]) => {
    const bookingsData: player[] = [];
    for (let i = 0; i < playerIds.length; i++) {
      const bookingCollectionRef = collection(db, "player");
      const q = query(bookingCollectionRef, where("player_id", "==", playerIds[i]));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        const bookingData = bookingDoc.data();
        const booking: player = {
          player_id: bookingData.player_id,
          name: bookingData.name ,
          username: bookingData.username,
          role: bookingData.role,
          password: bookingData.password,
          fitness_status: bookingData.fitness_status,
          matches_played: bookingData.matches_played,
          best_bowling: bookingData.best_bowling,
          highlights: bookingData.highlights,
          team_id: bookingData.team_id,
          preferred_hand: bookingData.preferred_hand,
          bowling_hand: bookingData.bowling_hand,
          training_sessions: bookingData.training_sessions,
          assigned_drills: bookingData.assigned_drills,
          weight: bookingData.weight,
          height: bookingData.height,
          age: bookingData.age,
          email: bookingData.email,
          fiveWickets: bookingData.fiveWickets,
          phone_no: bookingData.phone_no,
          requestAccepted: false,
          runsScored : bookingData.runsScored,
          ballsFaced : bookingData.ballsFaced,
          battingAverage : bookingData.battingAverage,
          battingStrikeRate : bookingData.battingStrikeRate,
          noOfTimesOut : bookingData.noOfTimesOut,
          centuries : bookingData.centuries,
          halfCenturies : bookingData.halfCenturies,
          oversBowled : bookingData.oversBowled,
          ballsBowled : bookingData.ballsBowled,
          runsConceded : bookingData.runsConceded,
          wicketsTaken : bookingData.wicketsTaken,
          bowlingAverage : bookingData.bowlingAverage,
          economyRate : bookingData.economyRate,
          bowlingStrikeRate : bookingData.bowlingStrikeRate,
          profile_pic : bookingData.profile_pic,
        };
        bookingsData.push(booking);
      }
    }
    setBookingsList(bookingsData);
  };

  const fetchTeamData = async () => {
    setLoading(true); // Start loader
    try {
      const storedTeamOwnerData = await AsyncStorage.getItem("userData");
      if (storedTeamOwnerData) {
        const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
        const teamOwnerTeamId = parsedTeamOwnerData.team_id;

        const teamCollectionRef = collection(db, "team");
        const q = query(teamCollectionRef, where("team_id", "==", teamOwnerTeamId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teamDoc = querySnapshot.docs[0];
          const teamData2 = teamDoc.data();

          if (teamData2.players && Array.isArray(teamData2.players)) {
            await fetchPlayerDetails(teamData2.players);
          }
        } else {
          console.log("No team found with this team ID");
        }
      } else {
        console.log("Team owner data not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching team data: ", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<player | null>(null);

  const handlePlayerPress = (player: player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/TeamOwnerSettings")}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Current Players</Text>
      </View>

      {/* Show loader while fetching */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {bookingsList.map((player) => (
            <TouchableOpacity
              key={player.player_id}
              style={styles.playerCard}
              onPress={() => handlePlayerPress(player)}
            >
              <View style={styles.playerInfoContainer}>
                <Image
                  source={require("@/assets/images/assignedplayer.png")}
                  style={styles.playerImage}
                />
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.RoleDetails}>Role: {player.role}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
              <Image
                  source={selectedPlayer.profile_pic ? { uri: selectedPlayer.profile_pic } : require("@/assets/images/assignedplayer.png")}
                  style={styles.playerImage2}
                />
                <Text style={styles.modalTitle}>{selectedPlayer.name}</Text>
                <Text style={styles.modalDetails}>Role: {selectedPlayer.role}</Text>
                <Text style={styles.modalDetails}>Batting Hand: {selectedPlayer.preferred_hand}</Text>
                <Text style={styles.modalDetails}>Bowling Hand: {selectedPlayer.bowling_hand}</Text>
                <Text style={styles.modalDetails}>Batting avg: {selectedPlayer.runsScored>-1 && selectedPlayer.noOfTimesOut>0 ? (selectedPlayer.runsScored/selectedPlayer.noOfTimesOut).toFixed(2):'N/A'}</Text>
                <Text style={styles.modalDetails}>Batting strikerate: {selectedPlayer.runsScored>-1 && selectedPlayer.ballsFaced>0?((selectedPlayer.runsScored/selectedPlayer.ballsFaced)*100).toFixed(2):'N/A'}</Text>
                <Text style={styles.modalDetails}>Bowling economy: {selectedPlayer.runsConceded>-1 && selectedPlayer.oversBowled>0? (selectedPlayer.runsConceded/selectedPlayer.oversBowled).toFixed(2):'N/A'}</Text>
                <Text style={styles.modalDetails}>Fitness Status: {selectedPlayer.fitness_status}</Text>

                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:50,
    marginBottom:50,
  },
  playerImage2: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius:20,
  },
  pageName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1, // Makes sure the page name is centered
    
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  titleContainer: {
    marginTop:70,
    marginBottom: 40,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 33,
    color: "darkgrey",
    fontWeight: "bold",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  playerCard: {
    backgroundColor: "#005B41",
    borderRadius: 20,
    marginBottom: 25,
    padding: 10,
    width: "95%",
    alignSelf: "center",
  },
  playerInfoContainer: {
    flexDirection: "row", // Align image and text horizontally
    alignItems: "center",
  },
  playerImage: {
    width: 80,
    height: 80,
    marginRight: 10, // Add space between the image and the text
  },
  playerDetails: {
    flex: 1, // Take up the remaining space
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
  },
  sessionDetails: {
    color: "#aaa",
    fontSize: 14,
  },
  RoleDetails: {
    color: "#ccc",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
  },
  modalView: {
    width: "90%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 15,
  },
  modalDetails: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    padding: 10,
    width:100,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
