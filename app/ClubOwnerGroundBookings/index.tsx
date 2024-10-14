import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function ClubOwnerGroundBookings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  const [clubOwnerData, setclubOwnerData] = useState({
    clubOwner_id: "",
    clubOwner_name: "",
    username: "",
    email: "",
    ground_id: "",
    revenue: 0,
    bookings: [] as string[],
    phone_no: 0,
    password: "",
  });

  const [bookingsList, setBookingsList] = useState<Booking[]>([]); // Store fetched booking details here
  const [searchDate, setSearchDate] = useState(""); // State for date filter

  const [bookingData, setBookingData] = useState({
    booking_id: "",
    dateTime: "",
    ground_id: "",
    team1: "",
    team2: "",
    payment_status: "",
    umpire_id: "",
    teamOwner_id: "",
    price: 0,
  });

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
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchBookings = async (bookingsArray: string[]) => {
    // Explicitly type the parameter
    setLoading(true);
    const bookingsData: Booking[] = [];

    for (let i = 0; i < bookingsArray.length; i++) {
      const bookingCollectionRef = collection(db, "booking");
      const q = query(
        bookingCollectionRef,
        where("booking_id", "==", bookingsArray[i])
      );
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
    setBookingData(bookingsData as any);
    setLoading(false);
  };

  const handleBookingClick = (booking: Booking) => {
    console.log("Booking Clicked", booking);
    setSelectedBooking(booking);
    setNewPaymentStatus(booking.payment_status);
    setModalVisible(true);
  };

  const handleSavePaymentStatus = async () => {
    if (selectedBooking) {
      setLoading(true);
      try {
        const bookingCollectionRef = collection(db, "booking");
        const q = query(
          bookingCollectionRef,
          where("booking_id", "==", selectedBooking.booking_id)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const bookingDoc = querySnapshot.docs[0];
          const bookingDocId = bookingDoc.id;
          const bookingDocRef = doc(db, "booking", bookingDocId);
          await updateDoc(bookingDocRef, {
            payment_status: newPaymentStatus,
          });
          setBookingsList((prevBookings) =>
            prevBookings.map((booking) =>
              booking.booking_id === selectedBooking.booking_id
                ? { ...booking, payment_status: newPaymentStatus }
                : booking
            )
          );
          setModalVisible(false);
          setAlertMessage("Payment status updated successfully");
          setAlertVisible(true);
        } else {
          console.log("No such document found");
        }
      } catch (error) {
        console.log("Error updating payment status:", error);
      }
      finally{
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Ground Bookings</Text>
      </View>

      {/* Search Input for filtering by date */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by date (YYYY-MM-DD)"
          placeholderTextColor="#888"
          value={searchDate}
          onChangeText={(text) => setSearchDate(text)}
        />
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {bookingsList.map((booking) => (
              <TouchableOpacity
                key={booking.booking_id}
                style={styles.bookingCard}
                onPress={() => handleBookingClick(booking)}
              >
                <Text style={styles.bookingText}>
                  Booking ID: {booking.booking_id}
                </Text>
                <Text style={styles.bookingText}>
                  {booking.team1} vs {booking.team2} - {booking.ground_id}
                </Text>
                <Text style={styles.bookingText}>{booking.dateTime}</Text>
                <Text style={styles.bookingText}>
                  Price: {booking.price} Rs
                </Text>
                <Text style={styles.bookingText}>
                  Booked by: {booking.teamOwner_id}
                </Text>
                <Text style={styles.bookingText}>
                  Umpire:{" "}
                  {booking.umpire_id !== ""
                    ? booking.umpire_id
                    : "Not Assigned"}
                </Text>
                <Text style={styles.bookingText}>
                  Payment status: {booking.payment_status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {modalVisible && selectedBooking && (
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
              <Text style={styles.sectionTitle}>Change payment status</Text>
                <Text style={styles.modalText}>
                  Booking ID: {selectedBooking.booking_id}
                </Text>

                <View style={styles.section}>
                  
                  <View style={styles.buttonContainer}>
                    <Text style={styles.handLabel}>Status:</Text>
                    {["pending", "done"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.button,
                          newPaymentStatus === status && styles.selectedButton,
                        ]}
                        onPress={() => setNewPaymentStatus(status)}
                      >
                        <Text style={styles.buttonText}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={handleSavePaymentStatus}
                >
                  <Text style={styles.paymentButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/upcomingmatches.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

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
    backgroundColor: "#121212",
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
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
    color: "darkgrey",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 10,
    width: "100%",
  },
  searchInput: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 20,
    height: 40,
    width: "100%",
  },
  searchInput2: {
    backgroundColor: "grey",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 20,
    height: 40,
    width: "100%",
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
  },
  bookingText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)", // Semi-transparent background
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
    fontSize: 20,
    color: "#005B41",
    marginBottom: 15,
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#005B41", // Highlight color for selected options
  },
  buttonText: {
    fontSize: 14,
    color: "#fff",
  },
  handLabel: {
    fontSize: 16,
    color: "#bbb", // Softer color for the label text
    marginBottom: 5,
    fontWeight: "bold",
    marginHorizontal: 10,
    marginTop: 8,
  },
  paymentButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    padding: 10,
    width: 150,
    alignItems: "center",
    marginTop: 20,
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 10,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginTop: 10,
    marginBottom: 20,
  },
  closeButtonText: {
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
    paddingRight: 5,
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