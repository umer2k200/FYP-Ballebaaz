import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { View,Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Alert,} from "react-native";

import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

// Define the Player type
type Player = {
  name: string;
  Ratings: string;
  expertise: string;
  experience: string;
};

export default function CoachAssignedPlayers() {
  const router = useRouter();
  const navigation = useNavigation();

  const assignedPlayers: Player[] = [
    {
      name: "Gary Kirsten",
      Ratings: '4.5/5',
      expertise: 'Power Hitting',
      experience: '2 Years',
    },
    {
      name: "Yonus Khan",
      Ratings: '4.2/5',
      expertise: 'Batting',
      experience: '1.5 Years',
    },
    {
      name: "Waqar Younis",
      Ratings: '3.7/5',
      expertise: 'Fast Bowling',
      experience: '2 Years',
    },
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  const handleRequestSubmit = () => {
    Alert.alert("Request Submitted", "Your request has been successfully submitted.");
    closeModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Available Coaches</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {assignedPlayers.map((player, index) => (
          <TouchableOpacity
            key={index}
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
                <Text style={styles.RatingsDetails}>Ratings: {player.Ratings}</Text>
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
            {selectedPlayer && (
              <>
                <Text style={styles.modalTitle}>{selectedPlayer.name}</Text>
                <Text style={styles.modalDetails}>Ratings: {selectedPlayer.Ratings}</Text>
                <Text style={styles.modalDetails}>Expertise: {selectedPlayer.expertise}</Text>
                <Text style={styles.modalDetails}>Experience: {selectedPlayer.experience}</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleRequestSubmit} // Call the alert when button is pressed
                >
                  <Text style={styles.closeButtonText}>Request</Text>
                </TouchableOpacity>
              </>
            )}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 50,
  },
  pageName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
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
    flexDirection: "row",
    alignItems: "center",
  },
  playerImage: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    color: "#fff",
    fontSize: 18,
  },
  RatingsDetails: {
    color: "#ccc",
    fontSize: 12,
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
});

