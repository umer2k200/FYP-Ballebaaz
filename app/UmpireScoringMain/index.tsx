import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface Match{
  match_id: string;
  team1: string;
  team2: string;
  dateTime: string;
  ground_id: string;
  result: string;
  umpire_id: string;
}


export default function MatchDetails() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matchesData, setMatchesData] = useState<Match[]>([]);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password:"",
    phone_no: 0,
    email:"",
    umpire_id:"",
    experience:"",
    matches_officiated:[] as string[],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
          // if(parsedUserData.matches_officiated.length > 0){
          //   await fetchMatches(userData.matches_officiated);
          // }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } 
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData.matches_officiated.length > 0) {
      fetchMatches(userData.matches_officiated);
    }
  }, [userData.matches_officiated]);

  const fetchMatches = async (matches_officiated: string[]) => {
    
    try {
      setLoading(true);
        const matchData: Match[] = [];
        const matchesColllectionRef = collection(db, "match");

        for (const matchId of matches_officiated) {
            const q = query(matchesColllectionRef, where("match_id", "==", matchId),where("result","==","pending"));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                const MData = doc.data();
                const match: Match = {
                    match_id: MData.match_id,
                    team1: MData.team1,
                    team2: MData.team2,
                    dateTime: MData.dateTime,
                    ground_id: MData.ground_id,
                    result: MData.result,
                    umpire_id: MData.umpire_id,
                };
                matchData.push(match);
            });
        }

        setMatchesData(matchData);
        console.log("Matches Data:", matchData);
    } catch (error) {
        console.log("Error fetching matches:", error);
    } finally {
        setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Upcoming Matches</Text>
      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
      </View>
      ):(<>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {matchesData.map((match) => (
          <View key={match.match_id} style={styles.matchCard}>
            <View style={styles.matchInfoContainer}>
              
              <View style={styles.matchDetails}>
                <Text style={styles.matchTitle}>
                  {match.team1} vs {match.team2}
                </Text>
                <Text style={styles.matchInfo}>Match ID: {match.match_id}</Text>
                <Text style={styles.matchInfo}>Date Time: {match.dateTime}</Text>
                <Text style={styles.matchInfo}>Location: {match.ground_id}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.startMatchButton} onPress={() => router.push({
    pathname: "/UmpireScoringBackup",
    params: { matchId: match.match_id, Team1: match.team1, Team2:match.team2 } // Pass match ID as a parameter
  })} >
              <Text style={styles.buttonText}>Start Match</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      </>)}
      {/* Bottom Navigation */}
      <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/UmpireHome")}
      >
        <Image
          source={require("@/assets/images/home.png")}
          style={styles.navIcon}
        />
      </TouchableOpacity>

      <View style={styles.navItem}>
        <View style={styles.highlight}>
          <Image
            source={require("@/assets/images/cric.png")}
            style={styles.navIcon}
          />
        </View>
      </View>

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
</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "lightgray",
    textAlign: "center",
    marginBottom: 30,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    marginBottom: 25,
    padding: 18,
    width: "95%",
    alignSelf: "center",
  },
  matchInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchImage: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  matchDetails: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  matchTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  matchInfo: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 4,
  },
  startMatchButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
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
    paddingLeft:0,
    padding: 5,
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
    borderWidth: 5,
  },
});