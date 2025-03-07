import React, { useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {db } from "@/firebaseConfig";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import CustomAlert from "@/components/CustomAlert";
interface Booking {
  booking_id: string;
  dateTime: string;
  ground_id: string;
  team1: string;
  team2: string;
  payment_status: string;
  umpire_id: string;
  teamOwner_id: string;
  price: string;
}

export default function ClubOwnerRevenue() {
  const router = useRouter();
  const [revenue, setRevenue] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  
  const [clubOwnerData,setclubOwnerData] = useState({
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

  const [bookingsList, setBookingsList] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setclubOwnerData(parsedUserData);

          if (parsedUserData.bookings.length > 0) {
            await fetchBookings(parsedUserData.bookings);
            //calculuateRevenue();
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchBookings = async (bookingsArray: string[]) => { 
    setLoading(true);
    const bookingsData: Booking[] = [];

    for (let i = 0; i < bookingsArray.length; i++) {
      const bookingCollectionRef = collection(db, "booking");
      const q = query(bookingCollectionRef, where("booking_id", "==", bookingsArray[i]));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        const bookingDocId = bookingDoc.id;
        const bookingDocRef = doc(db, "booking", bookingDocId);
        const bookingDocData = await getDoc(doc(db, "booking", bookingDocId));
        if (bookingDocData.exists()) {
          const bookingData = bookingDocData.data();
          const booking: Booking = {
            booking_id: bookingData.booking_id,
            dateTime: bookingData.dateTime,
            ground_id: bookingData.ground_id,
            team1: bookingData.team1,
            team2: bookingData.team2,
            payment_status: bookingData.payment_status,
            umpire_id: bookingData.umpire_id,
            teamOwner_id: bookingData.teamOwner_id,
            price: bookingData.price,
          };

          bookingsData.push(booking);
        }
      }
      
    }

    setBookingsList(bookingsData);
    
    console.log("All Bookings Fetched:", bookingsData);
    setLoading(false);
  };
  useEffect(() => {
    // Calculate revenue whenever bookingsList changes
    const calculuateRevenue = () => {
      let totalRevenue = 0;
      bookingsList.forEach((booking) => {
        if (booking.payment_status === "done"){
          totalRevenue += parseInt(booking.price);
        }
      });
      setRevenue(totalRevenue);
    };
  
    if (bookingsList.length > 0) {
      calculuateRevenue(); // Ensure calculation happens after bookingsList is updated
    }
  }, [bookingsList]); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue Details</Text>
      {loading? (
        <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Revenue: Rs {revenue}</Text>
        <Text style={styles.subText}>Monthly Revenue: Rs {revenue / 12}</Text>
        <Text style={styles.subText}>Total Bookings: {clubOwnerData.bookings.length}</Text>

      </View>

      
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/ClubOwnerHomePage")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/money.png")}
              style={styles.navIcon}
            />
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  scroll: {
    flex: 1,
    marginBottom: 20, // Adjust as necessary
  },

  title: {
    fontSize: 33,
    fontWeight: "bold",
    color: "darkgrey", // Light text color for dark mode
    textAlign: "center",
    marginTop: 80,
    marginBottom: 20,
  },
  summaryBox: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 20,
    color: "#00e676",
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 25,
    color: "darkgrey",
    marginVertical: 20,
    justifyContent: "center",
    textAlign: "center",
  },
  bookingBox: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  bookingText: {
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
    backgroundColor: "#1e1e1e",
    paddingVertical: 7,
    borderTopLeftRadius: 50,
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
    paddingLeft: 0,
  },
  navIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  highlight: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "#005B41",
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00e676",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#1e1e1e",
    borderWidth: 5,
  },
});