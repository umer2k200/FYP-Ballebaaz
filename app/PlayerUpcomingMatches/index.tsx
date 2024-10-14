import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function UpcomingMatchesScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/PlayerHomePage')}>
        <Image source={require('@/assets/images/back.png')} style={styles.navIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Upcoming Matches</Text>

      {/* Match Container 1 */}
      <View style={styles.matchContainer}>
        <Text style={styles.matchTitle}>Thunders vs Markhors</Text>
        <Text style={styles.matchDetail}>Date: 25th September, 2024</Text>
        <Text style={styles.matchDetail}>Time: 11:00 AM</Text>
        <Text style={styles.matchDetail}>Venue: Pasban Cricket Complex</Text>
      </View>

      {/* Match Container 2 */}
      <View style={styles.matchContainer}>
        <Text style={styles.matchTitle}>United vs Qalandars</Text>
        <Text style={styles.matchDetail}>Date: 26th September, 2024</Text>
        <Text style={styles.matchDetail}>Time: 7:00 AM</Text>
        <Text style={styles.matchDetail}>Venue: E9 Cricket Ground</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  matchContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    marginBottom: 10,
  },
  matchDetail: {
    fontSize: 16,
    color: '#bbb',  // Softer color for the detail text
    marginBottom: 5,
  },
  backButton: {
    position: 'absolute',
    left: 1,
    padding: 10,
    marginTop: 15,
  },
  navIcon: {
    width: 25, // Icon size
    height: 25,
    tintColor: '#fff', // Light icon color
  },
});