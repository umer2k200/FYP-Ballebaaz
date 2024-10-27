import { Stack } from "expo-router";
import React from "react";
const RootLayout = () => {
    return (
        <Stack screenOptions={{
            headerStyle: {
                backgroundColor: '#005B41',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>
            <Stack.Screen name='index' options={{headerShown: false}} />
            <Stack.Screen name='Onboarding/index' options={{headerShown: false}} />
            <Stack.Screen name='Login/index' options={{headerShown: false}} />
            <Stack.Screen name='Signup/index' options={{headerShown: false}} />
            {/* Player */}
            <Stack.Screen name='PlayerHomePage/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerDrills/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerFitness/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerHighlightsPage/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerCommunity/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerSettings/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerSettingsAttributes/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerUpcomingMatches/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerReqTeam/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerHireCoach/index' options={{headerShown:false}} />
            <Stack.Screen name='PlayerViewMyTeam/index' options={{headerShown:false}} />
            {/* Team Owner */}
            <Stack.Screen name='TeamOwnerBookGround/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerBookGround-2/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerCommunity/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerGenerateKit/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerHighlightsPage/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerHireCoach/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerHomeScreen/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerTeamsRanking/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerUpcomingMatches/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerViewPlayers/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerDrills/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerSettings/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerAccReq/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerAttributes/index' options={{headerShown:false}} />
            <Stack.Screen name='TeamOwnerPersonalSettings/index' options={{headerShown:false}} />

            {/* Coach */}
            <Stack.Screen name='CoachHomePage/index' options={{headerShown:false}} />
            <Stack.Screen name='CoachAssignedPlayers/index' options={{headerShown:false}} />
            <Stack.Screen name='CoachManage&AssignDrills/index' options={{headerShown:false}} />
            <Stack.Screen name='CoachUpcomingTrainingSessions/index' options={{headerShown:false}} />
            <Stack.Screen name='CoachViewMyTeams/index' options={{headerShown:false}} />
            <Stack.Screen name='CoachSettings/index' options={{headerShown:false}} />

            {/* Club Owner */}
            <Stack.Screen name='ClubOwnerHomePage/index' options={{headerShown:false}} />
            <Stack.Screen name='ClubOwnerGroundBookings/index' options={{headerShown:false}} />
            <Stack.Screen name='ClubOwnerRevenue/index' options={{headerShown:false}} />
            <Stack.Screen name='ClubOwnerSettings/index' options={{headerShown:false}} />
            <Stack.Screen name='ClubOwnerUmpireBookings/index' options={{headerShown:false}} />
            <Stack.Screen name='ClubOwnerAddGround/index' options={{headerShown:false}} />

            {/* Umpire */}
            <Stack.Screen name='UmpireHome/index' options={{headerShown:false}} />
            <Stack.Screen name='UmpireSettings/index' options={{headerShown:false}} />
            <Stack.Screen name='UmpireUpcomingMatches/index' options={{headerShown:false}} />
            <Stack.Screen name='MatchDetails/index' options={{headerShown:false}} />
            <Stack.Screen name='UmpireScoring/index' options={{headerShown:false}} />
        </Stack>
    )
}
export default RootLayout;