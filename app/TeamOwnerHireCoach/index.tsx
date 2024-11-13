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
  arrayUnion,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";
//coach hired, update coach id in team's coach id, add team id in coach assignedTeams array
//when coach changed,update coach id in teams's coach id, remove team id from the assignedTeams array of the previous coach, add team id in the assignedTeams array of the new coach

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
  assigned_teams: string[];
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
      const coachesList = coachSnapshot.docs.map((doc) => {
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
          assigned_teams: data.assigned_teams,
        };
      });

      setCoachList(coachesList as Coach[]); 
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
          setLoading(true);
            const storedTeamOwnerData = await AsyncStorage.getItem("userData");
            if (storedTeamOwnerData) {
            const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
            console.log("Fetched User Data:", parsedTeamOwnerData); // Debugging
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
        } finally{
          setLoading(false);
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
        // Check if team is already assigned to the selected coach
        if (selectedCoach.assigned_teams.includes(teamOwnerData.team_id)) {
          console.log("You are already assigned to this coach.");
          setAlertMessage("You are already assigned to this coach.");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
  
        // Step 1: Find if the team is already assigned to another coach
        const coachCollectionRef = collection(db, "coach");
        const currentCoachQuery = query(coachCollectionRef, where("assigned_teams", "array-contains", teamOwnerData.team_id));
        const currentCoachSnapshot = await getDocs(currentCoachQuery);
  
        if (!currentCoachSnapshot.empty) {
          // Step 2: Remove the team from the previous coach's assigned_teams
          const currentCoachDoc = currentCoachSnapshot.docs[0];
          const currentCoachRef = doc(db, "coach", currentCoachDoc.id);
          const updatedTeams = currentCoachDoc.data().assigned_teams.filter((teamId: string) => teamId !== teamOwnerData.team_id);

  
          await updateDoc(currentCoachRef, { assigned_teams: updatedTeams });
          console.log(`Removed team with ID: ${teamOwnerData.team_id} from previous coach`);
        }
  
        // Step 3: Add the team to the selected coach's assigned_teams
        const Q = query(coachCollectionRef, where("coach_id", "==", selectedCoach.coach_id));
        const snapshot = await getDocs(Q);
        if (!snapshot.empty) {
          const doca = snapshot.docs[0];
          const docRef = doc(db, "coach", doca.id);
          await updateDoc(docRef, { assigned_teams: arrayUnion(teamOwnerData.team_id) });
          
        }
        
  
        // Step 4: Update the team’s coach_id to the new coach’s ID
        const teamCollectionRef = collection(db, "team");
        const teamQuery = query(teamCollectionRef, where("team_id", "==", teamOwnerData.team_id));
        const teamSnapshot = await getDocs(teamQuery);
  
        if (!teamSnapshot.empty) {
          const teamDoc = teamSnapshot.docs[0];
          const teamRef = doc(db, "team", teamDoc.id);
  
          await updateDoc(teamRef, { coach_id: selectedCoach.coach_id });
          console.log(`Updated team with ID: ${teamOwnerData.team_id} to new coach with ID: ${selectedCoach.coach_id}`);
        } else {
          console.error("Team not found");
        }
        await fetchCoaches();
  
        // Success message
        setAlertMessage("Coach assignment successful. Contact your coach.");
        setAlertVisible(true);
        setModalVisible(false);
      } else {
        console.error("Selected coach or Team ID is missing.");
      }
    } catch (error) {
      console.error("Error hiring coach:", error);
    } finally {
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
                    coach.assigned_teams.includes(teamOwnerData.team_id) && {
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