import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function FitnessScreen() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Fitness</Text>
            </View>

            {/* Fitness Feature Buttons */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.featureContainer}>
                    <TouchableOpacity style={styles.featureButton} >
                        <Image
                            source={require('@/assets/images/workoutplans.png')} // Replace with your workout icon
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>Workout Plans</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.featureButton} >
                        <Image
                            source={require('@/assets/images/nutrition.png')} // Replace with your nutrition icon
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>Nutrition Guide</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.featureButton} >
                        <Image
                            source={require('@/assets/images/injury.png')} // Replace with your injury prevention icon
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>Injury Prevention</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.featureButton} >
                        <Image
                            source={require('@/assets/images/progress.png')} // Replace with your progress tracker icon
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>Progress Tracker</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.featureButton} >
                        <Image
                            source={require('@/assets/images/mentalfitness.png')} // Replace with your mental fitness icon
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureText}>Mental Fitness</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerDrills')}>
                    <Image
                        source={require('@/assets/images/drills.png')}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <View style={styles.navItem}>
                    <View style={styles.highlight}>
                        <Image
                            source={require('@/assets/images/fitness.png')}
                            style={styles.navIcon}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerHomePage')}>
                    <Image
                        source={require('@/assets/images/home.png')}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerCommunity')}>
                    <Image
                        source={require('@/assets/images/group.png')}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerHighlightsPage')}>
                    <Image
                        source={require('@/assets/images/cloud.png')}
                        style={styles.navIcon}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/PlayerSettings')}>
                    <Image
                        source={require('@/assets/images/settings.png')}
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
        paddingTop: 55,
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
        fontSize: 30,
        paddingRight: 35,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },

    scrollContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 100, // Add extra padding to avoid content being hidden behind the navbar
    },
    featureContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 40,
        justifyContent: 'center',
        width: '100%',
    },
    featureButton: {
        width: '42%',
        height: 150,
        backgroundColor: '#005B41',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    featureIcon: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    featureText: {
        fontSize: 15,
        paddingVertical: 5,
        fontWeight: 'bold',
        color: '#fff',
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
        paddingHorizontal: 20,
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
