import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  SafeAreaView, 
  ActivityIndicator,
  FlatList,
  Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig'

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

interface Player{
    name: string;
    username: string;
    phone_no: string;
    role: string;
    password: string;
    player_id: string; 
    fitness_status: string;
    matches_played: number;
    best_bowling: string;
    highlights: string[];
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
    requestAccepted: false,
    runsScored : number;
    ballsFaced : number;
    battingAverage : number;
    battingStrikeRate : number;
    noOfTimesOut : number;
    centuries : number;
    halfCenturies : number;
    oversBowled : number;
    ballsBowled : number;
    runsConceded : number;
    wicketsTaken : number;
    bowlingAverage : number;
    economyRate : number;
    bowlingStrikeRate : number;
    profile_pic:string;
    maidenOvers: number;
}

export default function UpcomingMatchesScreen() {
  const router = useRouter();
  const [groundID, setGroundID] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<Match[]>([]);
  const [teamExists, setTeamExists] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [userData,setUserData] = useState<Player>();
  const [teamOwnerData,setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id:"",
    username:  "",
    password: "",
  });

  useEffect(() => {
    const fetchTeamOwnerData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("FetchedTeam Owner Data:", parsedUserData); // Debugging
          setTeamOwnerData(parsedUserData);
          console.log("Team Owner Data:", teamOwnerData); // Debugging
          //await fetchTeamData();
          if (parsedUserData.team_id === '') {
            setTeamExists(false);
            console.log("Team does not exist");
          }
          //await fetchUserData();
          // else{
          //   console.log("Team exists");
          //   await fetchTeamData();
          // }
          
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchTeamOwnerData();
  }, []);
  useEffect(() => {
    console.log("Updated Team Owner Data (getting userdata):", teamOwnerData); // Debugging
    fetchUserData();
  }, [teamOwnerData]);

  // useEffect(() => {
  //   if(teamOwnerData.player_id){
  //     fetchUserData();
  //   }
  // }, [teamOwnerData.player_id])

    const fetchUserData = async () => {
      try {
        setLoading(true); // Start loading
        console.log("Player ID:", teamOwnerData.player_id);
        const playerID = teamOwnerData.player_id;
        const playerCollectionRef = collection(db, "player");
        const q = query(playerCollectionRef, where("player_id", "==", playerID));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const playerDoc = querySnapshot.docs[0];
          const playerData = playerDoc.data();
          console.log("Player Data:", playerData); // Debugging
          setUserData(playerData as Player);
          console.log("Player Data:", userData); // Debugging
        } else {
          console.log("Player not found in Firestore.");
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false); // Stop loading
      }
    };

    useEffect(() => {
      if(teamOwnerData.team_id !== ''){
        fetchMatchData();
      }
    }
    , [userData]);

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1, // Fade in
            duration: 1000, // Duration of the fade-in
            useNativeDriver: true, // Use native driver for better performance
          }),
          Animated.timing(fadeAnim, {
            toValue: 0, // Fade out
            duration: 1000, // Duration of the fade-out
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [fadeAnim]);

const fetchMatchData = async () => {
  setLoading(true); // Start loading
  try {
    const teamID = teamOwnerData.team_id;
    const matchCollectionRef = collection(db, "match");
    const q1 = query(matchCollectionRef, where("team1", "==", teamID),where("result", "==", "pending"));
    const q2 = query(matchCollectionRef, where("team2", "==", teamID),where("result", "==", "pending"));
    const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    //const matches: Match[] = [];
    // if(!querySnapshot1.empty){
    //   const matchArray1 = await Promise.all(
    //     querySnapshot1.docs.map(async (doc) => {
    //       const Usdata = doc.data();
    //       const t1D = await getTeamDetails(Usdata.team1);
    //       const t2D = await getTeamDetails(Usdata.team2);
    //       const grounds = await getGroundDetails(Usdata.ground_id);
          
    //       return {
    //         dateTime: Usdata.dateTime,
    //         ground_id: grounds,
    //         highlights: Usdata.highlights || [],
    //         match_id: Usdata.match_id,
    //         result: Usdata.result,
    //         team1: t1D,
    //         team2: t2D,
    //         umpire_id: Usdata.umpire_id,
    //         ground_id2: Usdata.ground_id,
    //         team1_id: Usdata.team1,
    //         team2_id: Usdata.team2,
    //       };
    //     })
    //   );
    //   setMatchData(matchArray1); // Set the fetched matches
    // }
    // if(!querySnapshot2.empty){
    //   const matchArray2 = await Promise.all(
    //     querySnapshot2.docs.map(async (doc) => {
    //       const Usdata = doc.data();
    //       const t1D = await getTeamDetails(Usdata.team1);
    //       const t2D = await getTeamDetails(Usdata.team2);
    //       const grounds = await getGroundDetails(Usdata.ground_id);
          
    //       return {
    //         dateTime: Usdata.dateTime,
    //         ground_id: grounds,
    //         highlights: Usdata.highlights || [],
    //         match_id: Usdata.match_id,
    //         result: Usdata.result,
    //         team1: t1D,
    //         team2: t2D,
    //         umpire_id: Usdata.umpire_id,
    //         ground_id2: Usdata.ground_id,
    //         team1_id: Usdata.team1,
    //         team2_id: Usdata.team2,
    //       };
    //     })
    //   );
    //   setMatchData([...matchData, ...matchArray2]); // Set the fetched matches
    // }

    const matchArray1 = await Promise.all(
      querySnapshot1.docs.map(async (doc) => {
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

    // Process querySnapshot2
    const matchArray2 = await Promise.all(
      querySnapshot2.docs.map(async (doc) => {
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

    const combinedMatches = [...matchArray1, ...matchArray2];
    setMatchData(combinedMatches);

    // querySnapshot1.forEach((doc) => {
    //   matches.push(doc.data() as Match);
    // });
    // querySnapshot2.forEach((doc) => {
    //   matches.push(doc.data() as Match);
    // });
    // console.log("Fetched Matches:", matches);
    // setMatchData(matches);
  } catch (error) {
    console.error("Error fetching match data: ", error);
  }
  finally {
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
        // setAlertMessage("Team not found in Firestore.");
        // setAlertVisible(true);
        return "";
      }
    } catch (error) {
      console.error("Error fetching team details: ", error);
      // setAlertMessage("Failed to fetch team details");
      // setAlertVisible(true);
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
        // setAlertMessage("Ground not found in Firestore.");
        // setAlertVisible(true);
        return "";
      }
    } catch (error) {
      console.error("Error fetching team details: ", error);
      // setAlertMessage("Failed to fetch team details");
      // setAlertVisible(true);
      return "";
    }
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    if (!item) return null;
  
    return (
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/MatchDetails', params: { matchData: JSON.stringify(item) } })} 
        style={styles.matchContainer}
      >
        <Animated.View 
          style={[
            styles.matchCard, 
            {
              borderColor: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#1e1e1e', '#005B41'], // Change colors as needed
              }),
              shadowOpacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7], // Adjust shadow opacity
              }),
            }
          ]}
        >
          <View style={styles.matchDetails}>
            <Text style={styles.matchTitle}>{item.team1} vs {item.team2}</Text>
            <Text style={styles.matchInfo}>Date: {item.dateTime}</Text>
            <Text style={styles.matchInfo}>Location: Ground {item.ground_id}</Text>
          </View>
        </Animated.View>
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/TeamOwnerHomeScreen')}>
            <Image source={require('@/assets/images/back.png')} style={styles.navIcon} />
          </TouchableOpacity>
    
          <Text style={styles.title}>Upcoming Matches</Text>
    
          <FlatList
            data={matchData}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.match_id}
            ListEmptyComponent={<Text style={styles.noMatchesText}>No matches available.</Text>}
            onEndReachedThreshold={0.5} // To handle large datasets if needed
          />
    
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logo: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
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
  matchCard: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2, // Add border width
    shadowColor: '#005B41', // Shadow color
    shadowOffset: { width: 0, height: 2 },
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 15,
  },

  matchDetail: {
    fontSize: 16,
    color: '#bbb',  // Softer color for the detail text
    marginBottom: 5,
  },
  backButton: {
    position: 'absolute',
    left: 1,
    padding: 10,
    marginTop: 15,
  },
  navIcon: {
    width: 25, // Icon size
    height: 25,
    tintColor: '#fff', // Light icon color
  },
});
