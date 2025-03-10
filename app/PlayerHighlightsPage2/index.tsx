import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, collection, getDocs, query, where } from 'firebase/firestore';

export default function PlayerHighlightsScreen() {
  const router = useRouter();
  const { match_id, player_id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Highlights</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

      </ScrollView>

      {/* Fancy Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerDrills')}>
          <Image
            source={require('@/assets/images/drills.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerFitness')}>
          <Image
            source={require('@/assets/images/fitness.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerHomePage')}>
          <Image
            source={require('@/assets/images/home.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerCommunity')}>
          <Image
            source={require('@/assets/images/group.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require('@/assets/images/cloud.png')} // Replace with your home icon URL
              style={styles.navIcon}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerSettings')}>
          <Image
            source={require('@/assets/images/settings.png')} // Replace with your settings icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Light grayish background for a professional look
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 20,
    backgroundColor: '#005B41', // Header background color
  },
  backIcon: {
    width: 24,
    height: 24,
    marginLeft: 15,
    tintColor: '#fff',
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight:30,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Add extra padding to avoid content being hidden behind the navbar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: 'white',
  },
  videoContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Adds shadow for Android
    width: '90%', // Ensures video container covers 100% of the screen width
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  videoTitle2: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginBottom: 10,
    color: 'white',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9, // Set a 16:9 aspect ratio for responsive video scaling
    borderRadius: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e', // Dark navbar background
    paddingVertical: 7,
    borderTopLeftRadius: 50, // Extra rounded top corners for a sleek look
    borderTopRightRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal:20,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  navIcon: {
    width: 25, // Slightly larger icons
    height: 25,
    tintColor: '#fff', // Light icon color
  },
  highlight: {
    position: 'absolute',
    bottom: 30, // Slightly raised pop-up effect
    backgroundColor: '#005B41', // Teal highlight
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676', // Bright shadow effect for the highlight
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#1e1e1e',  // Darker border color for contrast
    borderWidth: 5,
  },
});