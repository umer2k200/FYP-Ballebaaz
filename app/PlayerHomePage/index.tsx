import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function ProfileScreen() {
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

  const router = useRouter();
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
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
        {/* {<Text style={styles.profileBio}>Pakistan</Text>} */}

        {/* Career Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Career Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>{userData.age}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={styles.statValue}>
              {userData.matches_played }
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Wickets</Text>
            <Text style={styles.statValue}>
              {userData.wickets_taken }
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Economy</Text>
            <Text style={styles.statValue}>{userData.economy }</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{userData.average }</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Best Bowling</Text>
            <Text style={styles.statValue}>
              {userData.best_bowling }
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Strike Rate</Text>
            <Text style={styles.statValue}>
              {userData.strike_rate }
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>5W</Text>
            <Text style={styles.statValue}>{userData.fiveWickets }</Text>
          </View>
        </View>
      </ScrollView>

      {/* Upcoming Matches Button */}
      <TouchableOpacity
        style={styles.matchesButton}
        onPress={() => router.push("/PlayerUpcomingMatches")}
      >
        <Text style={styles.matchesButtonText}>Upcoming Matches</Text>
      </TouchableOpacity>

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