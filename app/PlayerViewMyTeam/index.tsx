import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
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
  updateDoc,
  arrayRemove,
  deleteDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

interface player {
  name: string;
  username: string;
  phone_no: number;
  role: string;
  password: string;
  player_id: string;
  fitness_status: string;
  matches_played: number;
  best_bowling: string;
  highlights: [];
  team_id: string;
  preferred_hand: string;
  bowling_hand: string;
  training_sessions: string;
  assigned_drills: string;
  weight: number;
  height: number;
  age: number;
  email: string;
  fiveWickets: number;
  requestAccepted: boolean,
  runsScored: number,
  ballsFaced: number,
  battingAverage: number,
  battingStrikeRate: number,
  noOfTimesOut: number,
  centuries: number,
  halfCenturies: number,
  oversBowled: number,
  ballsBowled: number,
  runsConceded: number,
  wicketsTaken: number,
  bowlingAverage: number,
  economyRate: number,
  bowlingStrikeRate: number,
  profile_pic: string;
  maidenOvers: number;
}

export default function CoachAssignedPlayers() {
  const router = useRouter();
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
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

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData.team_id) {
      fetchTeamData();
    }
  }, [userData.team_id]);

  const [teamData, setTeamData] = useState({
    captain_id: "",
    captain_name: "",
    coach_id: "",
    highest_score: "",
    highlights: [],
    matches_lost: "",
    matches_played: "",
    matches_won: "",
    players: [],
    ranking: "",
    team_id: "",
    team_name: "",
    wl_ratio: "",
  });

  const fetchTeamData = async () => {
    setLoading(true); // Start loader
    try {
      const teamOwnerTeamId = userData.team_id;

      const teamCollectionRef = collection(db, "team");
      const q = query(
        teamCollectionRef,
        where("team_id", "==", teamOwnerTeamId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teamDoc = querySnapshot.docs[0];
        const teamData2 = teamDoc.data();
        setTeamData(teamData2 as any);

        if (teamData2.players && Array.isArray(teamData2.players)) {
          await fetchPlayerDetails(teamData2.players);
        }
      } else {
        console.log("No team found with this team ID");
      }
    } catch (error) {
      console.error("Error fetching team data: ", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const [bookingsList, setBookingsList] = useState<player[]>([]); // Store fetched booking details here

  const fetchPlayerDetails = async (playerIds: string[]) => {
    const bookingsData: player[] = [];
    for (let i = 0; i < playerIds.length; i++) {
      const bookingCollectionRef = collection(db, "player");
      const q = query(
        bookingCollectionRef,
        where("player_id", "==", playerIds[i])
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        const bookingData = bookingDoc.data();
        const booking: player = {
          player_id: bookingData.player_id,
          name: bookingData.name === userData.name ? "Me" : bookingData.name,
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
          profile_pic: bookingData.profile_pic,
          maidenOvers: bookingData.maidenOvers,
        };
        bookingsData.push(booking);
      }
    }
    setBookingsList(bookingsData);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<player | null>(null);

  const handlePlayerPress = (player: player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const confirmLeaveTeam = () => {
    setLeaveModalVisible(true);
  };

  const deletePlayerTeamRequests = async (player_id: string) => {
    try {
      const playerTeamRequestCollection = collection(db, "playerTeamRequests");
  
      const q = query(playerTeamRequestCollection, where("player_id", "==", player_id));
      
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Loop through each document and delete them one by one
        for (const docSnapshot of querySnapshot.docs) {
          await deleteDoc(doc(db, "playerTeamRequests", docSnapshot.id));
          console.log(`Deleted document with ID: ${docSnapshot.id}`);
        }
      } else {
        console.log("No matching documents found in playerTeamRequest.");
      }
    } catch (error) {
      console.error("Error deleting playerTeamRequest documents: ", error);
    }
  };

  const handleLeaveTeam = async () => {
    // Logic for leaving the team goes here
    try {
      console.log("Leaving team...");
      setLeaveModalVisible(false);
      setLoading(true);

      const playerCollectionRef = collection(db, "player");
      const q = query(
        playerCollectionRef,
        where("player_id", "==", userData.player_id)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const playerDoc = querySnapshot.docs[0];
        const playerDocId = playerDoc.id;
        const playerRef = doc(db, "player", playerDocId);
        await updateDoc(playerRef, {
          team_id: "",
        });
        const teamCollectionRef = collection(db, "team");
        const q2 = query(
          teamCollectionRef,
          where("team_id", "==", userData.team_id)
        );
        const querySnapshot2 = await getDocs(q2);
        if (!querySnapshot2.empty) {
          const teamDoc = querySnapshot2.docs[0];
          const teamDocId = teamDoc.id;
          const teamRef = doc(db, "team", teamDocId);
          await updateDoc(teamRef, {
            players: arrayRemove(userData.player_id),
          });
          await deletePlayerTeamRequests(userData.player_id);
          setUserData({ ...userData, team_id: "" });
          console.log("Successfully left the team.");

          const updatedUserData = {
            ...userData,
            name: userData.name,
            username: userData.username,
            phone_no: userData.phone_no,
            role: userData.role,
            password: userData.password,
            player_id: userData.player_id,
            fitness_status: userData.fitness_status,
            matches_played: userData.matches_played,
            best_bowling: userData.best_bowling,
            highlights: userData.highlights,
            team_id: "",
            preferred_hand: userData.preferred_hand,
            bowling_hand: userData.bowling_hand,
            training_sessions: userData.training_sessions,
            assigned_drills: userData.assigned_drills,
            weight: userData.weight,
            height: userData.height,
            age: userData.age,
            email: userData.email,
            fiveWickets: userData.fiveWickets,
            requestAccepted: false,
            runsScored : userData.runsScored,
            ballsFaced : userData.ballsFaced,
            battingAverage : userData.battingAverage,
            battingStrikeRate : userData.battingStrikeRate,
            noOfTimesOut : userData.noOfTimesOut,
            centuries : userData.centuries,
            halfCenturies : userData.halfCenturies,
            oversBowled : userData.oversBowled,
            ballsBowled : userData.ballsBowled,
            runsConceded : userData.runsConceded,
            wicketsTaken : userData.wicketsTaken,
            bowlingAverage : userData.bowlingAverage,
            economyRate : userData.economyRate,
            bowlingStrikeRate : userData.bowlingStrikeRate,
            profile_pic: userData.profile_pic,
            maidenOvers: userData.maidenOvers,
          };

          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(updatedUserData)
          );


          setLoading(false);
          router.push("/PlayerSettings");
        }
      }
    } catch (error) {
      console.log("end");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/PlayerSettings")}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}

      {/* Show loader while fetching */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* show teamdata */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>{teamData.team_name}</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Captain: </Text>
              <Text style={styles.statValue}>{teamData.captain_name}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Team ID: </Text>
              <Text style={styles.statValue}>{teamData.team_id}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ranking: </Text>
              <Text style={styles.statValue}>{teamData.ranking}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Coach ID : </Text>
              <Text style={styles.statValue}>
                {teamData.coach_id ? teamData.coach_id : "No coach"}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Played: </Text>
              <Text style={styles.statValue}>{teamData.matches_played}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Won: </Text>
              <Text style={styles.statValue}>{teamData.matches_won}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Lost: </Text>
              <Text style={styles.statValue}>{teamData.matches_lost}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Highest Score: </Text>
              <Text style={styles.statValue}>{teamData.highest_score}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>W/L Ratio: </Text>
              <Text style={styles.statValue}>{teamData.wl_ratio}</Text>
            </View>
          </View>
          <Text style={styles.pageName}>Players</Text>
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
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLeaveTeam}
          >
            <Text style={styles.logoutButtonText}>Leave Team</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {/* </ScrollView> */}

      {/* Player Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        
        <View style={styles.modalContainer}>

          <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {selectedPlayer && (
              <>
              <Image
                  source={selectedPlayer.profile_pic ? { uri: selectedPlayer.profile_pic } : require("@/assets/images/assignedplayer.png")}
                  style={styles.playerImage2}
                />
                <Text style={styles.modalTitle}>{selectedPlayer.name}</Text>
                <Text style={styles.modalDetails}>
                  Role: {selectedPlayer.role}
                </Text>
                <Text style={styles.modalDetails}>
                  Matches Played: {selectedPlayer.matches_played}
                </Text>
                <Text style={styles.modalDetails}>
                  Batting Hand: {selectedPlayer.preferred_hand}
                </Text>
                <Text style={styles.modalDetails}>
                  Bowling Hand: {selectedPlayer.bowling_hand}
                </Text>
                <Text style={styles.modalDetails}>
                  Runs Scored: {selectedPlayer.runsScored}
                </Text>
                <Text style={styles.modalDetails}>
                  Batting Average: {selectedPlayer.runsScored>-1 && selectedPlayer.noOfTimesOut>0 ? (selectedPlayer.runsScored/selectedPlayer.noOfTimesOut).toFixed(2) : 0}
                </Text>
                <Text style={styles.modalDetails}>
                  Batting Strike Rate: {selectedPlayer.runsScored>-1 && selectedPlayer.ballsFaced>0 ? (selectedPlayer.runsScored/selectedPlayer.ballsFaced*100).toFixed(2) : 0}
                </Text>
                <Text style={styles.modalDetails}>
                  Wickets Taken: {selectedPlayer.wicketsTaken}
                </Text>
                <Text style={styles.modalDetails}>
                  Bowling Average: {selectedPlayer.runsConceded>-1 && selectedPlayer.wicketsTaken>0 ? (selectedPlayer.runsConceded/selectedPlayer.wicketsTaken).toFixed(2) : 0}
                </Text>
                <Text style={styles.modalDetails}>
                  Economy Rate: {selectedPlayer.runsConceded>-1 && selectedPlayer.oversBowled>0 ? (selectedPlayer.runsConceded/(Math.floor(selectedPlayer.oversBowled) + (selectedPlayer.oversBowled%1)*0.6)).toFixed(2) : 0}
                </Text>
                <Text style={styles.modalDetails}>
                  Bowling Strike Rate: {selectedPlayer.ballsBowled>0 && selectedPlayer.wicketsTaken>0 ? (selectedPlayer.ballsBowled/selectedPlayer.wicketsTaken).toFixed(2) : 0}
                </Text>
                
                  

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal for Leaving Team */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={leaveModalVisible}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Action</Text>
            <Text style={styles.modalDetails}>
              Are you sure you want to leave the team?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleLeaveTeam}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setLeaveModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 20,
  },
  pageName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "lightgrey",
    marginBottom: 20,
    textAlign: "center",
    flex: 1, // Makes sure the page name is centered
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  titleContainer: {
    marginTop: 70,
    marginBottom: 40,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 5,
    margin: 5,
    width: "45%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 33,
    color: "darkgrey",
    fontWeight: "bold",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  statsCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Adds shadow for Android
    marginBottom: 20, // Space between stats and navbar
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 16,
    color: "white",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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
    marginRight: 20, // Add space between the image and the text
    borderRadius:20,
  },
  playerImage2: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius:20,
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
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    marginTop: 20,
    paddingHorizontal: 70,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
