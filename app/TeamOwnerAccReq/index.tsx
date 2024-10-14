import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert,ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native'; // For navigation back
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icons for aesthetics
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
    phone_no: number;
    role: string;
    password: string;
    player_id: string;
    strike_rate: number;
    fitness_status: string;
    matches_played: number;
    best_bowling: string;
    economy: number;
    highlights: any[];
    team_id: string;
    preferred_hand: string;
    bowling_hand: string;
    average: number;
    training_sessions: any[];
    assigned_drills: string;
    wickets_taken: number;
    weight: number;
    height: number;
    age: number;
    email: string;
    fiveWickets: number;
}

export default function CaptainRequestScreen() {
    const navigation = useNavigation();
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null); // Track selected player for viewing stats
    const [modalVisible, setModalVisible] = useState(false); // Control modal visibility
    const [username, setUsername] = useState("");
    const [teamId, setTeamId] = useState("");
    const [playerData, setPlayersData] = useState<Player | null>(null);
    const [requestsData, setRequestsData] = useState<Player[]>([]);
    const [loading,setLoading] = useState(false)

    
    const [userData, setUserData] = useState({
   
        username: "",
        phone_no: 0,
        email: "",
        team_id: "",
    });
    const [playersData, setPlayerData] = useState<Player>({
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
                    setUserData(parsedUserData);
                    setUsername(parsedUserData.username);
                    setTeamId(parsedUserData.team_id);
                }
            } catch (error) {
                console.log("Error fetching user data:", error);
            }
        };
        fetchUserData();
        fetchPlayerTeamRequests();
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
            const q = query(teamCollectionRef, where("team_id", "==", teamOwnerTeamId),where("status","==","pending"));
            const querySnapshot = await getDocs(q);

            const requests: Player[] = []; // Create an array to hold requests

            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    const teamData = doc.data() as any;
                    const playerId = teamData.player_id;

                    if (playerId) {
                        // Query the 'players' collection to find the document with this player_id
                        const playerCollectionRef = collection(db, "player");
                        const playerQuery = query(playerCollectionRef, where("player_id", "==", playerId));
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
                console.log("No team found with this team ID");
            }
        } else {
            console.log("Team owner data not found in AsyncStorage");
        }
    } catch (error) {
        console.error("Error fetching team data: ", error);
    }finally{
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
              console.log(`Request status updated to '${newStatus}' for player ID: ${playerId} and team ID: ${teamOwnerTeamId}`);
          } else {
              console.log("No request found for this player ID and team ID.");
          }
      } else {
          console.log("Team owner data not found in AsyncStorage");
      }
  } catch (error) {
      console.error("Error updating request status: ", error);
  }
  finally{
    setLoading(false);
  }
};

// Handle request acceptance
const acceptRequest = async (player: Player) => {
  await updateRequestStatus(player.player_id, "accepted"); // Update status to accepted
  Alert.alert("Request Accepted", `You have accepted the request from ${player.name}.`);
  fetchPlayerTeamRequests();
};

// Handle request rejection
const rejectRequest = async (player: Player) => {
  await updateRequestStatus(player.player_id, "rejected"); // Update status to rejected
  Alert.alert("Request Rejected", `You have rejected the request from ${player.name}.`);
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
                <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRequest(item)}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => rejectRequest(item)}>
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statsButton} onPress={() => viewPlayerStats(item)}>
                    <Text style={styles.buttonText}>View Stats</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Player Requests</Text>
            {loading ? (
              <View>
                <ActivityIndicator size="large" color='#005B41'/>
              </View>
            ): (
              <>
            <FlatList
                data={requestsData} // Replace this with requests data
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.player_id}
                ListEmptyComponent={<Text style={styles.emptyMessage}>No requests available.</Text>}
            />

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
                                <Text style={styles.modalTitle}>Player Stats:</Text>
                                <Text style={styles.modalDetails}>Matches: {selectedPlayer.matches_played}</Text>
                                <Text style={styles.modalDetails}>Strike Rate: {selectedPlayer.strike_rate}</Text>
                                <Text style={styles.modalDetails}>Wickets: {selectedPlayer.wickets_taken}</Text>
                                <Text style={styles.modalDetails}>Bowling Economy: {selectedPlayer.economy}</Text>
                                <Text style={styles.modalDetails}>Batting Avg: {selectedPlayer.average}</Text>
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
        marginTop:40,
    },
    loaderContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
      justifyContent: 'center',
      alignItems: 'center',
      zIndex:1000,
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
        position: 'absolute',
        top: 67,
        left: 20,
        zIndex: 1,  // To make sure the back button stays on top
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
        color: "#fff",
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
