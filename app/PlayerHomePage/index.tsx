import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
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
  });

  const router = useRouter();

  useEffect(() => {
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);

          

          //problem is here
          if (parsedUserData.requestAccepted) {
            console.log('player_id from useffect1 and reqstatus: ',parsedUserData.player_id, ' + ', parsedUserData.requestAccepted)
            showRequestAcceptedMessage(parsedUserData.player_id);
            
          }
          
        }
        else{
          console.log("No user data found in AsyncStorage.");
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }finally{
      setLoading(false);}
    };

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        console.log("Fetched User Data:", parsedUserData); // Debugging
        setUserData(parsedUserData);

        

        // //problem is here
        // if (parsedUserData.requestAccepted) {
        //   console.log('player_id from useffect1 and reqstatus: ',parsedUserData.player_id, ' + ', parsedUserData.requestAccepted)
        //   showRequestAcceptedMessage(parsedUserData.player_id);
          
        // }
        
      }
      else{
        console.log("No user data found in AsyncStorage.");
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }finally{
    setLoading(false);}
  };

  useEffect(() => {
    // Log whenever userData updates to check if player_id is being set correctly
    if (userData.player_id) {
      console.log("Player ID updated from useffect2:", userData.player_id);
    }
  }, [userData.player_id]);

  const showRequestAcceptedMessage = (player_id:string) => {
    Alert.alert(
      `Request Accepted: ${player_id}`,
      "Go to view my team",
      [
        {
          text: "Okay",
          onPress: () => handleOkayPress(player_id), // Call the function when Okay is pressed
        }
      ]
    );
  };

  const handleOkayPress = async (player_id : string) => {
    // if (!userData.player_id) {
    //   console.log("Player ID is not available yet from handleokay proccess");
    //   return;
    // }
    if(player_id){
      console.log("player_id from handleokay: ",player_id);
    }
    try {
      const pCollectionRef = collection(db,"player");
      const q1 = query(pCollectionRef, where("player_id","==",player_id));
      const q1snapshot = await getDocs(q1);
      if(!q1snapshot.empty){
        const pDoc = q1snapshot.docs[0];
        const pDocId = pDoc.id;
        const pref = doc(db, "player",pDocId);
        await updateDoc(pref, {
          requestAccepted: false,
        });

        const updatedSnapshot = await getDocs(q1);
        const updatedData = updatedSnapshot.docs[0].data();

        const updatedUserData = {
          ...userData, // Spread the existing userData
          ...updatedData, // Spread the updated data from Firestore
        };

        console.log('updatedUserData from if: ', updatedUserData);
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        fetchUserData();

        // Update the local state
        //setUserData(updatedUserData);

        

        

        console.log('req accepted from if');
      }
      else{
        console.log('no doc found from else');
      }
    } catch (error) {
      console.log("Error updating requestAccepted flag:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
        </View>
      ): (<>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <Image
            source={require("@/assets/images/profilepic.png")} // Replace with your profile pic URL
            style={styles.profilePic}
          />
        </View>

        {/* Profile Name */}
        <Text style={styles.profileName}>
          {userData.name}
        </Text>
        {/* Profile Bio */}
        <Text style={styles.profileBio}>
          {userData.player_id} {userData.preferred_hand !== ""? "| " + userData.preferred_hand + " hand" : ""} {userData.role !== ""? "" + userData.role : ""}
        </Text>
        {userData.team_id!==""? (<Text style={styles.profileBio}>
          {"Team ID: " + userData.team_id}
        </Text>):(<></>)}
        
        {/* {<Text style={styles.profileBio}>Pakistan</Text>} */}

        {/* Career Stats Card */}
        <View style={styles.statsCard}>
          {userData.role === ""? (<Text style={styles.statsTitle}>No Career Stats</Text>
          ):userData.role === "Batsman"? (<>
            <Text style={styles.statsTitle}>Career Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Played</Text>
              <Text style={styles.statValue}>
                {userData.matches_played }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Scored</Text>
              <Text style={styles.statValue}>
                {userData.runsScored }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Faced</Text>
              <Text style={styles.statValue}>
                {userData.ballsFaced }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Average</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.noOfTimesOut>0? (userData.runsScored/userData.noOfTimesOut).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.ballsFaced>0? ((userData.runsScored/userData.ballsFaced)*100).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>No of Times Out</Text>
              <Text style={styles.statValue}>
                {userData.noOfTimesOut }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Centuries</Text>
              <Text style={styles.statValue}>
                {userData.centuries }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Half Centuries</Text>
              <Text style={styles.statValue}>
                {userData.halfCenturies }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Fitness Status</Text>
              <Text style={styles.statValue}>
                {userData.fitness_status }
              </Text>
            </View>
          </>):userData.role === "Bowler"? (<>
            <Text style={styles.statsTitle}>Career Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Played</Text>
              <Text style={styles.statValue}>
                {userData.matches_played }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Overs Bowled</Text>
              <Text style={styles.statValue}>
                {userData.oversBowled }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Bowled</Text>
              <Text style={styles.statValue}>
                {userData.ballsBowled }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Conceded</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Wickets Taken</Text>
              <Text style={styles.statValue}>
                {userData.wicketsTaken }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best Bowling</Text>
              <Text style={styles.statValue}>
                {userData.best_bowling!==''? userData.best_bowling : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Bowling Average</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded>-1 && userData.wicketsTaken>0? (userData.runsConceded/userData.wicketsTaken).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Economy Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded> -1 && userData.oversBowled>0? (userData.runsConceded/userData.oversBowled).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Bowling Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.ballsBowled>-1 && userData.wicketsTaken>0? (userData.ballsBowled/userData.wicketsTaken).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Five Wickets</Text>
              <Text style={styles.statValue}>
                {userData.fiveWickets }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Scored</Text>
              <Text style={styles.statValue}>
                {userData.runsScored }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Faced</Text>
              <Text style={styles.statValue}>
                {userData.ballsFaced }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Average</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.noOfTimesOut>0? (userData.runsScored/userData.noOfTimesOut).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.ballsFaced>0? ((userData.runsScored/userData.ballsFaced)*100).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>No of Times Out</Text>
              <Text style={styles.statValue}>
                {userData.noOfTimesOut }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Centuries</Text>
              <Text style={styles.statValue}>
                {userData.centuries }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Half Centuries</Text>
              <Text style={styles.statValue}>
                {userData.halfCenturies }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Fitness Status</Text>
              <Text style={styles.statValue}>
                {userData.fitness_status }
              </Text>
            </View>
          </>):userData.role === "Allrounder"? (<>
            <Text style={styles.statsTitle}>Career Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Played</Text>
              <Text style={styles.statValue}>
                {userData.matches_played }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Scored</Text>
              <Text style={styles.statValue}>
                {userData.runsScored }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Faced</Text>
              <Text style={styles.statValue}>
                {userData.ballsFaced }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Average</Text>
              <Text style={styles.statValue}>
                {(userData.runsScored>-1 && userData.noOfTimesOut>0)? (userData.runsScored/userData.noOfTimesOut).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.ballsFaced>0? ((userData.runsScored/userData.ballsFaced)*100).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>No of Times Out</Text>
              <Text style={styles.statValue}>
                {userData.noOfTimesOut }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Centuries</Text>
              <Text style={styles.statValue}>
                {userData.centuries }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Half Centuries</Text>
              <Text style={styles.statValue}>
                {userData.halfCenturies }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Overs Bowled</Text>
              <Text style={styles.statValue}>
                {userData.oversBowled }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Bowled</Text>
              <Text style={styles.statValue}>
                {userData.ballsBowled }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Conceded</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Wickets Taken</Text>
              <Text style={styles.statValue}>
                {userData.wicketsTaken }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best Bowling</Text>
              <Text style={styles.statValue}>
                {userData.best_bowling!==''? userData.best_bowling : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Bowling Average</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded>-1 && userData.wicketsTaken>0? (userData.runsConceded/userData.wicketsTaken).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Economy Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsConceded> -1 && userData.oversBowled>0? (userData.runsConceded/userData.oversBowled).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Bowling Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.ballsBowled>-1 && userData.wicketsTaken>0? (userData.ballsBowled/userData.wicketsTaken).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Five Wickets</Text>
              <Text style={styles.statValue}>
                {userData.fiveWickets }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Fitness Status</Text>
              <Text style={styles.statValue}>
                {userData.fitness_status }
              </Text>
            </View>
          </>):userData.role === "Wicket Keeper"? (<>
            <Text style={styles.statsTitle}>Career Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Matches Played</Text>
              <Text style={styles.statValue}>
                {userData.matches_played }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Runs Scored</Text>
              <Text style={styles.statValue}>
                {userData.runsScored }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Balls Faced</Text>
              <Text style={styles.statValue}>
                {userData.ballsFaced }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Average</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.noOfTimesOut>0? (userData.runsScored/userData.noOfTimesOut).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Batting Strike Rate</Text>
              <Text style={styles.statValue}>
                {userData.runsScored>-1 && userData.ballsFaced>0? ((userData.runsScored/userData.ballsFaced)*100).toFixed(2) : "N/A" }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>No of Times Out</Text>
              <Text style={styles.statValue}>
                {userData.noOfTimesOut }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Centuries</Text>
              <Text style={styles.statValue}>
                {userData.centuries }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Half Centuries</Text>
              <Text style={styles.statValue}>
                {userData.halfCenturies }
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Fitness Status</Text>
              <Text style={styles.statValue}>
                {userData.fitness_status }
              </Text>
            </View>
          </>):(<></>)}
          
        </View>
      </ScrollView>
      

      {/* Upcoming Matches Button */}
      <TouchableOpacity
        style={styles.matchesButton}
        onPress={() => router.push("/PlayerUpcomingMatches")}
      >
        <Text style={styles.matchesButtonText}>Upcoming Matches</Text>
      </TouchableOpacity>
      </>
    )}

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerDrills")}
        >
          <Image
            source={require("@/assets/images/drills.png")} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerFitness")}
        >
          <Image
            source={require("@/assets/images/fitness.png")} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/home.png")} // Replace with your home icon URL
              style={styles.navIcon}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerCommunity")}
        >
          <Image
            source={require("@/assets/images/group.png")} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerHighlightsPage")}
        >
          <Image
            source={require("@/assets/images/cloud.png")} // Replace with your settings icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")} // Replace with your settings icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background color
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 100,
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20, // Add extra padding to avoid content being hidden behind the navbar
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  profilePicContainer: {
    borderRadius: 75,
    padding: 5,
    borderColor: "#00bfa5", // Teal border for a highlight effect
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Adds shadow for Android
    marginBottom: 20,
    marginTop: 100,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular profile picture
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 16,
    color: "#00bfa5", // Teal color for bio to match the theme
    marginBottom: 20,
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
  matchesButton: {
    backgroundColor: "#005B41", // Blue color for the Attributes button
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginVertical: 15,
  },
  matchesButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
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
    width: 25, // Slightly larger icons
    height: 25,
    tintColor: "#fff", // Light icon color
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
    shadowColor: "#00e676", // Bright shadow effect for the highlight
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#1e1e1e", // Darker border color for contrast
    borderWidth: 5,
  },
});