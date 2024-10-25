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
  team_id: string | null;
  username: string;
  profile_pic: string;
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
  });

  const [teamOwnerData,setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id:"",
    username:  "",
    password: "",
  })

  const[teamData,setTeamData]=useState({
    captain_id: '',
  captain_name: '',
  coach_id: '',
  highest_score: 0,
  highlights: '',
  matches_lost: 0,
  matches_played: 0,
  matches_won: 0,
  players: [],
  ranking: '',
  team_id: '',
  team_name: '',
  wl_ratio: '',
})

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
          profile_pic: data.profile_pic,
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
            const storedTeamOwnerData = await AsyncStorage.getItem("userData");
            if (storedTeamOwnerData) {
            const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
            console.log("Fetched User Data:", parsedTeamOwnerData); // Debugging
            setUserData(parsedTeamOwnerData);
            console.log("Parsed Team Owner Id",parsedTeamOwnerData.team_id);
            setTeamOwnerData(parsedTeamOwnerData);
            console.log("Daaata",teamOwnerData);

            const teamOwnerTeamId=parsedTeamOwnerData.team_id;

            console.log("TeamoOwnerTeamId",teamOwnerTeamId);

            // Step 2: Query the "team" collection for the document with this team_id
           const teamCollectionRef = collection(db, "team");

           const q = query(teamCollectionRef, where("team_id", "==", teamOwnerTeamId));
           const querySnapshot = await getDocs(q);

           
           if (!querySnapshot.empty) {
            // Assuming there's only one matching document
            const TeamDoc = querySnapshot.docs[0];
            const TeamDocId = TeamDoc.id;
            const TeamData2 = TeamDoc.data(); // Explicitly cast the data to TeamData type
    
            // Step 3: Use teamData for rendering or updating state
            console.log("Fetched TeamOwner Team Data:", TeamData2);

            setTeamData(TeamData2 as any);

            console.log("Fetched TeamOwner Team Data from set:", teamData);
           }

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
      if (selectedCoach && teamOwnerData.team_id) {
        // Check if team is already assigned to the coach
        if (selectedCoach.team_id===teamOwnerData.team_id){
          console.log("You are already assigned to this coach.");
          setAlertMessage("You are already assigned to this coach.");
          setAlertVisible(true);
          setLoading(false);
          return;
        }

        //either someone else or no one
        // check if the team is already assigned to another coach or not
        const coachCollectionRef2 = collection(db, "coach"); // Reference to coach collection
        const q2 = query(coachCollectionRef2, where("team_id", "==", teamOwnerData.team_id));
        const querySnapshot2 = await getDocs(q2);

        // Fetching data from team collection
        const teamCollectionRef2 = collection(db, "team"); // Reference to coach collection
        const q4 = query(teamCollectionRef2, where("team_id", "==", teamData.team_id));
        const querySnapshot4 = await getDocs(q4);

        
        if (!querySnapshot2.empty && !querySnapshot4.empty) {
            //Team id is already assigned to another coach
            //Remove team id from the assigned_players array of the coach

          const coachDoc2 = querySnapshot2.docs[0];
          const coachDocId2 = coachDoc2.id;
          const coachDocRef2 = doc(db, "coach", coachDocId2);
          const coachData2 = coachDoc2.data();

          const TeamDoc2 = querySnapshot4.docs[0];
          const TeamDocId2 = TeamDoc2.id;
          const TeamDocRef2 = doc(db, "team", TeamDocId2);
          const TeamData2 = TeamDoc2.data();

         

          console.log("Abhi likha",TeamData2);
          
          const assignedTeam=coachData2.team_id;

          const TeamName=TeamData2.team_name;
          
           const updatedAssignedTeam = assignedTeam === teamOwnerData.team_id ? null : assignedTeam;

          if (assignedTeam === teamOwnerData.team_id) {
            // Remove the team from the previous coach
            await updateDoc(coachDocRef2, { team_id: updatedAssignedTeam }); // Update team_id to null if no teams left
        
            // Set the coach list state as needed

            // const teamDocRef = doc(db, "team", teamOwnerData.team_id);
             await updateDoc(TeamDocRef2, { coach_id: selectedCoach.coach_id });

            setCoachList((prevCoach) =>
              prevCoach.map((coach) =>
                  coach.coach_id === coachData2.coach_id
                      ? { ...coach, team_id: "" } // Clear the team_id for the previous coach
                      : coach,
                      
              )
          );
          }

          console.log(`Removed team with ID: ${teamOwnerData.team_id} from coach with ID: ${coachData2.coach_id}`);
          setCheckifnocoach(true);
        }

        //team id is not assigned to any coach
        // team player to the selected coach

        const coachCollectionRef3 = collection(db, "coach"); // Reference to coach collection
        const q3 = query(coachCollectionRef3, where("coach_id", "==", selectedCoach.coach_id));
        const querySnapshot3 = await getDocs(q3);

        // Fetching data from team collection
        const teamCollectionRef3 = collection(db, "team"); // Reference to coach collection
        const q5 = query(teamCollectionRef3, where("team_id", "==", teamData.team_id));
        const querySnapshot5 = await getDocs(q5);

        if (!querySnapshot3.empty  && !querySnapshot5.empty) {
          const coachDoc3 = querySnapshot3.docs[0];
          const coachDocId3 = coachDoc3.id;
          const coachDocRef3 = doc(db, "coach", coachDocId3);
          const coachData3 = coachDoc3.data();

          const TeamDoc3 = querySnapshot4.docs[0];
          const TeamDocId3 = TeamDoc3.id;
          const TeamDocRef3 = doc(db, "team", TeamDocId3);
          const TeamData3 = TeamDoc3.data();
        
          const updatedTeamId=teamOwnerData.team_id;

          await updateDoc(coachDocRef3, { team_id: updatedTeamId });

          // const teamDocRef = doc(db, "team", teamOwnerData.team_id);
             await updateDoc(TeamDocRef3, { coach_id: selectedCoach.coach_id });
          
          setCoachList((prevCoach) => ({
            ...prevCoach,
            team_id: teamOwnerData.team_id // Replace with the new team ID you want to assign
            
          }));

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
        <TouchableOpacity onPress={() => router.push("/TeamOwnerSettings")}>
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
            { Array.isArray(coachList) &&  coachList.map((coach) => (
                <TouchableOpacity key={coach.coach_id} style={[
                    styles.coachCard,
                    // Highlight your coach with a yellow border
                    coach.team_id===teamOwnerData.team_id && {
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