import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc, getDocs, query, where, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import CustomAlert from "@/components/CustomAlert";
import { ScrollView } from "react-native-gesture-handler";

export default function PlayerSettingsScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [userData, setUserData] = useState({
    username: "",
    teamOwner_id:"",
    password: "",
    player_id: "",
    team_id:"",
  });

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
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
          <Text style={styles.title}>Settings</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder={userData.username}
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
              placeholder="a"
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
              placeholder="asdsad"
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
              placeholder="Enter your new password"
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
      paddingBottom: 100,
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
  