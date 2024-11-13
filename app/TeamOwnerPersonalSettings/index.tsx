import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDocs, query, where, collection } from "firebase/firestore";
import { db,storage } from "@/firebaseConfig";
import CustomAlert from "@/components/CustomAlert";

export default function PlayerSettingsScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    username: "",
    teamOwner_id:"",
    password: "",
    player_id: "",
    team_id:"",
  });

  const [playerData, setPlayerData] = useState({
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
    training_sessions: [],
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
    profile_pic: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
          fetchPlayerData();
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchPlayerData = async () => {
    try{
      setLoading(true);
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        const player_id = parsedUserData.player_id;
        const playerCollectionRef = collection(db, "player");
        const q = query(playerCollectionRef, where("player_id", "==", player_id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const playerDoc = querySnapshot.docs[0];
          const playerDocId = playerDoc.id;
          const playerDocData = playerDoc.data();
          console.log("Team Owner Player Data:", playerDoc.data());
          setPlayerData(playerDocData as any);
          
        }
        else{
          console.log("Player document not found");
        }
      }else{
        console.log("User data not found");
      }
    }catch(error){
      console.log("Error fetching player data:", error);
    }
    finally{
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const uploadImageToFirebase = async (uri:string) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const teamOwnerId = userData.teamOwner_id;
      const storageRef = ref(storage, `profile_pictures/${teamOwnerId}`); // Create a storage reference with the player ID

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

  const handleUpdatePersonal = async () => {

    const phoneRegex = /^03[0-9]{9}$/;
  const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
   const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Validation for Username
  if (username && !usernameRegex.test(username)) {
    setAlertMessage("Username must be at least 5 characters and contain only letters, numbers, and underscores");
    setAlertVisible(true);
    return;
  }

  // Validation for Phone Number
  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    setAlertMessage("Invalid phone number. It should start with '03' and contain 11 digits.");
    setAlertVisible(true);
    return;
  }

  // Validation for Password
  if (password && !passwordRegex.test(password)) {
    setAlertMessage("Password must be at least 8 characters and contain at least one letter and one number.");
    setAlertVisible(true);
    return;
  }

  if (email && !emailRegex.test(email)) {
    setAlertMessage("Invalid email format.");
    setAlertVisible(true);
    return;
  }
  

    try {
      setLoading(true);

      let imageUrl = playerData.profile_pic;
      if (selectedImage) {
        imageUrl = await uploadImageToFirebase(selectedImage);
      }
      const storedUserData = await AsyncStorage.getItem("userData");
      
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        const teamOwnerPlayerId = parsedUserData.player_id;

        // Query the "teamOwner" collection for the document with player_id
        const teamOwnerCollectionRef = collection(db, "teamOwner");
        const q = query(teamOwnerCollectionRef, where("player_id", "==", teamOwnerPlayerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const teamOwnerDoc = querySnapshot.docs[0];
          const teamOwnerDocId = teamOwnerDoc.id;

          // Now fetch the player document using player_id from teamOwner
          const playerCollectionRef = collection(db, "player");
          const playerQuery = query(playerCollectionRef, where("player_id", "==", teamOwnerPlayerId));
          const playerSnapshot = await getDocs(playerQuery);

          if (!playerSnapshot.empty) {
            const playerDoc = playerSnapshot.docs[0];
            const playerDocId = playerDoc.id;

            // Update the player document
            const playerDocRef = doc(db, "player", playerDocId);
            const teamDocRef=doc(db,"teamOwner",teamOwnerDocId);

            await updateDoc(playerDocRef, {
              username: username || playerDoc.data().username,
              phone_no: phoneNumber || playerDoc.data().phone_no,
              password: password || playerDoc.data().password,
              email: email || playerDoc.data().email,
              profile_pic: imageUrl || playerDoc.data().profile_pic,
            });

            await updateDoc(teamDocRef, {
              username: username || playerDoc.data().username,
              password: password || playerDoc.data().password,
            
            });

            // Update local storage with new data
            const updatedUserData = {
              ...parsedUserData,
              username: username || parsedUserData.username,
              
              password: password || parsedUserData.password,
             
            };
            //update player data in PlayerData
            setPlayerData({
              ...playerData,
              username: username || playerData.username,
              phone_no: phoneNumber || playerData.phone_no,
              password: password || playerData.password,
              email: email || playerData.email,
              profile_pic: imageUrl || playerData.profile_pic,
            });

            await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
            setLoading(false);
            setAlertMessage("Profile updated successfully!");
            setAlertVisible(true);
          } else {
            setAlertMessage("Player document not found.");
            setAlertVisible(true);
          }
        } else {
          setAlertMessage("TeamOwner document not found.");
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
      
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Settings</Text>
          {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
          {/* Image Picker */}
      <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
              {selectedImage || playerData.profile_pic ? (
                <Image
                  source={{ uri: selectedImage || playerData.profile_pic }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>Select Profile Picture</Text>
              )}
            </TouchableOpacity>


          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder={playerData.username}
              placeholderTextColor="#999"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={playerData.email}
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={playerData.phone_no}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={playerData.password}
              secureTextEntry={true}
              placeholderTextColor="#999"
            />
          </View>

          {/* Update Button */}
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePersonal}>
            <Text style={styles.updateButtonText}>Update Profile</Text>
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
      backgroundColor: "#121212", // Dark background color
      paddingHorizontal: 20,
      justifyContent: "center",
      paddingBottom: 50,
      paddingTop: 50,
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
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: "#bbb", // Softer color for labels
      marginBottom: 5,
    },
    input: {
      backgroundColor: "#1e1e1e",
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: "#fff", // Light text color for dark mode
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
    updateButton: {
      backgroundColor: "#005B41", // Teal color for the button
      padding: 15,
      borderRadius: 50, // Rounded buttons for aesthetic appeal
      alignItems: "center",
      marginBottom: 10,
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
      marginVertical: 15,
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
      marginVertical: 15,
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
    },
    logoutButtonText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
    },
  });
  