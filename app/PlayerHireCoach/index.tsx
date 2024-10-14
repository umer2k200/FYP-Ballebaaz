import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { db } from "@/firebaseConfig";
import {
  doc,
  getDocs,
  collection,
  where,
  query,
  updateDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";

interface Coach {
  coach_id: string;
  coach_name: string;
  email: string;
  experience: Number;
  assigned_players: string[];
  password: string;
  phone_no: string;
  team_id: string;
  username: string;
}

export default function HireCoach() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null); 
  const [coachList, setCoachList] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [checkifnocoach, setCheckifnocoach] = useState(false);
  const router = useRouter();

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

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

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const coachCollectionRef = collection(db, "coach"); // Reference to coach collection
      const coachSnapshot = await getDocs(coachCollectionRef); // Fetch all documents in coach collection
      const coachList = coachSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          coach_id: data.coach_id,
          coach_name: data.coach_name,
          email: data.email,
          experience: data.experience,
          assigned_players: data.assigned_players,
          password: data.password,
          phone_no: data.phone_no,
          team_id: data.team_id,
          username: data.username,
        };
      });

      setCoachList(coachList as Coach[]); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coachs:", error);
      setAlertMessage("Error fetching coachs.");
          setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try{
            const storedUserData = await AsyncStorage.getItem("userData");
            if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            console.log("Fetched User Data:", parsedUserData); // Debugging
            setUserData(parsedUserData);
        }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };
    fetchCoaches();
    fetchUserData();
    
  }, []);

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    console.log(coach.assigned_players);
    setModalVisible(true);
  };

  const confirmHire = async () => {
    try {
        setLoading(true);
      if (selectedCoach && userData.player_id) {
        // Check if player is already assigned to the coach
        if (selectedCoach.assigned_players.includes(userData.player_id)) {
          console.log("You are already assigned to this coach.");
          setAlertMessage("You are already assigned to this coach.");
          setAlertVisible(true);
          setLoading(false);
          return;
        }

        //either someone else or no one
        // check if the player is already assigned to another coach or not
        const coachCollectionRef2 = collection(db, "coach"); // Reference to coach collection
        const q2 = query(coachCollectionRef2, where("assigned_players", "array-contains", userData.player_id));
        const querySnapshot2 = await getDocs(q2);
        if (!querySnapshot2.empty) {
            //Player id is already assigned to another coach
            //Remove player id from the assigned_players array of the coach

          const coachDoc2 = querySnapshot2.docs[0];
          const coachDocId2 = coachDoc2.id;
          const coachDocRef2 = doc(db, "coach", coachDocId2);
          const coachData2 = coachDoc2.data();
          const assignedPlayers = coachData2.assigned_players;
          const updatedAssignedPlayers = assignedPlayers.filter((playerId: string) => playerId !== userData.player_id);
          await updateDoc(coachDocRef2, { assigned_players: updatedAssignedPlayers });
          setCoachList((prevCoachList) => 
            prevCoachList.map((coach) =>
              coach.coach_id === coachData2.coach_id
                ? { ...coach, assigned_players: assignedPlayers.filter((playerId: string) => playerId !== userData.player_id) }
                : coach
            )
          );
          console.log(`Removed player with ID: ${userData.player_id} from coach with ID: ${coachData2.coach_id}`);
          setCheckifnocoach(true);
        }
        //player id is not assigned to any coach
        // Assign player to the selected coach
        const coachCollectionRef3 = collection(db, "coach"); // Reference to coach collection
        const q3 = query(coachCollectionRef3, where("coach_id", "==", selectedCoach.coach_id));
        const querySnapshot3 = await getDocs(q3);
        if (!querySnapshot3.empty) {
          const coachDoc3 = querySnapshot3.docs[0];
          const coachDocId3 = coachDoc3.id;
          const coachDocRef3 = doc(db, "coach", coachDocId3);
          const coachData3 = coachDoc3.data();
          const updatedAssignedPlayers3 = [...coachData3.assigned_players, userData.player_id];
          await updateDoc(coachDocRef3, { assigned_players: updatedAssignedPlayers3 });
          setCoachList((prevCoachList) => 
            prevCoachList.map((coach) => 
              coach.coach_id === selectedCoach?.coach_id 
                ? { ...coach, assigned_players: [...coach.assigned_players, userData.player_id] } 
                : coach
            )
          );
          console.log(`Updated assigned players for coach with ID: ${selectedCoach.coach_id}`);
          setModalVisible(false);
          checkifnocoach? setAlertMessage("Coach changed successfully.\nContact your coach") : setAlertMessage("Coach hired successfully.\nContact your coach");
            setAlertVisible(true);
            setCheckifnocoach(false);

        } else {
            console.error("Coach not found");
        }
  
        // Update coach's assigned players by appending the player's ID
        // const coachCollectionRef = collection(db, "coach"); // Reference to coach collection
        // const q = query(coachCollectionRef, where("coach_id", "==", selectedCoach.coach_id));
        // const querySnapshot = await getDocs(q);
  
        // if (!querySnapshot.empty) {
        //   const coachDoc = querySnapshot.docs[0];
        //   const coachDocId = coachDoc.id;
        //   const coachDocRef = doc(db, "coach", coachDocId);
  
        //   // Append player_id to assigned_players array
        //   const updatedAssignedPlayers = [...selectedCoach.assigned_players, userData.player_id];
          
        //   // Update the document in Firestore
        //   await updateDoc(coachDocRef, { assigned_players: updatedAssignedPlayers });
        //   selectedCoach.assigned_players = updatedAssignedPlayers;
        

        //   console.log(Updated assigned players for coach with ID: ${selectedCoach.coach_id});
        //     setAlertMessage("Coach hired successfully.");
        //     setAlertVisible(true);
        //   // Close modal and reset fields after confirmation
        //   setModalVisible(false);
        //   setCoachId("");  // This line is likely not needed now since you are using player_id from userData
        // } else {
        //   console.error("Coach not found");
        // }
      } else {
        console.error("Selected coach or player ID is missing.");
      }
    } catch (error) {
      console.error("Error hiring coach:", error);
    }
    finally{
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/PlayerSettings")}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.pageName}>Hire Coach</Text>
      </View>

        {/* Circles and Labels */}
      <View style={styles.circlesContainer}>
        <View style={styles.circleWithLabel}>
          <View style={[styles.circle, { backgroundColor: "yellow" }]} />
          <Text style={styles.circleLabel}>Your Coach</Text>
        </View>
        <View style={styles.circleWithLabel}>
          <View style={[styles.circle, { backgroundColor: "green" }]} />
          <Text style={styles.circleLabel}>Other Coaches</Text>
        </View>
      </View>

      {loading? (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size='large' color='#005B41' />
        </View>
      ):(
        <>
      <ScrollView style={styles.container}>
        <View style={styles.coachContainer}>
            {coachList.map((coach) => (
                <TouchableOpacity key={coach.coach_id} style={[
                    styles.coachCard,
                    // Highlight your coach with a yellow border
                    coach.assigned_players?.includes(userData.player_id) && {
                      borderColor: "yellow",
                      borderWidth: 2,
                    },
                  ]} 
                  onPress={() => handleSelectCoach(coach)}>
                    
                    <Text style={styles.coachInfo}><Text style={styles.coachName}>{coach.coach_name}</Text></Text>
                    <Text style={styles.coachInfo}>ID: <Text style={styles.coachInfo2}>{coach.coach_id}</Text></Text>
                    <Text style={styles.coachInfo}>Experience: <Text style={styles.coachInfo2}>{coach.experience.toString()}</Text></Text>
                    <Text style={styles.coachInfo}>Phone: <Text style={styles.coachInfo2}>{coach.phone_no}</Text></Text>
                    <Text style={styles.coachInfo}>Email: <Text style={styles.coachInfo2}>{coach.email !== ""? coach.email : "(Email not provided)"}</Text></Text>

                </TouchableOpacity>
            ))}
        </View>

        {/* Hire Coach Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Hire Coach</Text>

              <Text style={styles.modalTitle2}>Coach ID: {selectedCoach?.coach_id}</Text>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmHire}
              >
                <Text style={styles.buttonText}>Confirm Hire</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    padding: 10,
    backgroundColor: "#121212",
  },
  circlesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  circleWithLabel: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  circleLabel: {
    marginTop: 5,
    color: "white",
    fontSize: 12,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 45,
    marginRight: 20,
    marginBottom: 40,
  },
  pageName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "lightgrey",
    textAlign: "center",
    flex: 1,
  },
  coachContainer: {
    marginBottom: 20,
    width: "100%",
  },
  coachCard: {
    backgroundColor: "#005B41",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  coachInfo: {
    color: "white",
    fontSize: 16,
  },
  coachInfo2:{
    color: "lightgrey",
    fontSize: 16,
  },
  coachName: {
    fontSize: 23,
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1e1e1e",
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "lightgrey",
    marginBottom: 25,
    textAlign: "center",
  },
  modalTitle2: {
    fontSize: 16,
    color: "lightgrey",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 20,
    color: "white",
    borderRadius: 10,

  },
  confirmButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    width: "60%",
    marginBottom: 10,
    padding: 10,
  },
  cancelButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
    width: "40%",
    alignSelf: "center",

  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});