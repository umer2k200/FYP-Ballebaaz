import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState,useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc, getDocs, query, where, collection ,getDoc} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import CustomAlert from "@/components/CustomAlert";

// Define the Match type
type match = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  participants: string;
  paymentType: string;
  organizer: string;
};

type Match={
  dateTime: string;
  ground_id: string;
  highlights:[],
  match_id: string;
  result: string;
  team1: string;
  team2: string;
  umpire_id: string;
  ground_id2: string;
  team1_id: string;
  team2_id: string;
};

interface TeamData {
  captain_id: string;
  captain_name: string;
  coach_id: string;
  highest_score: number;
  highlights: string;
  matches_lost: number;
  matches_played: number;
  matches_won: number;
  players: string;
  ranking: string;
  team_id: string;
  team_name: string;
  wl_ratio: number;
}

const UmpireScreen = () => {
  
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [username, setUsername] = useState('Aleem Daar');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState("");
  const [groundID, setGroundID] = useState("");
  const [team1ID, setTeam1ID] = useState("");
  const [team2ID, setTeam2ID] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [matchData, setMatchData] = useState<Match[]>([]);
  const [teamData, setteamData] = useState<TeamData[]>([]);

 
  const handleViewAllPress = () => {
    router.push('/UmpireUpcomingMatches');
  };
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password:"",
    phone_no: 0,
    email:"",
    umpire_id:"",
    experience:"",
    matches_officiated:[],
  });

  useEffect(() => {
    console.log("Ground ID:", groundID); // Debugging
  }, [groundID]);

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

  
     fetchMatchData();
    

  }, []);

  const fetchMatchData = async () => {
    setLoading(true); // Start loading
    try {
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        const userUmpireId = parsedUserData.umpire_id;
  
        const matchCollectionRef = collection(db, "match");
        const q = query(matchCollectionRef, where("umpire_id", "==", userUmpireId));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const matchArray = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const Usdata = doc.data();
              const t1D = await getTeamDetails(Usdata.team1);
              const t2D = await getTeamDetails(Usdata.team2);
              const grounds = await getGroundDetails(Usdata.ground_id);
              
  
              return {
                dateTime: Usdata.dateTime,
                ground_id: grounds,
                highlights: Usdata.highlights || [],
                match_id: Usdata.match_id,
                result: Usdata.result,
                team1: t1D,
                team2: t2D,
                umpire_id: Usdata.umpire_id,
                ground_id2: Usdata.ground_id,
                team1_id: Usdata.team1,
                team2_id: Usdata.team2,
              };
            })
          );
  
          setMatchData(matchArray); // Set the fetched matches
        } else {
          setAlertMessage("No matches found.");
          setAlertVisible(true);
        }
      } else {
        setAlertMessage("User data not found");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error fetching match data: ", error);
      setAlertMessage("Update failed");
      setAlertVisible(true);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  
    
  const getTeamDetails = async (team_id: string) => {
    try {
      const teamCollectionRef = collection(db, "team");
      const q = query(teamCollectionRef, where("team_id", "==", team_id));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const teamDoc = querySnapshot.docs[0];
        const teamData = teamDoc.data();
        return teamData.team_name;
      } else {
        setAlertMessage("Team not found in Firestore.");
        setAlertVisible(true);
        return "";
      }
    } catch (error) {
      console.error("Error fetching team details: ", error);
      setAlertMessage("Failed to fetch team details");
      setAlertVisible(true);
      return "";
    }
  };

  const getGroundDetails = async (ground_id: string) => {
    try {
      const teamCollectionRef = collection(db, "ground");
      const q = query(teamCollectionRef, where("ground_id", "==", ground_id));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const teamDoc = querySnapshot.docs[0];
        const teamData = teamDoc.data();
        return teamData.name;
      } else {
        setAlertMessage("Ground not found in Firestore.");
        setAlertVisible(true);
        return "";
      }
    } catch (error) {
      console.error("Error fetching team details: ", error);
      setAlertMessage("Failed to fetch team details");
      setAlertVisible(true);
      return "";
    }
  };
  

    const handleAlertConfirm = () => {
      setAlertVisible(false);
    };


const renderMatchItem = ({ item }: { item: Match }) => {
  if (!item) return null;

  return (
    <TouchableOpacity onPress={() => router.push({ pathname:'/MatchDetails', params: { matchData: JSON.stringify(item) } })} style={styles.matchContainer}>
      <View style={styles.matchDetails}>
        <Text style={styles.matchTitle}>{item.team1} vs {item.team2}</Text>
        <Text style={styles.matchInfo}>Date: {item.dateTime}</Text>
        <Text style={styles.matchInfo}>Location: Ground {item.ground_id}</Text>
      </View>
    </TouchableOpacity>
  );
};


if (loading) {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#005B41" />
      <Text style={styles.logo}>Loading Matches...</Text>
    </View>
  );
}

return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" />
   
   {/* Header */}
   <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          Welcome, <Text style={styles.coachText}>Umpire!</Text>
        </Text>
      </View>

{/* Upcoming Matches */}
       <Text style={styles.upcomingMatchesTitle}>Upcoming Matches</Text>

    
    <FlatList
  data={matchData}
  renderItem={renderMatchItem}
  keyExtractor={(item) => item.match_id}
  ListEmptyComponent={<Text style={styles.noMatchesText}>No matches available.</Text>}
  onEndReachedThreshold={0.5} // To handle large datasets if needed
/>
 

       {/* Bottom Navigation */}
       <View style={styles.navbar}>


       <View style={styles.navItem}>
           <View style={styles.highlight}>
             <Image
              source={require("@/assets/images/home.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/UmpireScoringMain')}
        >
          <Image
            source={require("@/assets/images/cric.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/UmpireSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>


  </SafeAreaView>
);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    marginTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 33,
    color: 'darkgrey', // General text color (white or any color)
    fontWeight: 'bold',
  },
  coachText: {
    color: '#005B41', // Green color for 'Coach'
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconSpacing: {
    marginHorizontal: 16,
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  searchLabel: {
    color: 'white',
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  matchContainer: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  matchDetails: {
    marginBottom: 10,
    color:'white',
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'white',
  },
  matchInfo: {
    fontSize: 14,
    color: 'lightgrey',
  },
  noMatchesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  selectDateText: {
    color: 'white',
    marginLeft: 8,
  },
  clearFilter: {
    color: '#f00',
    fontSize: 14,
  },
  upcomingMatchesTitle: {
    color: 'lightgrey',
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 69,
    marginTop:30,


    marginBottom:20,
  },
  viewAll: {
    color: '#005B41',
    fontSize: 14,
    marginRight: 16,
    alignSelf: 'flex-end',
  },
  matchList: {
    marginVertical: 16,
    paddingLeft: 16,
  },
  matchCard: {
    backgroundColor: '#111',
    padding: 16,
    marginRight: 16,
    borderRadius: 8,
    width: 300,
    height: 220,
    borderWidth: 0.3,
    borderColor: '#fff',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
 
  matchOrganizer: {
    color: 'grey',
    fontSize: 14,
  },
  matchParticipants: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchDate: {
    color: 'white',
    marginTop: 8,
  },
  matchLocation: {
    color: 'grey',
  },
  matchPrice: {
    color: 'white',
    marginTop: 8,
  },
  paymentType: {
    color: 'green',
    fontSize: 12,
  },
  newsButton: {
    backgroundColor: '#005B41',
    padding: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 250, // Adjusted to move the button up from the bottom
    left: '50%',
    transform: [{ translateX: -100 }], // Centers the button
    width: 200, // Adjust the width if needed
  },
  newsText: {
    color: 'white',
    fontWeight: 'semibold',
    textAlign: 'center',
    fontSize: 18,
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

export default UmpireScreen;
