import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db, storage } from "@/firebaseConfig";
import {
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  collection,
  addDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomAlert from "@/components/CustomAlert";
import { useRouter } from "expo-router";
export default function AddTeamScreen() {
  const [captain_id, setCaptainId] = useState("");
  const [captainName, setCaptainName] = useState("");
  //coach will be null
  //highest score null
  //highlights null
  //matches lost
  //matcehs played
  //matches won
  //players
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  //ranking
  const [teamName, setTeamName] = useState("");
  //wl ratio null
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [teamOwnerData, setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id: "",
    username: "",
    password: "",
  });

  const router = useRouter();
  const teamData = {
    captain_id: captain_id,
    captain_name: captainName,
    coach_id: "",
    highest_score: "",
    highlights: [],
    matches_lost: 0,
    matches_played: 0,
    matches_won: 0,
    players: [],
    profile_pic: selectedImage,
    ranking: "",
    team_id: "T" + Math.floor(Math.random() * 1000),
    team_name: teamName,
    wl_ratio: "",
    kit_pic: "",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setTeamOwnerData(parsedUserData);
          await fetchCaptainName();
          setCaptainId(parsedUserData.teamOwner_id);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchCaptainName = async () => {
    const storedUserData = await AsyncStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      const userPlayerId = parsedUserData.player_id;
      const userPlayerCollectionRef = collection(db, "player");
      const q = query(
        userPlayerCollectionRef,
        where("player_id", "==", userPlayerId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocData = userDoc.data();
        setCaptainName(userDocData.name);

      
        setCaptainId(teamOwnerData.teamOwner_id);
        console.log(
          "Player document found in Firestore: captain name:",
          userDocData.name
        );
      } else {
        console.log("Player document not found in Firestore.");
      }
    } else {
      console.log("User data not found");
    }
  };

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
      const teamId = teamData.team_id;
      const storageRef = ref(storage, `profile_pictures/${teamId}`); // Create a storage reference with the player ID

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL; // Return the image download URL
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    //setLoading(true);
    try {
      setLoading(true);
      // Get the current user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);

        // Assuming player_id is unique and exists in the user data
        const teamOwnerId = parsedUserData.teamOwner_id;

        // Create a reference to the "player" collection
        const teamOwnerCollectionRef = collection(db, "teamOwner");

        // Query Firestore for the document with this player_id
        const q = query(
            teamOwnerCollectionRef,
          where("teamOwner_id", "==", teamOwnerId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const userDoc = querySnapshot.docs[0];
          const userDocId = userDoc.id; // Get the document ID dynamically

          // Create the reference to the Firestore document using the fetched userDocId
          const userDocRef = doc(db, "teamOwner", userDocId);

          // Update Firestore with the new data (username, phoneNumber, password)
          await updateDoc(userDocRef, {
            
            team_id: teamData.team_id,
          });

          // Update the local user data in AsyncStorage
          const updatedUserData = {
            ...parsedUserData,
            team_id: teamData.team_id,
          };

          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(updatedUserData)
          );
          // setLoading(false);
          // setAlertMessage("Ground add successfully!");
          // setAlertVisible(true);
        } else {
          setAlertMessage("User document not found in Firestore.");
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

  const handleAddTeam = async () => {
    if (captainName === '') {
      console.log("captain name is empty")
    } 
    if( captain_id === ''){
      console.log("captain id is empty")
    }
    
    if (captain_id && captainName && selectedImage && teamName) {
      try {
        setLoading(true);

        let imageUrl = teamData.profile_pic;
        if (selectedImage) {
          imageUrl = await uploadImageToFirebase(selectedImage);
        }
        const updatedTeamData = {
          ...teamData,
          profile_pic: imageUrl, // set the image URL in the updatedTeamData
          players: [teamOwnerData.player_id, ...teamData.players], // Add captain_id to players array
        };
        const docRef = await addDoc(collection(db, "team"), updatedTeamData);
        console.log("Document written with ID: ", docRef.id);
        await handleUpdate();
        setAlertMessage("Team added successfully!");
        setAlertVisible(true);
        router.push("/TeamOwnerHomeScreen");
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to add ground");
        setAlertVisible(true);
      } finally {
        setLoading(false);
        
      }
      // Clear the fields after adding the team
      setTeamName("");
      setSelectedImage(null);
    } else {
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
     
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.title}>Add your Team</Text>
            {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
            {/* Image Picker */}
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles.imagePicker}
            >
              {selectedImage || teamData.profile_pic ? (
                <Image
                  source={
                    selectedImage
                      ? { uri: selectedImage }
                      : teamData.profile_pic
                      ? { uri: teamData.profile_pic }
                      : require("@/assets/images/assignedplayer.png")
                  }
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>Select Team Logo</Text>
              )}
            </TouchableOpacity>
            {/* team name Input */}
            <TextInput
              style={styles.input}
              placeholder="Team Name"
              placeholderTextColor="#888"
              value={teamName}
              onChangeText={setTeamName}
            />

            {/* Add Team Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddTeam}>
              <Text style={styles.buttonText}>Add Team</Text>
            </TouchableOpacity>
            </>
      )}
          </ScrollView>
        
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
    backgroundColor: "#121212",
    padding: 25,
    justifyContent: "center",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "lightgrey",
    textAlign: "center",
    marginBottom: 80,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  timingButton: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#005B41", // Highlight the selected button
  },
  timingText: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#005B41",
    padding: 15,
    width: "50%",
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
});
