import { useState } from "react"; // Import useState for form handling
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import RNPickerSelect from "react-native-picker-select";
import { db } from "@/firebaseConfig"; // Import Firebase configuration
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"; // Firestore methods
import CustomAlert from "@/components/CustomAlert";
export default function Signup() {
  const router = useRouter();

  // Define state variables for form inputs
  const [username, setUsername] = useState("");
  const [fullName, setfullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // New state variable
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // For confirm password visibility
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Function to handle the signup process
  const handleSignup = async () => {
    const phoneRegex = /^03[0-9]{9}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
    const passwordRegex = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/;

    if (!fullName || !username || !phone || !role || !password || !confirmPassword) {
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
      return;
    }

    if (!usernameRegex.test(username)) {
      setAlertMessage("Username must be at least 5 characters and contain only letters, numbers, and underscores");
      setAlertVisible(true);
      return;
    }

    if (!phoneRegex.test(phone)) {
      setAlertMessage("Invalid phone number");
      setAlertVisible(true);
      return;
    }

    

    if (!passwordRegex.test(password)) {
      setAlertMessage("Password must be at least 8 characters and contain at least one letter and one number");
      setAlertVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    
    
    if(role === "teamOwner"){
      const teamOwnerCollectionRef = collection(db, "teamOwner");
      const usernameQuery = query(teamOwnerCollectionRef, where("username", "==", username));
      const phoneQuery = query(teamOwnerCollectionRef, where("phone_no", "==", phone));
      try{
        const usernameSnapshot = await getDocs(usernameQuery);
        const phoneSnapshot = await getDocs(phoneQuery);
        if(!usernameSnapshot.empty){
          setAlertMessage("Username already exists! Please choose another username");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
        if(!phoneSnapshot.empty){
          setAlertMessage("Phone number already exists! Please choose another phone number");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username or phone number: ", error);
        setAlertMessage("Error checking username or phone number");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const random_player_id = "P" + Math.floor(Math.random() * 1000);
      const playerCollectionRef = collection(db, "player");
      const player_idQuery = query(playerCollectionRef, where("player_id", "==", random_player_id));
      try{
        const player_idSnapshot = await getDocs(player_idQuery);
        if(!player_idSnapshot.empty){
          setAlertMessage("Signup again! Error generating player_id");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking player_id: ", error);
        setAlertMessage("Error checking player_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const playerData = {
        name: fullName,
        username: username,
        phone_no: phone,
        role: "",
        password: password,
        player_id: random_player_id, 
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
      };
      const random_teamOwnerID = "TO" + Math.floor(Math.random() * 1000);
      const teamOwner_idQuery = query(teamOwnerCollectionRef, where("teamOwner_id", "==", random_teamOwnerID));
      try{
        const teamOwner_idSnapshot = await getDocs(teamOwner_idQuery);
        if(!teamOwner_idSnapshot.empty){
          setAlertMessage("Signup again! Error generating teamOwner_id");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking teamOwner_id: ", error);
        setAlertMessage("Error checking teamOwner_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const teamOwnerData = {
        teamOwner_id: random_teamOwnerID,
        team_id: "",
        player_id: random_player_id,
        username: username,
        password: password,
      };
      try {
        // await addDoc(collection(db, "player"), playerData);
        const docRef = await addDoc(collection(db, "player"), playerData);
        const teamOwnerDocRef = await addDoc(collection(db, "teamOwner"), teamOwnerData);
        console.log("Document written with ID: ", docRef.id);
        console.log("Document written with ID: ", teamOwnerDocRef.id);
        
        setAlertMessage("Account created successfully!");
        setAlertVisible(true);
        router.push("/Login"); // Redirect to login after signup
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to create account");
        setAlertVisible(true);
      }finally {
        setLoading(false);
      }
      return;
    }

    if (role === "player") {
      //check if username or phonenumber already exists or not
      const playerCollectionRef = collection(db, "player");
      const usernameQuery = query(playerCollectionRef, where("username", "==", username));
      const phoneQuery = query(playerCollectionRef, where("phone_no", "==", phone));
      try{
        const usernameSnapshot = await getDocs(usernameQuery);
        const phoneSnapshot = await getDocs(phoneQuery);
        if(!usernameSnapshot.empty){
          setAlertMessage("Username already exists! Please choose another username");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
        if(!phoneSnapshot.empty){
          setAlertMessage("Phone number already exists! Please choose another phone number");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username or phone number: ", error);
        setAlertMessage("Error checking username or phone number");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const random_player_id = "P" + Math.floor(Math.random() * 1000);
      const player_idQuery = query(playerCollectionRef, where("player_id", "==", random_player_id));
      try{
        const player_idSnapshot = await getDocs(player_idQuery);
        if(!player_idSnapshot.empty){
          setAlertMessage("Signup again! Error generating player_id");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking player_id: ", error);
        setAlertMessage("Error checking player_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const playerData = {
        name: fullName,
        username: username,
        phone_no: phone,
        role: "",
        password: password,
        player_id: random_player_id, 
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
      };
      try {
        // await addDoc(collection(db, "player"), playerData);
        const docRef = await addDoc(collection(db, "player"), playerData);
        console.log("Document written with ID: ", docRef.id);
        
        setAlertMessage("Account created successfully!");
      setAlertVisible(true);
        router.push("/Login"); // Redirect to login after signup
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to create account");
      setAlertVisible(true);
      }finally {
        setLoading(false);
      }

      return;
    }

    if (role === "coach") {
      const coachCollectionRef = collection(db, "coach");
      const usernameQuery = query(coachCollectionRef, where("username", "==", username));
      const phoneQuery = query(coachCollectionRef, where("phone_no", "==", phone));
      try{
        const usernameSnapshot = await getDocs(usernameQuery);
        const phoneSnapshot = await getDocs(phoneQuery);
        if(!usernameSnapshot.empty){
          setAlertMessage("Username already exists! Please choose another username");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
        if(!phoneSnapshot.empty){
          setAlertMessage("Phone number already exists! Please choose another phone number");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username or phone number: ", error);
        setAlertMessage("Error checking username or phone number");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const random_coachID = "C" + Math.floor(Math.random() * 1000);
      const coachidQuery = query(coachCollectionRef, where("coach_id", "==", random_coachID));
      try{
        const coachidSnapshot = await getDocs(coachidQuery);
        if(!coachidSnapshot.empty){
          setAlertMessage("Signup again! Error generating Coach ID");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking player_id: ", error);
        setAlertMessage("Error checking player_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const coachData = {
        assigned_players: [],
        coach_id: random_coachID,
        coach_name: fullName,
        username: username,
        email: "",
        experience: 0,
        team_id: "",
        phone_no: phone,
        password: password,
        profile_pic: '',
      };
      try {
        // await addDoc(collection(db, "player"), playerData);
        const docRef = await addDoc(collection(db, "coach"), coachData);
        console.log("Document written with ID: ", docRef.id);
        
        setAlertMessage("Account created successfully");
      setAlertVisible(true);
        router.push("/Login"); // Redirect to login after signup
      } catch (error) {
        console.error("Error adding document: ", error);
        
        setAlertMessage("Failed to create acocunt");
      setAlertVisible(true);
      }finally {
        setLoading(false);
      }
      return;
    }

    if (role === "umpire") {
      const umpireCollectionRef = collection(db, "umpire");
      const usernameQuery = query(umpireCollectionRef, where("username", "==", username));
      const phoneQuery = query(umpireCollectionRef, where("phone_no", "==", phone));
      try{
        const usernameSnapshot = await getDocs(usernameQuery);
        const phoneSnapshot = await getDocs(phoneQuery);
        if(!usernameSnapshot.empty){
          setAlertMessage("Username already exists! Please choose another username");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
        if(!phoneSnapshot.empty){
          setAlertMessage("Phone number already exists! Please choose another phone number");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username or phone number: ", error);
        setAlertMessage("Error checking username or phone number");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const random_umpireID = "U" + Math.floor(Math.random() * 1000);
      const umpireidQuery = query(umpireCollectionRef, where("umpire_id", "==", random_umpireID));
      try{
        const umpireidSnapshot = await getDocs(umpireidQuery);
        if(!umpireidSnapshot.empty){
          setAlertMessage("Signup again! Error generating umpire ID");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking player_id: ", error);
        setAlertMessage("Error checking player_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const umpireData = {
        umpire_id:random_umpireID ,
        umpire_name: fullName,
        username: username,
        email: "",
        matches_officiated: [],
        phone_no: phone,
        password: password,
        experience: 0,
      };
      try {
        // await addDoc(collection(db, "player"), playerData);
        const docRef = await addDoc(collection(db, "umpire"), umpireData);
        console.log("Document written with ID: ", docRef.id);
        
        setAlertMessage("Account created successfully");
        setAlertVisible(true);
        router.push("/Login"); // Redirect to login after signup
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to create acocunt");
      setAlertVisible(true);
      }finally {
        setLoading(false);
      }
      return;
    }
    

    if (role === "club_owner") {
      const clubOwnerCollectionRef = collection(db, "clubOwner");
      const usernameQuery = query(clubOwnerCollectionRef, where("username", "==", username));
      const phoneQuery = query(clubOwnerCollectionRef, where("phone_no", "==", phone));
      try{
        const usernameSnapshot = await getDocs(usernameQuery);
        const phoneSnapshot = await getDocs(phoneQuery);
        if(!usernameSnapshot.empty){
          setAlertMessage("Username already exists! Please choose another username");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
        if(!phoneSnapshot.empty){
          setAlertMessage("Phone number already exists! Please choose another phone number");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username or phone number: ", error);
        setAlertMessage("Error checking username or phone number");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const random_clubOwnerID = "CO" + Math.floor(Math.random() * 1000);
      const clubOwneridQuery = query(clubOwnerCollectionRef, where("clubOwner_id", "==", random_clubOwnerID));
      try{
        const clubOwneridSnapshot = await getDocs(clubOwneridQuery);
        if(!clubOwneridSnapshot.empty){
          setAlertMessage("Signup again! Error generating clubOwner ID");
          setAlertVisible(true);
          setLoading(false);
          return;
        }
      }catch (error) {
        console.error("Error checking player_id: ", error);
        setAlertMessage("Error checking player_id");
        setAlertVisible(true);
        setLoading(false);
        return;
      }
      const clubOwnerData = {
        clubOwner_id: random_clubOwnerID,
        clubOwner_name: fullName,
        username: username,
        email: "",
        ground_id: "",
        revenue: 0,
        bookings: [],
        phone_no: phone,
        password: password,
      };
      try {
        // await addDoc(collection(db, "player"), playerData);
        const docRef = await addDoc(collection(db, "clubOwner"), clubOwnerData);
        console.log("Document written with ID: ", docRef.id);
        
        setAlertMessage("Account created successfully");
        setAlertVisible(true);
        router.push("/Login"); // Redirect to login after signup
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to create acocunt");
        setAlertVisible(true);
      }finally {
        setLoading(false);
      }
      return;
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      { loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
        </View>
      ) : (
        <>
      <Text style={styles.title}>SIGN UP</Text>

      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="grey" />
        <TextInput
          placeholder="Full Name"
          placeholderTextColor={"grey"} // Contrast color
          style={styles.input}
          value={fullName}
          onChangeText={setfullName}
        />
      </View>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="grey" />
        <TextInput
          placeholder="Username"
          placeholderTextColor={"grey"} // Contrast color
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="grey" />
        <TextInput
          placeholder="Phone no"
          placeholderTextColor={"grey"}
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="grey" />
        <TextInput
          placeholder="Password"
          placeholderTextColor={"grey"}
          secureTextEntry={!passwordVisible} // Toggle password visibility
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Icon
                name={passwordVisible ? "eye-slash" : "eye"} // Change icon based on visibility
                size={20}
                color="grey"
              />
            </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="grey" />
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor={"grey"}
          secureTextEntry={!confirmPasswordVisible} // Toggle password visibility
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword} 
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
              <Icon
                name={confirmPasswordVisible ? "eye-slash" : "eye"} // Change icon based on visibility
                size={20}
                color="grey"
              />
            </TouchableOpacity>
      </View>

      {/* Role Input with Dropdown */}
      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="grey" style={{ paddingBottom: 5 }} />
        <RNPickerSelect
          onValueChange={setRole}
          items={[
            { label: "Player", value: "player" },
            { label: "Coach", value: "coach" },
            { label: "Umpire", value: "umpire" },
            { label: "Ground Owner", value: "club_owner" },
            { label: "Team Owner", value: "teamOwner" },
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: "Select Role", value: null }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      {/* Google Sign-Up Button */}
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={require("@/assets/images/google-icon.png")}
          style={styles.googleicon}
        />
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/Login")}>
          <Text style={styles.signupButton}>Sign in</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  googleicon: {
    width: 20,
    height: 20,
    marginRight: 10, // Adds space between the icon and text
  },
  title: {
    fontSize: 34,
    color: "darkgrey",
    fontWeight: "bold",
    marginBottom:70,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "grey",
    marginBottom: 20,
    marginHorizontal: 25,
    paddingHorizontal: 10,
    width: "80%", // Set a wider width for input fields
  },
  input: {
    flex: 1,
    color: "white",
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#005B41",
    padding: 10,
    marginTop:30,
    borderRadius: 50,
    width: "60%",
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  googleButton: {
    backgroundColor: "#121212",
    flexDirection: "row", // Ensures the icon and text are in one line
    alignItems: "center",
    padding: 10,
    borderRadius: 50,
    width: "90%",
    justifyContent: "center", // Center content horizontally
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD", // Optional styling for the button
  },
  googleButtonText: {
    fontSize: 18,
    color: "darkgrey",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signupText: {
    color: "darkgrey",
  },
  signupButton: {
    color: "#005B41",
  },
});

// Styles for the picker select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 140,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 4,
    backgroundColor: "#1e1e1e", // Matching color for Android
    color: "lightgrey", // Ensure selected text is visible
    paddingRight: 130, 
    marginBottom: 20, // To ensure the text is never behind the icon
    marginLeft: 10,// Ensure some spacing// To ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 140,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 4,
    backgroundColor: "#1e1e1e", // Matching color for Android
    color: "lightgrey", // Ensure selected text is visible
    paddingRight: 130, 
    marginBottom: 20, // To ensure the text is never behind the icon
    marginLeft: 10,
  },
});