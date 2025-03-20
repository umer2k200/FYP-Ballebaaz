import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";
export default function ClubOwnerHomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Do nothing on back press
        return true; 
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const upcomingEvent = {
    title: "Local Cricket Tournament",
    date: "2024-10-01",
    location: "Main Stadium",
  };

  const [clubOwnerData, setclubOwnerData] = useState({
    clubOwner_id: "",
    clubOwner_name: "",
    username: "",
    email: "",
    ground_id: "",
    revenue: 0,
    bookings: [],
    phone_no: 0,
    password: "",
  });

  const [groundDetails, setGroundDetails] = useState({
    ground_id: "",
    name: "",
    location: "",
    availibility: "",
    capacity: 0,
    revenue: 0,
    pic:'',
  });

  const [groundExists, setGroundExists] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setclubOwnerData(parsedUserData);
          if (parsedUserData.ground_id === "") {
            setGroundExists(false);
            console.log("No ground found with the provided ground_id");
          } else {
            fetchGroundDetails(parsedUserData.ground_id);
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchGroundDetails = async (groundId: string) => {
    try {
      setLoading(true);
      // Query the 'ground' collection where the field 'ground_id' matches the passed groundId
      const groundQuery = query(
        collection(db, "ground"),
        where("ground_id", "==", groundId)
      );
      const querySnapshot = await getDocs(groundQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((groundDoc) => {
          const groundData = groundDoc.data();
          console.log("Fetched Ground Data:", groundData);

          // Update the ground details state
          setGroundDetails({
            ground_id: groundData.ground_id || "",
            name: groundData.name || "",
            location: groundData.location || "", 
            availibility: groundData.availibility || "",
            capacity: groundData.capacity || 0,
            revenue: groundData.revenue || 0,
            pic:groundData.pic || "",
          });
          setGroundExists(true);
        });
      } else {
        console.log("No ground found with the provided ground_id");
        setGroundExists(false);
      }
    } catch (error) {
      console.log("Error fetching ground details:", error);
      setGroundExists(false);
    }finally{
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          Welcome, <Text style={styles.coachText}>Owner!</Text>
        </Text>
      </View>
      {loading? (
        <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Ground Details Section */}
        <View style={styles.section}>
          
          {groundExists ? (
            <>
            <Text style={styles.sectionTitle}>Ground Details</Text>
            <View style={styles.card}>
              <Image
                source={groundDetails.pic?{uri:groundDetails.pic}:require('@/assets/images/gwadarcricketground.jpg')} // Default ground image
                style={styles.groundImage}
                resizeMode="cover"
                onError={(error)=> console.log("Error loading image:",error.nativeEvent.error)}
              />
              <Text style={styles.cardText}>
                Ground Name: {groundDetails.name}
              </Text>
              <Text style={styles.cardText}>
                Location: {groundDetails.location}
              </Text>
              <Text style={styles.cardText}>
                Capacity: {groundDetails.capacity}
              </Text>
              <Text style={styles.cardText}>
                Availibilty:{" "}
                {groundDetails.availibility ? "Available" : "Not available"}
              </Text>
            </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.addGroundButton}
              onPress={() => router.push("/ClubOwnerAddGround")} // Navigate to add ground screen
            >
              <Text style={styles.addGroundText}>Register ground</Text>
            </TouchableOpacity>
          )}
        </View>

      

        {/* Upcoming Events/Tournaments Section */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Tournament: Summer Cup 2024</Text>
            <Text style={styles.cardText}>Date: 25th September 2024</Text>
            <Text style={styles.cardText}>Teams: Team A vs Team B</Text>
          </View>
        </View> */}
      </ScrollView>
      </>
      )}
      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ClubOwnerUmpireBookings")}
        >
          <Image
            source={require("@/assets/images/group.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ClubOwnerGroundBookings")}
        >
          <Image
            source={require("@/assets/images/upcomingmatches.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/home.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ClubOwnerRevenue")}
        >
          <Image
            source={require("@/assets/images/money.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ClubOwnerSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100, // Padding to avoid navbar overlap
  },
  section: {
    marginBottom: 20,
    width: "100%",
  },
  titleContainer: {
    marginTop: 80,
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 33,
    color: "darkgrey", // General text color (white or any color)
    fontWeight: "bold",
  },
  coachText: {
    color: "#005B41", // Green color for 'Coach'
  },
  sectionTitle: {
    color: "darkgrey",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  bookingCard: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
  },
  addGroundButton: {
    backgroundColor: "#005B41", // Teal color
    padding:15,
    borderRadius: 10,
    marginTop: 20,
    width: "60%",
    alignSelf: "center",
    alignItems: "center",
  },
  addGroundText: {
    color: "#fff",
    fontSize: 16,
  },
  bookingText: {
    color: "#fff",
    fontSize: 16,
  },
  viewAllButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#005B41",
    borderRadius: 5,
  },
  viewAllText: {
    color: "#fff",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: {
    color: "lightgrey",
    fontSize: 16,
    textAlign: "center",
  },
  groundImage: {
    width: 310,
    height: 310,
    borderRadius: 15,
    marginBottom: 20,
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