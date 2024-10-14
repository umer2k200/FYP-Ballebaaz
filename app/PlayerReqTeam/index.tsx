import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Image, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';  
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from "@/firebaseConfig";
import { doc, getDocs, collection, where, query, updateDoc, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";

interface TeamData{
  captain_id: string;
  captain_name: string;
  coach_id: string;
  highest_score: string;
  highlights: string[];
  matches_lost: string;
  matches_played: string;
  matches_won: string;
  players: string[];
  ranking: string;
  team_id: string;
  team_name: string;
  wl_ratio: string;
}


export default function PlayerRequestTeam() {
  const navigation = useNavigation();  // React Navigation hook for going back
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null); // State to hold the selected team
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [teams, setTeams] = useState<TeamData[]>([]); // State to hold the list of teams
  const [loading, setLoading] = useState(true); // Loading state

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
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchTeams();
    fetchUserData();
  }, []);
  
  const fetchTeams = async () => {
    try {
      setLoading(true); // Start loading
      const teamsCollectionRef = collection(db, "team"); // Reference to the 'teams' collection in Firestore
      const teamsSnapshot = await getDocs(teamsCollectionRef); // Fetch all team documents

      const teamsList = teamsSnapshot.docs.map((doc) => {
        const data = doc.data(); // Get the document data
        return {
          team_id: data.team_id,
          captain_id: data.captain_id,
          captain_name: data.captain_name,
          coach_id: data.coach_id,
          highest_score: data.highest_score,
          highlights: data.highlights,
          matches_lost: data.matches_lost,
          matches_played: data.matches_played,
          matches_won: data.matches_won,
          players: data.players,
          ranking: data.ranking,
          team_name: data.team_name,
          wl_ratio: data.wl_ratio,
        };
      });
      setTeams(teamsList as TeamData[]);
      console.log("Teams fetched:", teamsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams:", error);
      Alert.alert("Error", "An error occurred while fetching teams.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const requestToJoinTeam = (team: TeamData) => {
    setSelectedTeam(team);
    console.log("Selected team:", team.team_id);
    setModalVisible(true);
  };

  const handleRequest = async () => {
    if (!selectedTeam) return; // Ensure there's a selected team
  
    try {
      setLoading(true); // Start loading
      // Reference to the 'playerTeamRequests' collection in Firestore
      const requestsCollectionRef = collection(db, "playerTeamRequests");
  
      // Query to check if a request from the current player to the selected team already exists
      const q = query(
        requestsCollectionRef,
        where("player_id", "==", userData.player_id),
        where("team_id", "==", selectedTeam.team_id)
      );
  
      // Fetch the documents that match the query
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If a document exists, show an alert saying "You have already requested"
        Alert.alert("Request Exists", "You have already requested to join this team.", [
          { text: "OK" }
        ]);
        fetchTeams();
      } else {
        // If no document exists, create a new request
        const requestData = {
          player_id: userData.player_id,
          team_id: selectedTeam.team_id,
          status: "pending", // Default status of the request
        };
  
        // Add the new request to the 'playerTeamRequests' collection
        await addDoc(requestsCollectionRef, requestData);
  
        // Show a success message
        Alert.alert("Request Sent",` Your request to join ${selectedTeam.team_name} has been sent!`, [
          { text: "OK" }
        ]);
        fetchTeams();
      }
  
    } catch (error) {
      console.error("Error handling request:", error);
      Alert.alert("Error", "An error occurred while sending your request.");
    } finally {

      setModalVisible(false); // Close the modal
    }
  };
  


  const renderTeamItem = ({ item }: { item: TeamData }) => (
    <View style={styles.teamContainer}>
      <View style={styles.teamHeader}>
        <View>
          <Text style={styles.teamName}>{item.team_name}</Text>
          <Text style={styles.teamDetails}>Team ID: {item.team_id}</Text>
          <Text style={styles.teamDetails}>Captain: {item.captain_name}</Text>
          <Text style={styles.teamDetails}>Players: {item.players.length}</Text>
          <Text style={styles.teamDetails}>Ranking: {item.ranking}</Text>
          <Text style={styles.teamDetails}>W/L ratio: {item.wl_ratio}</Text>

        </View>
      </View>
      <TouchableOpacity style={styles.requestButton} onPress={() => requestToJoinTeam(item)}>
        <Text style={styles.requestButtonText}>Request to Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Teams</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
        </View>
      ) : (<>
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.team_id}
        />
        

      {/* Modal for Request Confirmation */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedTeam && (
              <>
                <Text style={styles.modalTitle}>Request to Join {selectedTeam.team_name}</Text>
                <Text style={styles.modalDetails}>Are you sure you want to send a request to join {selectedTeam.team_name}?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleRequest}>
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
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
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
  teamContainer: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 30,
    marginBottom: 20,
  },
  teamHeader: {
    flexDirection: "row",  // Align the image and text horizontally
    alignItems: "center",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,  // Add spacing between image and text
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamDetails: {
    color: "#bbb",
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 30,
    marginTop: 15,
    alignItems: "center",
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 67,
    left: 20,
    zIndex: 1,  // To make sure the back button stays on top
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
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    backgroundColor: "#005B41",
    padding: 10,
    paddingHorizontal:20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4c4c",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});