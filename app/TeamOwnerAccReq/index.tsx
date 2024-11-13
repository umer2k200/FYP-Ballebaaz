import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // For navigation back
import Icon from "react-native-vector-icons/MaterialIcons"; // Icons for aesthetics
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  profile_pic:string;
}

export default function CaptainRequestScreen() {
  const navigation = useNavigation();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null); // Track selected player for viewing stats
  const [modalVisible, setModalVisible] = useState(false); // Control modal visibility
  const [username, setUsername] = useState("");
  const [teamId, setTeamId] = useState("");
  const [playerData, setPlayersData] = useState<Player | null>(null);
  const [requestsData, setRequestsData] = useState<Player[]>([]);
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
  const [playersData, setPlayerData] = useState<Player>({
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
    training_sessions: '',
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
    profile_pic: "",
  });

  const [teamExists, setTeamExists]= useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setUsername(parsedUserData.username);
          setTeamId(parsedUserData.team_id);
          if(parsedUserData.team_id === ''){
            console.log('no team found')
            setTeamExists(false);
          }
          else{
            console.log('team found')
            setTeamExists(true);
            await fetchPlayerTeamRequests();
          }
          
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };
    fetchUserData();
   // fetchPlayerTeamRequests();
  }, []);

  const fetchPlayerTeamRequests = async () => {
    try {
      setLoading(true);
      const storedTeamOwnerData = await AsyncStorage.getItem("userData");
      if (storedTeamOwnerData) {
        const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
        const teamOwnerTeamId = parsedTeamOwnerData.team_id;

        // Query the playerTeamRequests collection for the document with team_id
        const teamCollectionRef = collection(db, "playerTeamRequests");
        const q = query(
          teamCollectionRef,
          where("team_id", "==", teamOwnerTeamId),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(q);

        const requests: Player[] = []; // Create an array to hold requests

        if (!querySnapshot.empty) {
          for (const doc of querySnapshot.docs) {
            const teamData = doc.data() as any;
            const playerId = teamData.player_id;

            if (playerId) {
              // Query the 'players' collection to find the document with this player_id
              const playerCollectionRef = collection(db, "player");
              const playerQuery = query(
                playerCollectionRef,
                where("player_id", "==", playerId)
              );
              const playerQuerySnapshot = await getDocs(playerQuery);

              if (!playerQuerySnapshot.empty) {
                const playerDoc = playerQuerySnapshot.docs[0]; // Assuming there's only one player with this ID
                const fetchedPlayerData = playerDoc.data() as Player;
                requests.push(fetchedPlayerData); // Add fetched player data to requests
              }
            }
          }
          setRequestsData(requests); // Set requests data to state
        } else {
          console.log("No team request found with this team ID");
        }
      } else {
        console.log("Team owner data not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching team data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (playerId: string, newStatus: string) => {
    try {
      setLoading(true);
      // Retrieve the team_id from AsyncStorage to ensure you are querying the right team
      const storedTeamOwnerData = await AsyncStorage.getItem("userData");
      if (storedTeamOwnerData) {
        const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
        const teamOwnerTeamId = parsedTeamOwnerData.team_id;

        // Query the playerTeamRequests collection for the document with player_id and team_id
        const teamCollectionRef = collection(db, "playerTeamRequests");
        const q = query(
          teamCollectionRef,
          where("player_id", "==", playerId),
          where("team_id", "==", teamOwnerTeamId) // Ensure it matches the correct team_id
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref; // Get reference to the first matching document
          await updateDoc(docRef, { status: newStatus }); // Update the status
          console.log(
            `Request status updated to '${newStatus}' for player ID: ${playerId} and team ID: ${teamOwnerTeamId}`
          );
          if (newStatus === "accepted") {
            console.log("Request accepted from if block");
            // Update the team's players array
            const teamCollectionRef2 = collection(db, "team");
            const q2 = query(teamCollectionRef2, where("team_id", "==", teamOwnerTeamId));
            const querySnapshot2 = await getDocs(q2);
            if (!querySnapshot2.empty){
                const docRef2 = querySnapshot2.docs[0].ref;
                const teamData = querySnapshot2.docs[0].data();
                const playersArray = teamData.players;
                playersArray.push(playerId);
                await updateDoc(docRef2, { players: playersArray });
                console.log("Player added to team's players array");
                // update the player's team_id
                const playerCollectionRef2 = collection(db, "player");
                const q3 = query(playerCollectionRef2, where("player_id", "==", playerId));
                const querySnapshot3 = await getDocs(q3);
                if (!querySnapshot3.empty){
                  const docRef3 = querySnapshot3.docs[0].ref;
                  await updateDoc(docRef3, {
                     team_id: teamOwnerTeamId,
                     requestAccepted: true,
                    });
                  console.log("Player's team_id updated");
                }
                else{
                  console.log("No player found with this player ID");
                }

            }
            else{
              console.log("No team found with this team ID");
            } 
          }
          else{
            console.log("Request rejected");
          }

        } else {
          console.log("No request found for this player ID and team ID.");
        }
      } else {
        console.log("Team owner data not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error updating request status: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle request acceptance
  const acceptRequest = async (player: Player) => {
    await updateRequestStatus(player.player_id, "accepted"); // Update status to accepted
    setAlertMessage(`You have accepted the request from ${player.name}.`);
    setAlertVisible(true);
    fetchPlayerTeamRequests();
  };

  // Handle request rejection
  const rejectRequest = async (player: Player) => {
    await updateRequestStatus(player.player_id, "rejected"); // Update status to rejected
    setAlertMessage(`You have rejected the request from ${player.name}.`);
    setAlertVisible(true);
    fetchPlayerTeamRequests();
  };

  // Handle viewing player stats
  const viewPlayerStats = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  // Render each player request
  const renderRequestItem = ({ item }: { item: Player }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.playerName}>{item.name}</Text>
      <View style={styles.requestButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptRequest(item)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectRequest(item)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => viewPlayerStats(item)}
        >
          <Text style={styles.buttonText}>View Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Player Requests</Text>
      {loading ? (
        <View>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        
        <>
        {teamExists? (
          <FlatList
            data={requestsData} // Replace this with requests data
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.player_id}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No requests available.</Text>
            }
          />
        ):(
          <Text style={styles.emptyMessage}>No team found. Please create a team to view requests.</Text>
        )}

          {/* Modal for displaying player stats */}
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                {selectedPlayer && (
                  <>
                  
                    <Text style={styles.modalTitle}>Player Stats</Text>
                    <Image
                  source={selectedPlayer.profile_pic ? { uri: selectedPlayer.profile_pic } : require("@/assets/images/assignedplayer.png")}
                  style={styles.playerImage2}
                />
                    <Text style={styles.modalDetails}>
                      Matches: {selectedPlayer.matches_played}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Batting Strike Rate: {selectedPlayer.runsScored>-1 && selectedPlayer.ballsFaced>0 ? (selectedPlayer.runsScored/selectedPlayer.ballsFaced*100).toFixed(2) : "N/A"}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Batting Average: {selectedPlayer.runsScored>-1 && selectedPlayer.noOfTimesOut>0 ? (selectedPlayer.runsScored/selectedPlayer.noOfTimesOut).toFixed(2) : "N/A"}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Bowling Strike Rate: {selectedPlayer.ballsBowled>-1 && selectedPlayer.wicketsTaken>0 ? (selectedPlayer.ballsBowled/selectedPlayer.wicketsTaken).toFixed(2) : "N/A"}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Bowling Average: {selectedPlayer.runsConceded>-1 && selectedPlayer.wicketsTaken>0 ? (selectedPlayer.runsConceded/selectedPlayer.wicketsTaken).toFixed(2) : "N/A"}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Bowling Economy: {selectedPlayer.runsConceded>-1 && selectedPlayer.oversBowled>0? (selectedPlayer.runsConceded/selectedPlayer.oversBowled).toFixed(2): "N/A"}
                    </Text>
              
      
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
    marginTop: 40,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  playerImage2: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius:20,
  },
  requestContainer: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 30,
    width: "28%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#ff4c4c",
    padding: 10,
    borderRadius: 30,
    width: "28%",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 67,
    left: 20,
    zIndex: 1, // To make sure the back button stays on top
  },
  statsButton: {
    backgroundColor: "#0066cc",
    padding: 10,
    borderRadius: 30,
    width: "38%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalView: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: "lightgrey",
    fontWeight  : "bold",
    marginBottom: 20,
  },
  modalDetails: {
    color: "#bbb",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    width: "60%",
  },
  emptyMessage: {
    color: "#bbb",
    textAlign: "center",
    marginTop: 20,
  },
});
