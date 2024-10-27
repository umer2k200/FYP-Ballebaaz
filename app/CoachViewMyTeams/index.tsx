import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Team {
    captain_id: string,
    captain_name: string,
    coach_id: string,
    highest_score: string,
    highlights: [],
    matches_lost: number,
    matches_played: number,
    matches_won: number,
    players: [],
    ranking: "",
    team_id: "",
    team_name: "",
    wl_ratio: "",
}

export default function CoachViewMyTeams() {
  const [assignedTeamsData, setAssignedTeamsData] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const navigation = useNavigation(); // Used to navigate between screens

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          fetchTeamsData(parsedUserData.assigned_teams, true);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchTeamsData = async (teamIds: string[], forceRefresh = false) => {
    const db = getFirestore();
    const teamsArray: Team[] = [];

    try {
      const cachedTeams = await AsyncStorage.getItem("cachedTeamsData");

      if (cachedTeams && !forceRefresh) {
        console.log("Using cached teams data");
        setAssignedTeamsData(JSON.parse(cachedTeams));
        return;
      }

      const teamCollectionRef = collection(db, "team");

      for (let userTeamId of teamIds) {
        const q = query(teamCollectionRef, where("team_id", "==", userTeamId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            teamsArray.push(doc.data() as Team);
        });

        if (querySnapshot.empty) {
          console.log("No such team found for ID:", userTeamId);
        }
      }

      setAssignedTeamsData(teamsArray);
      await AsyncStorage.setItem("cachedTeamsData", JSON.stringify(teamsArray));
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const storedUserData = await AsyncStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      await fetchTeamsData(parsedUserData.assigned_teams, true);
    }
    setRefreshing(false);
  };

  const handleTeamPress = (team: Team) => {
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTeam(null);
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/CoachSettings")}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        </View>
        
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>My Teams</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {assignedTeamsData.map((team, index) => (
          <TouchableOpacity key={index} style={styles.playerCard} onPress={() => handleTeamPress(team)}>
            <View style={styles.playerInfoContainer}>
              <Image
                source={require("@/assets/images/assignedplayer.png")}
                style={styles.playerImage}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{team.team_name}</Text>
                <Text style={styles.roleDetails}>Team ID: {team.team_id}</Text>
                <Text style={styles.drillsDetails}>Captain: {team.captain_name}</Text>
                <TouchableOpacity style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>View Team Highlights</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Player Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedTeam && (
              <>
                <Text style={styles.modalTitle}>{selectedTeam.team_name}</Text>
                <Text style={styles.modalDetails}>ID: {selectedTeam.team_id}</Text>
                <Text style={styles.modalDetails}>Captain: {selectedTeam.captain_name}</Text>
                <Text style={styles.modalDetails}>Matches Played: {selectedTeam.matches_played}</Text>
                <Text style={styles.modalDetails}>Matches Won: {selectedTeam.matches_won}</Text>
                <Text style={styles.modalDetails}>Matches Lost: {selectedTeam.matches_lost}</Text>
                <Text style={styles.modalDetails}>
                  Ranking: {selectedTeam.ranking}
                </Text>
                <Text style={styles.modalDetails}>Highest Score: {selectedTeam.highest_score}</Text>
                <Text style={styles.modalDetails}>W/L Ratio: {selectedTeam.wl_ratio}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Fancy Navbar */}
      {/* <View style={styles.navbar}>
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/group.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachUpcomingTrainingSessions")}
        >
          <Image
            source={require("@/assets/images/upcomingmatches.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachHomePage")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachManage&AssignDrills")}
        >
          <Image
            source={require("@/assets/images/assign.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/CoachSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 55,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 33,
    color: "darkgrey",
    fontWeight: "bold",
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    width: "95%",
    alignSelf: "center",
  },
  playerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
  },
  roleDetails: {
    color: "#aaa",
    fontSize: 14,
  },
  drillsDetails: {
    color: "#aaa",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 15,
  },
  modalDetails: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
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