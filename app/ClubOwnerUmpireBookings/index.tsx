import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db } from "@/firebaseConfig";
import {
  doc,
  getDocs,
  collection,
  query,
  getDoc,
  where,
  updateDoc,
} from "firebase/firestore";
import CustomAlert from "@/components/CustomAlert";

interface Umpire {
  umpire_id: string;
  name: string;
  username: string;
  email: string;
  phone_no: string;
  experience: string;
  password: string;
  mathes_officiated: string[];
}

export default function ClubOwnerUmpireBookings() {
  const router = useRouter();
  const [umpiresList, setUmpiresList] = useState<Umpire[]>([]); // Store fetched umpire details here
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedUmpire, setSelectedUmpire] = useState<Umpire | null>(null); // Selected umpire details
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  const [umpireData, setUmpireData] = useState({
    umpire_id: "",
    name: "",
    username: "",
    email: "",
    phone_no: 0,
    password: "",
    mathes_officiated: [] as string[],
  });

  const fetchUmpires = async () => {
    try {
      setLoading(true);
      const umpireCollectionRef = collection(db, "umpire"); // Reference to umpire collection
      const umpireSnapshot = await getDocs(umpireCollectionRef); // Fetch all documents in umpire collection

      const umpireList = umpireSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          umpire_id: data.umpire_id,
          name: data.name,
          experience: data.experience,
          phone_no: data.phone_no,
        };
      });

      setUmpiresList(umpireList as Umpire[]); // Store fetched data in state
    } catch (error) {
      console.error("Error fetching umpires:", error);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUmpires();
  }, []);

  const handleSelectUmpire = (umpire: Umpire) => {
    setSelectedUmpire(umpire);
    setModalVisible(true);
  };

  const handleBookUmpire = async () => {
    setLoading(true);
    try{
      
    if (selectedUmpire && bookingId) {
      const bookingCollectionRef = collection(db, "booking");
      const q = query(
        bookingCollectionRef,
        where("booking_id", "==", bookingId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const bookingDoc = querySnapshot.docs[0];
        const bookingDocId = bookingDoc.id;
        const bookingDocRef = doc(db, "booking", bookingDocId);
        await updateDoc(bookingDocRef, {
          umpire_id: selectedUmpire.umpire_id,
        });

        console.log(`Booking Umpire ID: ${selectedUmpire.umpire_id} with Booking ID: ${bookingId}`);
        setAlertMessage("Umpire booked successfully");
        setAlertVisible(true);
        // Close modal after booking
        setModalVisible(false);
        setBookingId(""); // Reset booking ID
        //setloading(false);
      } else {
        setAlertMessage("Booking ID not found");
          setAlertVisible(true);
      }
    } else {
      setAlertMessage("Please enter Booking ID");
          setAlertVisible(true);
    }
  } catch (error) {
    console.error("Error booking umpire:", error);
  }finally{
    setLoading(false);
  }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>
          Book <Text style={styles.coachText}>Umpire</Text>
        </Text>
      </View>
      { loading? (
        <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select an Umpire</Text>
          {umpiresList.map((umpire) => (
            <TouchableOpacity
              key={umpire.umpire_id}
              style={styles.umpireCard}
              onPress={() => handleSelectUmpire(umpire)}
            >
              <Text style={styles.umpireText}>ID: {umpire.umpire_id}</Text>
              <Text style={styles.umpireText}>Name: {umpire.name}</Text>
              <Text style={styles.umpireText}>
                Experience: {umpire.experience}
              </Text>
              <Text style={styles.umpireText}>Phone: {umpire.phone_no}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      </>
      )}

      {/* Modal for booking umpire */}
      {selectedUmpire && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Book Umpire</Text>

              {/* Show Umpire ID */}
              <Text style={styles.modalText}>
                Umpire ID: {selectedUmpire.umpire_id}
              </Text>

              {/* Input for Booking ID */}
              <TextInput
                placeholder="Enter Booking ID"
                value={bookingId}
                onChangeText={setBookingId}
                style={styles.input}
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleBookUmpire}
              >
                <Text style={styles.viewAllText}>Book Umpire</Text>
              </TouchableOpacity>
              {/* Close Modal Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
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
  umpireCard: {
    backgroundColor: "#005B41",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  umpireText: {
    color: "#fff",
    fontSize: 16,
  },
  modalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#333",
    padding: 10,
    color: "#fff",
    borderRadius: 5,
    marginBottom: 20,
    width: "95%",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "lightgrey",
    marginBottom: 20,
  },
  umpireOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "#005B41",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ff6347",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});