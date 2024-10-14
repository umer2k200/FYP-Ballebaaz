import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc, getDocs, query, where, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Ensure your firebaseConfig is correctly set up
import CustomAlert from "@/components/CustomAlert";
//import { ScrollView } from "react-native-gesture-handler";
//import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function TeamOwnerSettingsScreen() {
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
    phone_no: 0,
    email: "",
    team_id: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setUsername(parsedUserData.username);
          // setPhoneNumber(parsedUserData.phone_no.toString());
          setEmail(parsedUserData.email);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

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
    const phoneRegex = /^03[0-9]{9}$/;
  const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
  const passwordRegex = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/;
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
        const userTeamId = parsedUserData.team_id;
        const playerId=parsedUserData.player_id;
        
        const teamCollectionRef = collection(db, "team"); // Adjust the collection name as per your Firestore setup
        const playerCollectionRef=collection(db,"player");
        const q = query(teamCollectionRef, where("team_id", "==", userTeamId));
        const q2=query(playerCollectionRef, where("player_id","==",playerId));
        const querySnapshot = await getDocs(q);
        const querySnapshot2 = await getDocs(q2);

        if (!querySnapshot.empty && !querySnapshot2.empty) {
          const teamDoc = querySnapshot.docs[0];
          const playerDoc = querySnapshot2.docs[0];
          const teamDocId = teamDoc.id;
          const playerDocId = playerDoc.id;

          const teamDocRef = doc(db, "team", teamDocId);
          await updateDoc(teamDocRef, {
            username: username || parsedUserData.username,
           
            password: password || parsedUserData.password,
            
          });

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
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Settings</Text>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your user name"
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
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
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

          <TouchableOpacity
            style={styles.PsettingButton}
            onPress={() => router.push("/TeamOwnerHireCoach")}
          >
            <Text style={styles.PsettingText}>Hire Coach</Text>
          </TouchableOpacity>
          {/* Logout Button */}

          {/* Personal Settings Button */}

          <TouchableOpacity
            style={styles.PsettingButton}
            onPress={() => router.push("/TeamOwnerViewPlayers")}
          >
            <Text style={styles.PsettingText}>View Players</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          </ScrollView>
          </>
      )}
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
    marginTop:30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#bbb", // Softer color for labels
    marginBottom: 5,
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
