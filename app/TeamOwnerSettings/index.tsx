import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db, storage } from "@/firebaseConfig"; // Ensure your firebaseConfig is correctly set up
import CustomAlert from "@/components/CustomAlert";

export default function TeamOwnerSettingsScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [teamExists, setTeamExists] = useState(false);

  const [userData, setUserData] = useState({
    username: "",
    phone_no: 0,
    email: "",
    team_id: "",
  });

  const [teamName, setTeamName] = useState("");
  const [profile_pic, setProfilePic] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          if (parsedUserData.team_id !== "") {
            setTeamExists(true);
          }

          const TeamId = parsedUserData.team_id;

          console.log("TeamoOwnerTeamId: ", TeamId);

          // Step 2: Query the "team" collection for the document with this player_id
          const teamCollectionRef = collection(db, "team");

          const q = query(teamCollectionRef, where("team_id", "==", TeamId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming there's only one matching document
            const playerDoc = querySnapshot.docs[0];
            const playerDocId = playerDoc.id;
            const playerData2 = playerDoc.data(); // Explicitly cast the data to TeamData type

            // Step 3: Use teamData for rendering or updating state
            console.log("Fetched TeamOwner Team Data:", playerData2);
            console.log("Fetched TeamOwner Team Name:", playerData2.team_name);

            setTeamName(playerData2.team_name);
            setProfilePic(playerData2.profile_pic);
            console.log("Fetched TeamOwner Team Name from set:", teamName);
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImagePicker = async () => {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access the media library is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // Set selected image URI from the assets array
    }
  };

  const uploadImageToFirebase = async (uri: string) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const playerId = userData.team_id;
      const storageRef = ref(storage, `profile_pictures/${playerId}`); // Create a storage reference with the player ID

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL; // Return the image download URL
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    } finally{
      setLoading(false);
    }
  };

  const logoutButtonPressed = () => {
    setModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("userData"); // Clear user data

      setTimeout(() => {
        router.push("/Login");
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error logging out:", error);
      setAlertMessage("Error logging out");
      setAlertVisible(true);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const storedUserData = await AsyncStorage.getItem("userData");

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        const userTeamId = parsedUserData.team_id;

        const teamCollectionRef = collection(db, "team"); // Adjust the collection name as per your Firestore setup

        const q = query(teamCollectionRef, where("team_id", "==", userTeamId));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teamDoc = querySnapshot.docs[0];
          const teamDocId = teamDoc.id;
          const teamData2 = teamDoc.data();

          const teamDocRef = doc(db, "team", teamDocId);
          await updateDoc(teamDocRef, {
            team_name: teamName || teamData2.team_name,
            profile_pic: profile_pic || teamData2.profile_pic,
          });

          setLoading(false);
          setAlertMessage("Team Profile updated successfully!");
          setAlertVisible(true);
        } else {
          setAlertMessage("Team document not found in Firestore.");
          setAlertVisible(true);
        }
      } else {
        setAlertMessage("User data not found");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error updating user data: ", error);
      setAlertMessage("Update failed");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Settings</Text>
            {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
            {/* Image Picker */}
            {teamExists && (
              <TouchableOpacity
                onPress={handleImagePicker}
                style={styles.imagePicker}
              >
                {selectedImage || profile_pic ? (
                  <Image
                    source={{ uri: selectedImage || profile_pic }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text style={styles.imagePickerText}>
                    Select Profile Picture
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {teamExists && (
              <>
                <Text style={styles.label2}>Change the Team's logo</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Team Name</Text>
                  <TextInput
                    style={styles.input}
                    value={teamName}
                    onChangeText={setTeamName}
                    placeholder="Enter your Team name"
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdate}
                >
                  <Text style={styles.updateButtonText}>Update Team Name</Text>
                </TouchableOpacity>
              </>
            )}
            {/* Atttributes Button */}
            <TouchableOpacity
              style={styles.attributesButton}
              onPress={() => router.push("/TeamOwnerAttributes")}
            >
              <Text style={styles.attributesButtonText}>Attributes</Text>
            </TouchableOpacity>

            {/* Personal Settings Button */}

            <TouchableOpacity
              style={styles.PsettingButton}
              onPress={() => router.push("/TeamOwnerPersonalSettings")}
            >
              <Text style={styles.PsettingText}>Personal Settings</Text>
            </TouchableOpacity>

            {/* Personal Settings Button */}

            {teamExists && (<><TouchableOpacity
              style={styles.PsettingButton}
              onPress={() => router.push("/TeamOwnerHireCoach")}
            >
              <Text style={styles.PsettingText}>Hire Coach</Text>
            </TouchableOpacity>

            

            <TouchableOpacity
              style={styles.PsettingButton}
              onPress={() => router.push("/TeamOwnerViewPlayers")}
            >
              <Text style={styles.PsettingText}>View Players</Text>
            </TouchableOpacity></>)}

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logoutButtonPressed}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            </>
      )}
          </ScrollView>
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalDetails}>
                  Are you sure you want to logout?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        
      {/* Custom Alert for messages */}
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
    backgroundColor: "#121212", // Dark background color
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingBottom: 50,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", // Light text color for dark mode
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#bbb", // Softer color for labels
    marginBottom: 5,
  },
  label2: {
    fontSize: 16,
    color: "#bbb", // Softer color for labels
    marginBottom: 5,
    alignSelf: "center",
    paddingBottom: 20,
  },

  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#fff", // Light text color for dark mode
  },
  updateButton: {
    backgroundColor: "#005B41", // Teal color for the button
    padding: 15,
    borderRadius: 50, // Rounded buttons for aesthetic appeal
    alignItems: "center",
    marginBottom: 0,
  },
  updateButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  attributesButton: {
    backgroundColor: "#3498db", // Blue color for the Attributes button
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 12,
  },
  attributesButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  PsettingButton: {
    backgroundColor: "#3498db", // Blue color for the Attributes button
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 12,
  },
  PsettingText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalView: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
  },
  modalDetails: {
    color: "#bbb",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    backgroundColor: "#005B41",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ff4c4c",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  imagePicker: {
    marginBottom: 30,
    borderRadius: 100,
    width: 250,
    height: 250,
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  imagePickerText: {
    color: "#999",
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 100,
  },
});
