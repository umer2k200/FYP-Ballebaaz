import { db } from "@/firebaseConfig";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

interface Player {
  name: string;
  player_id: string;
  team_id: string;
  battingRunsScored: number;
  battingBallsFaced: number;
  battingoversPlayed: number;
  battingOut: boolean;
  battingSixes: number;
  battingFours: number;
  battingStrikeRate: number;
  bowlingRunsConceded: number;
  bowlingOversBowled : number; 
  bowlingBallsBowled:number;
  bowlingWicketsTaken: number;
  bowlingFours: number;
  bowlingSixes: number;
  bowlingEconomyRate: number;
}

interface Team {
  captain_id: string;
  captain_name: string; //C to display
  players: string[]; 
  team_id: string;
  team_name: string; 
  battingTotalRuns: number; 
  battingoversPlayed: number;
  battingwicketsLost: number;
  battingextras: number;
  battingRunRate: number;
  bowlingOvers: number;
  bowlingRunsConceded: number;
  bowlingWicketsTaken: number;
  bowlingExtras: number;
}

export default function MatchDetailsScreen() {
  const { matchId, Team1, Team2 } = useLocalSearchParams();
  const [team1, setTeam1] = useState<Team>();
  const [team2, setTeam2] = useState<Team>();
  const [fetchComplete, setFetchComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [timer, setTimer] = useState(0);
  const [isMatchOngoing, setIsMatchOngoing] = useState(true);
  const [isModalVisible, setModalVisible] = useState(true);
  const [battingTeam, setBattingTeam] = useState<Team | null>(null);
  const [bowlingTeam, setBowlingTeam] = useState<Team | null>(null);
  const [strikerBatsman, setStrikerBatsman] = useState<Player | null>(null);
  const [nonStrikerBatsman, setNonStrikerBatsman] = useState<Player | null>(null);
  const [currentBowler, setCurrentBowler] = useState<Player | null>(null);
  const [selectBatsmanModalVisible, setSelectBatsmanModalVisible] = useState(false);
  const [selectBowlerModalVisible, setSelectBowlerModalVisible] = useState(false);
  const [byeRuns, setByeRuns] = useState(0);
  const [isByeModalVisible, setByeModalVisible] = useState(false);
  const [isWideModalVisible, setWideModalVisible] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMatchOngoing) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isMatchOngoing]);

  const formattedTimer = `${Math.floor(timer / 3600).toString().padStart(2, "0")}:${Math.floor((timer % 3600) / 60).toString().padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`;


  useEffect(() => {
    const fetchTeamsData = async () => {
      setLoading(true);
      try{
        const teamCollectionRef = collection(db, "team");
        const q1 = query(teamCollectionRef, where("team_id", "==", Team1));
        const q2 = query(teamCollectionRef, where("team_id", "==", Team2));
        const [querySnapshot1, querySnapshot2] = await Promise.all([
          getDocs(q1),
          getDocs(q2),
        ]);

        if (!querySnapshot1.empty && !querySnapshot2.empty) {
          const team1Doc = querySnapshot1.docs[0].data() as Team;
          const team2Doc = querySnapshot2.docs[0].data() as Team;
          setTeam1({
            ...team1Doc,
            battingTotalRuns: 0,
            battingoversPlayed: 0,
            battingwicketsLost: 0,
            battingextras: 0,
            battingRunRate: 0,
            bowlingOvers: 0,
            bowlingRunsConceded: 0,
            bowlingWicketsTaken: 0,
            bowlingExtras: 0,
          })
          setTeam2({
            ...team2Doc,
            battingTotalRuns: 0,
            battingoversPlayed: 0,
            battingwicketsLost: 0,
            battingextras: 0,
            battingRunRate: 0,
            bowlingOvers: 0,
            bowlingRunsConceded: 0,
            bowlingWicketsTaken: 0,
            bowlingExtras: 0,
          });
          await fetchPlayersData(team1Doc.players,team2Doc.players);
          setFetchComplete(true);
        }
      }catch(e){
        console.log('error:',e);
      }
    };

    fetchTeamsData();
  }, []);

  useEffect(() => {
    if (fetchComplete && team1 && team2) {
      // console.log("Team 1:", team1);
      // console.log("Team 2:", team2);
      // console.log("Team 1 name:", team1?.team_name);
      // console.log("Team 2 name:", team2?.team_name);
      // console.log("Team 1 players:", team1Players);
      // console.log("Team 2 players:", team2Players);
      console.log("Fetch complete");
    }
  }, [fetchComplete, team1, team2]);

  const fetchPlayersData = async (team1PlayerIds: string[],team2PlayerIds: string[]) => {
    setLoading(true);
    try{
      const playersCollectionRef = collection(db, "player");
      const team1Queries = team1PlayerIds.map((playerId) =>
        query(playersCollectionRef, where("player_id", "==", playerId))
      );
      const team2Queries = team2PlayerIds.map((playerId) =>
        query(playersCollectionRef, where("player_id", "==", playerId))
      );
      const team1Docs = await Promise.all(team1Queries.map((q) => getDocs(q)));
      const team1Data: Player[] = [];
      team1Docs.forEach((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Player;
          team1Data.push({
            name: data.name,
            player_id: data.player_id,
            team_id: data.team_id,
            battingRunsScored: 0,
            battingBallsFaced: 0,
            battingoversPlayed: 0,
            battingOut: false,
            battingSixes: 0,
            battingFours: 0,
            battingStrikeRate: 0,
            bowlingRunsConceded: 0,
            bowlingOversBowled : 0, 
            bowlingBallsBowled:0,
            bowlingWicketsTaken: 0,
            bowlingFours: 0,
            bowlingSixes: 0,
            bowlingEconomyRate: 0,
          });
        });
      });
      const team2Docs = await Promise.all(team2Queries.map((q) => getDocs(q)));
      const team2Data: Player[] = [];
      team2Docs.forEach((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Player;
          team2Data.push({
            name: data.name,
            player_id: data.player_id,
            team_id: data.team_id,
            battingRunsScored: 0,
            battingBallsFaced: 0,
            battingoversPlayed: 0,
            battingOut: false,
            battingSixes: 0,
            battingFours: 0,
            battingStrikeRate: 0,
            bowlingRunsConceded: 0,
            bowlingOversBowled : 0, 
            bowlingBallsBowled:0,
            bowlingWicketsTaken: 0,
            bowlingFours: 0,
            bowlingSixes: 0,
            bowlingEconomyRate: 0,
          });
        });
      });
      setTeam1Players(team1Data);
      setTeam2Players(team2Data);
    }catch(e){
      console.log('error:',e);
    }finally{
      setLoading(false);
    }
  };

  const handleTeamSelection = (selectedTeam: Team) => {
    setBattingTeam(selectedTeam);
    if (selectedTeam.team_id === team1?.team_id) {
      setBowlingTeam(team2!);
    } else {
      setBowlingTeam(team1!);
    }
    setModalVisible(false);
    setSelectBatsmanModalVisible(true);
  };

  const handleSelectBatsman = (player: Player) => {
    if (!strikerBatsman && !nonStrikerBatsman) {
        setStrikerBatsman(player);
    } else if (strikerBatsman && !nonStrikerBatsman) {
       setNonStrikerBatsman(player);
        setSelectBatsmanModalVisible(false);
        setSelectBowlerModalVisible(true);
    }else if (strikerBatsman && strikerBatsman.battingOut === true) {
        setStrikerBatsman(player);
        setSelectBatsmanModalVisible(false);
        if(Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 0){
          const temp = strikerBatsman;
          setStrikerBatsman(nonStrikerBatsman);
          setNonStrikerBatsman(temp);
          setSelectBowlerModalVisible(true);
        }
    }
  };

  const handleSelectBowler = (player: Player) => {
    setCurrentBowler(player);
    setSelectBowlerModalVisible(false);
    displaySelected();
  };

  const displaySelected = () => {
    console.log('Displaying ');
    console.log('Batting Team:', battingTeam?.team_name);
    console.log('Bowling Team:', bowlingTeam?.team_name);
    console.log('Striker Batsman:', strikerBatsman?.name,' - ',strikerBatsman?.battingRunsScored,' - ',strikerBatsman?.battingBallsFaced,' - ',strikerBatsman?.battingoversPlayed);
    console.log('Non-Striker Batsman:', nonStrikerBatsman?.name, ' - ',nonStrikerBatsman?.battingRunsScored, ' - ',nonStrikerBatsman?.battingBallsFaced, ' - ',nonStrikerBatsman?.battingoversPlayed);
    console.log('Current Bowler: ', currentBowler?.name, ' - ',currentBowler?.bowlingRunsConceded, ' - ',currentBowler?.bowlingWicketsTaken, ' - ', currentBowler?.bowlingBallsBowled, ' - ', currentBowler?.bowlingOversBowled);
    console.log('BattingTeam Score: ',battingTeam?.battingTotalRuns,' - ',battingTeam?.battingwicketsLost, ' - ',battingTeam?.battingoversPlayed);
    console.log('BowlingTeam Score: ',bowlingTeam?.bowlingRunsConceded, ' - ',bowlingTeam?.bowlingWicketsTaken, ' - ', bowlingTeam?.bowlingOvers);
  };

  const handlePlayerOut = () => {
    setSelectBatsmanModalVisible(true);
  };

  const handleOverFinished = () => {
    setSelectBowlerModalVisible(true);
  };

  const calculateStats = () => {
    battingTeam!.battingRunRate = (battingTeam!.battingTotalRuns / battingTeam!.battingoversPlayed);
    battingTeam!.battingRunRate = Math.round(battingTeam!.battingRunRate * 100) / 100;
    strikerBatsman!.battingStrikeRate = (strikerBatsman!.battingRunsScored / strikerBatsman!.battingBallsFaced) * 100;
    strikerBatsman!.battingStrikeRate = Math.round(strikerBatsman!.battingStrikeRate * 100) / 100;
    nonStrikerBatsman!.battingStrikeRate = (nonStrikerBatsman!.battingRunsScored / nonStrikerBatsman!.battingBallsFaced) * 100;
    nonStrikerBatsman!.battingStrikeRate = Math.round(nonStrikerBatsman!.battingStrikeRate * 100) / 100;
    currentBowler!.bowlingEconomyRate = currentBowler!.bowlingOversBowled>0?(currentBowler!.bowlingRunsConceded / currentBowler!.bowlingOversBowled): 0;
    setBattingTeam({ ...battingTeam! });
    setStrikerBatsman({ ...strikerBatsman! });
    setNonStrikerBatsman({...nonStrikerBatsman!});
    setCurrentBowler({...currentBowler!});
  };

  const callbattingAddZeroRuns =async () => {
    await battingAddZeroRuns();
    displaySelected();

  };
  const battingAddZeroRuns = async () => {
    let bool2 = false;
    try{
      //check if exists
      if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
      }
      if (!strikerBatsman) {
          alert("Error: No batsman selected.");
          return;
      }
      //check if over is finished or ball is bowled
      if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
        battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
        bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
        if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
          strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
        }
        else{
          strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
        }
        currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
        handleOverFinished();
        bool2=true;
      } else {
          battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
          bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
            strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
          }
          else{
            strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
          }
          currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
      }
      //update display stats
      battingTeam!.battingTotalRuns += 0;
      battingTeam!.battingextras += 0;
      bowlingTeam!.bowlingRunsConceded += 0;
      bowlingTeam!.bowlingExtras += 0;
      strikerBatsman!.battingRunsScored += 0;
      strikerBatsman!.battingBallsFaced += 1;
      strikerBatsman!.battingFours += 0;
      strikerBatsman!.battingSixes += 0;
      currentBowler!.bowlingRunsConceded += 0;
      currentBowler!.bowlingBallsBowled += 1;
      currentBowler!.bowlingFours += 0;
      currentBowler!.bowlingSixes += 0;
      setStrikerBatsman({ ...strikerBatsman! });
      setBattingTeam({ ...battingTeam! });
      setBowlingTeam({ ...bowlingTeam! });
      setCurrentBowler({ ...currentBowler! });
      //update local stats
      const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
      const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
      const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
      const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
      if (bowlerInTeam1) {
        bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
        bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
        bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
        bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
        bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
      } else if (bowlerInTeam2) {
          bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
      } else {
          console.warn("Bowler not found in either team.");
      }
      if (batsmanInTeam1) {
        batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
        batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
        batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
        batsmanInTeam1.battingFours = strikerBatsman.battingFours;
        batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
      } else if (batsmanInTeam2) {
          batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam2.battingFours = strikerBatsman.battingFours;
          batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
      } else {
          console.warn("Batsman not found in either team.");
      }
      setTeam1Players([...team1Players]);
      setTeam2Players([...team2Players]);

      if (battingTeam?.team_id === team1?.team_id) {
        setTeam1({ ...battingTeam! });
      } else if (battingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...battingTeam! });
      }

      if (bowlingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...bowlingTeam! });
      } else if (bowlingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...bowlingTeam! });
      }

      calculateStats();
    }
    catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
    
  };

  const callbattingAddOneRuns = async () =>{
    await battingAddOneRuns();
    displaySelected();
  };

  const battingAddOneRuns = async () =>{
    let bool2 = false;
    try{
      //check if exists
      if (!currentBowler) {
        alert("Error: No bowler selected.");
        return;
      }
      if (!strikerBatsman) {
          alert("Error: No batsman selected.");
          return;
      }
      //check if over is finished or ball is bowled
      if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
        battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
        bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
        if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
          strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
        }
        else{
          strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
        }
        currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
        handleOverFinished();
        bool2 = true;
      } else {
          battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
          bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
            strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
          }
          else{
            strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
          }
          currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
      }
      //update display stats
      battingTeam!.battingTotalRuns += 1;
      battingTeam!.battingextras += 0;
      bowlingTeam!.bowlingRunsConceded += 1;
      bowlingTeam!.bowlingExtras += 0;
      strikerBatsman!.battingRunsScored += 1;
      strikerBatsman!.battingBallsFaced += 1;
      strikerBatsman!.battingFours += 0;
      strikerBatsman!.battingSixes += 0;
      currentBowler!.bowlingRunsConceded += 1;
      currentBowler!.bowlingBallsBowled += 1;
      currentBowler!.bowlingFours += 0;
      currentBowler!.bowlingSixes += 0;
      setStrikerBatsman({ ...strikerBatsman! });
      setBattingTeam({ ...battingTeam! });
      setBowlingTeam({ ...bowlingTeam! });
      setCurrentBowler({ ...currentBowler! });
      //update local stats
      const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
      const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
      const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
      const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
      if (bowlerInTeam1) {
        bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
        bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
        bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
        bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
        bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
      } else if (bowlerInTeam2) {
          bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
      } else {
          console.warn("Bowler not found in either team.");
      }
      if (batsmanInTeam1) {
        batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
        batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
        batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
        batsmanInTeam1.battingFours = strikerBatsman.battingFours;
        batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
      } else if (batsmanInTeam2) {
          batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam2.battingFours = strikerBatsman.battingFours;
          batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
      } else {
          console.warn("Batsman not found in either team.");
      }
      setTeam1Players([...team1Players]);
      setTeam2Players([...team2Players]);
      if (battingTeam?.team_id === team1?.team_id) {
        setTeam1({ ...battingTeam! });
      } else if (battingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...battingTeam! });
      }

      if (bowlingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...bowlingTeam! });
      } else if (bowlingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...bowlingTeam! });
      }

      calculateStats();
      setBattingTeam({ ...battingTeam! });
    }catch(e){
      console.log('error:',e);
    }finally{
      if(!bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const callbattingAddTwoRuns = async () =>{
    await battingAddTwoRuns();
    displaySelected();
  };

  const battingAddTwoRuns = async () =>{
    let bool2 = false;
    try{
        //check if exists
        if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
        }
        if (!strikerBatsman) {
            alert("Error: No batsman selected.");
            return;
        }
        //check if over is finished or ball is bowled
        if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
          battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
          bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
          currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
          handleOverFinished();
          bool2 = true;
        } else {
            battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
            bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
            if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
            currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
        }
        //update display stats
        battingTeam!.battingTotalRuns += 2;
        battingTeam!.battingextras += 0;
        bowlingTeam!.bowlingRunsConceded += 2;
        bowlingTeam!.bowlingExtras += 0;
        strikerBatsman!.battingRunsScored += 2;
        strikerBatsman!.battingBallsFaced += 1;
        strikerBatsman!.battingFours += 0;
        strikerBatsman!.battingSixes += 0;
        currentBowler!.bowlingRunsConceded += 2;
        currentBowler!.bowlingBallsBowled += 1;
        currentBowler!.bowlingFours += 0;
        currentBowler!.bowlingSixes += 0;
        setStrikerBatsman({ ...strikerBatsman! });
        setBattingTeam({ ...battingTeam! });
        setBowlingTeam({ ...bowlingTeam! });
        setCurrentBowler({ ...currentBowler! });
        //update local stats
        const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
        const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
        const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
        const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
        if (bowlerInTeam1) {
          bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
        } else if (bowlerInTeam2) {
            bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
            bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
            bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
            bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
            bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
        } else {
            console.warn("Bowler not found in either team.");
        }
        if (batsmanInTeam1) {
          batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam1.battingFours = strikerBatsman.battingFours;
          batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
        } else if (batsmanInTeam2) {
            batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
            batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
            batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
            batsmanInTeam2.battingFours = strikerBatsman.battingFours;
            batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
        } else {
            console.warn("Batsman not found in either team.");
        }
        setTeam1Players([...team1Players]);
        setTeam2Players([...team2Players]);
        if (battingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...battingTeam! });
        } else if (battingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...battingTeam! });
        }

        if (bowlingTeam?.team_id === team1?.team_id) {
            setTeam1({ ...bowlingTeam! });
        } else if (bowlingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...bowlingTeam! });
        }

        calculateStats();
        setBattingTeam({...battingTeam!});
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const callbattingAddThreeRuns = async () =>{
    await battingAddThreeRuns();
    displaySelected();
  };

  const battingAddThreeRuns = async () =>{
    let bool2 = false;
    try{
        //check if exists
        if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
        }
        if (!strikerBatsman) {
            alert("Error: No batsman selected.");
            return;
        }
        //check if over is finished or ball is bowled
        if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
          battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
          bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
          currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
          handleOverFinished();
          bool2 = true;
        } else {
            battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
            bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
            if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
            currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
        }
        //update display stats
        battingTeam!.battingTotalRuns += 3;
        battingTeam!.battingextras += 0;
        bowlingTeam!.bowlingRunsConceded += 3;
        bowlingTeam!.bowlingExtras += 0;
        strikerBatsman!.battingRunsScored += 3;
        strikerBatsman!.battingBallsFaced += 1;
        strikerBatsman!.battingFours += 0;
        strikerBatsman!.battingSixes += 0;
        currentBowler!.bowlingRunsConceded += 3;
        currentBowler!.bowlingBallsBowled += 1;
        currentBowler!.bowlingFours += 0;
        currentBowler!.bowlingSixes += 0;
        setStrikerBatsman({ ...strikerBatsman! });
        setBattingTeam({ ...battingTeam! });
        setBowlingTeam({ ...bowlingTeam! });
        setCurrentBowler({ ...currentBowler! });
        //update local stats
        const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
        const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
        const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
        const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
        if (bowlerInTeam1) {
          bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
        } else if (bowlerInTeam2) {
            bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
            bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
            bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
            bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
            bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
        } else {
            console.warn("Bowler not found in either team.");
        }
        if (batsmanInTeam1) {
          batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam1.battingFours = strikerBatsman.battingFours;
          batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
        } else if (batsmanInTeam2) {
            batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
            batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
            batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
            batsmanInTeam2.battingFours = strikerBatsman.battingFours;
            batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
        } else {
            console.warn("Batsman not found in either team.");
        }
        setTeam1Players([...team1Players]);
        setTeam2Players([...team2Players]);
        if (battingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...battingTeam! });
        } else if (battingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...battingTeam! });
        }

        if (bowlingTeam?.team_id === team1?.team_id) {
            setTeam1({ ...bowlingTeam! });
        } else if (bowlingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...bowlingTeam! });
        }

        calculateStats();
        setBattingTeam({...battingTeam!});
    }catch(e){
      console.log('error:',e);
    }finally{
      if(!bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const callbattingAddFourRuns = async () =>{
    await battingAddFourRuns();
    displaySelected();
  };

  const battingAddFourRuns = async () =>{
    let bool2 = false;
    try{
        //check if exists
        if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
        }
        if (!strikerBatsman) {
            alert("Error: No batsman selected.");
            return;
        }
        //check if over is finished or ball is bowled
        if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
          battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
          bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
          currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
          handleOverFinished();
          bool2 = true;
        } else {
            battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
            bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
            if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
            currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
        }
        //update display stats
        battingTeam!.battingTotalRuns += 4;
        battingTeam!.battingextras += 0;
        bowlingTeam!.bowlingRunsConceded += 4;
        bowlingTeam!.bowlingExtras += 0;
        strikerBatsman!.battingRunsScored += 4;
        strikerBatsman!.battingBallsFaced += 1;
        strikerBatsman!.battingFours += 1;
        strikerBatsman!.battingSixes += 0;
        currentBowler!.bowlingRunsConceded += 4;
        currentBowler!.bowlingBallsBowled += 1;
        currentBowler!.bowlingFours += 1;
        currentBowler!.bowlingSixes += 0;
        setStrikerBatsman({ ...strikerBatsman! });
        setBattingTeam({ ...battingTeam! });
        setBowlingTeam({ ...bowlingTeam! });
        setCurrentBowler({ ...currentBowler! });
        //update local stats
        const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
        const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
        const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
        const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
        if (bowlerInTeam1) {
          bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
        } else if (bowlerInTeam2) {
            bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
            bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
            bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
            bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
            bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
        } else {
            console.warn("Bowler not found in either team.");
        }
        if (batsmanInTeam1) {
          batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam1.battingFours = strikerBatsman.battingFours;
          batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
        } else if (batsmanInTeam2) {
            batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
            batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
            batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
            batsmanInTeam2.battingFours = strikerBatsman.battingFours;
            batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
        } else {
            console.warn("Batsman not found in either team.");
        }
        setTeam1Players([...team1Players]);
        setTeam2Players([...team2Players]);
        if (battingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...battingTeam! });
        } else if (battingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...battingTeam! });
        }

        if (bowlingTeam?.team_id === team1?.team_id) {
            setTeam1({ ...bowlingTeam! });
        } else if (bowlingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...bowlingTeam! });
        }

        calculateStats();
        setBattingTeam({...battingTeam!});
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };
  
  const callbattingAddFiveRuns = async () =>{
    await battingAddFiveRuns();
    displaySelected();
  };

  const battingAddFiveRuns = async () =>{
    let bool2 = false;
    try{
        //check if exists
        if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
        }
        if (!strikerBatsman) {
            alert("Error: No batsman selected.");
            return;
        }
        //check if over is finished or ball is bowled
        if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
          battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
          bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
          currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
          handleOverFinished();
          bool2 = true;
        } else {
            battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
            bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
            if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
            currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
        }
        //update display stats
        battingTeam!.battingTotalRuns += 5;
        battingTeam!.battingextras += 0;
        bowlingTeam!.bowlingRunsConceded += 5;
        bowlingTeam!.bowlingExtras += 0;
        strikerBatsman!.battingRunsScored += 5;
        strikerBatsman!.battingBallsFaced += 1;
        strikerBatsman!.battingFours += 0;
        strikerBatsman!.battingSixes += 0;
        currentBowler!.bowlingRunsConceded += 5;
        currentBowler!.bowlingBallsBowled += 1;
        currentBowler!.bowlingFours += 0;
        currentBowler!.bowlingSixes += 0;
        setStrikerBatsman({ ...strikerBatsman! });
        setBattingTeam({ ...battingTeam! });
        setBowlingTeam({ ...bowlingTeam! });
        setCurrentBowler({ ...currentBowler! });
        //update local stats
        const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
        const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
        const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
        const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
        if (bowlerInTeam1) {
          bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
        } else if (bowlerInTeam2) {
            bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
            bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
            bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
            bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
            bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
        } else {
            console.warn("Bowler not found in either team.");
        }
        if (batsmanInTeam1) {
          batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam1.battingFours = strikerBatsman.battingFours;
          batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
        } else if (batsmanInTeam2) {
            batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
            batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
            batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
            batsmanInTeam2.battingFours = strikerBatsman.battingFours;
            batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
        } else {
            console.warn("Batsman not found in either team.");
        }
        setTeam1Players([...team1Players]);
        setTeam2Players([...team2Players]);
        if (battingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...battingTeam! });
        } else if (battingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...battingTeam! });
        }

        if (bowlingTeam?.team_id === team1?.team_id) {
            setTeam1({ ...bowlingTeam! });
        } else if (bowlingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...bowlingTeam! });
        }

        calculateStats();
        setBattingTeam({...battingTeam!});
    }catch(e){
      console.log('error:',e);
    }finally{
      if(!bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const callbattingAddSixRuns = async () =>{
    await battingAddSixRuns();
    displaySelected();
  };

  const battingAddSixRuns = async () =>{
    let bool2 = false;
    try{
        //check if exists
        if (!currentBowler) {
          alert("Error: No bowler selected.");
          return;
        }
        if (!strikerBatsman) {
            alert("Error: No batsman selected.");
            return;
        }
        //check if over is finished or ball is bowled
        if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
          battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
          bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) + 1;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
          currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
          handleOverFinished();
          bool2 = true;
        } else {
            battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
            bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1) * 10) / 10;
            if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
              strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
            }
            else{
              strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
            }
            currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) * 10) / 10;
        }
        //update display stats
        battingTeam!.battingTotalRuns += 6;
        battingTeam!.battingextras += 0;
        bowlingTeam!.bowlingRunsConceded += 6;
        bowlingTeam!.bowlingExtras += 0;
        strikerBatsman!.battingRunsScored += 6;
        strikerBatsman!.battingBallsFaced += 1;
        strikerBatsman!.battingFours += 0;
        strikerBatsman!.battingSixes += 1;
        currentBowler!.bowlingRunsConceded += 6;
        currentBowler!.bowlingBallsBowled += 1;
        currentBowler!.bowlingFours += 0;
        currentBowler!.bowlingSixes += 1 ;
        setStrikerBatsman({ ...strikerBatsman! });
        setBattingTeam({ ...battingTeam! });
        setBowlingTeam({ ...bowlingTeam! });
        setCurrentBowler({ ...currentBowler! });
        //update local stats
        const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
        const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
        const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman.player_id);
        const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman.player_id);
        if (bowlerInTeam1) {
          bowlerInTeam1.bowlingOversBowled = currentBowler.bowlingOversBowled;
          bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
          bowlerInTeam1.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
          bowlerInTeam1.bowlingFours = currentBowler.bowlingFours;
          bowlerInTeam1.bowlingSixes = currentBowler.bowlingSixes;
        } else if (bowlerInTeam2) {
            bowlerInTeam2.bowlingOversBowled = currentBowler.bowlingOversBowled;
            bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
            bowlerInTeam2.bowlingBallsBowled = currentBowler.bowlingBallsBowled;
            bowlerInTeam2.bowlingFours = currentBowler.bowlingFours;
            bowlerInTeam2.bowlingSixes = currentBowler.bowlingSixes;
        } else {
            console.warn("Bowler not found in either team.");
        }
        if (batsmanInTeam1) {
          batsmanInTeam1.battingRunsScored = strikerBatsman.battingRunsScored;
          batsmanInTeam1.battingBallsFaced = strikerBatsman.battingBallsFaced;
          batsmanInTeam1.battingoversPlayed = strikerBatsman.battingoversPlayed;
          batsmanInTeam1.battingFours = strikerBatsman.battingFours;
          batsmanInTeam1.battingSixes = strikerBatsman.battingSixes;
        } else if (batsmanInTeam2) {
            batsmanInTeam2.battingRunsScored = strikerBatsman.battingRunsScored;
            batsmanInTeam2.battingBallsFaced = strikerBatsman.battingBallsFaced;
            batsmanInTeam2.battingoversPlayed = strikerBatsman.battingoversPlayed;
            batsmanInTeam2.battingFours = strikerBatsman.battingFours;
            batsmanInTeam2.battingSixes = strikerBatsman.battingSixes;
        } else {
            console.warn("Batsman not found in either team.");
        }
        setTeam1Players([...team1Players]);
        setTeam2Players([...team2Players]);
        if (battingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...battingTeam! });
        } else if (battingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...battingTeam! });
        }

        if (bowlingTeam?.team_id === team1?.team_id) {
            setTeam1({ ...bowlingTeam! });
        } else if (bowlingTeam?.team_id === team2?.team_id) {
            setTeam2({ ...bowlingTeam! });
        }

        calculateStats();
        setBattingTeam({...battingTeam!});
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const  battingPlayerOut = async () =>{
    let bool2 = false;
    try{
      if (battingTeam!.battingwicketsLost === (battingTeam!.players.length - 1)) {
        Alert.alert("Match Ends: All players are out!");
        // You can also add logic here to handle the end of the match, if necessary.
        return;
      }
      if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
  
        battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
        bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) +1;
        if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
            strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
          }
          else{
            strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
          }
        currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
        bool2=true;
        handleOverFinished();
      } else {
          battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
          bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1)* 10) /10;
          if(Math.round(strikerBatsman!.battingoversPlayed* 10) %10 ===5){
            strikerBatsman!.battingoversPlayed = Math.floor(strikerBatsman!.battingoversPlayed) + 1;
          }
          else{
            strikerBatsman!.battingoversPlayed = Math.round((strikerBatsman!.battingoversPlayed + 0.1) * 10) / 10;
          }
          currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) *10 ) /10;
      }
      battingTeam!.battingwicketsLost+=1;
      bowlingTeam!.bowlingWicketsTaken+=1;
      strikerBatsman!.battingOut = true;
      strikerBatsman!.battingBallsFaced+=1;
      currentBowler!.bowlingBallsBowled+=1;
      currentBowler!.bowlingWicketsTaken+=1;
  
      const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler!.player_id);
      const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler!.player_id);
      const batsmanInTeam1 = team1Players.find(p => p.player_id === strikerBatsman!.player_id);
      const batsmanInTeam2 = team2Players.find(p => p.player_id === strikerBatsman!.player_id);
      if (bowlerInTeam1) {
        bowlerInTeam1.bowlingOversBowled = currentBowler!.bowlingOversBowled;
        bowlerInTeam1.bowlingWicketsTaken = currentBowler!.bowlingWicketsTaken;
        bowlerInTeam1.bowlingBallsBowled = currentBowler!.bowlingBallsBowled;
      } else if (bowlerInTeam2) {
        bowlerInTeam2.bowlingOversBowled = currentBowler!.bowlingOversBowled;
        bowlerInTeam2.bowlingWicketsTaken = currentBowler!.bowlingWicketsTaken;
        bowlerInTeam2.bowlingBallsBowled = currentBowler!.bowlingBallsBowled;
      } else {
          console.warn("Bowler not found in either team.");
      }
      if (batsmanInTeam1) {
        batsmanInTeam1.battingOut = strikerBatsman!.battingOut;
        batsmanInTeam1.battingBallsFaced = strikerBatsman!.battingBallsFaced;
        batsmanInTeam1.battingoversPlayed = strikerBatsman!.battingoversPlayed;
      } else if (batsmanInTeam2) {
        batsmanInTeam2.battingOut = strikerBatsman!.battingOut;
        batsmanInTeam2.battingBallsFaced = strikerBatsman!.battingBallsFaced;
        batsmanInTeam2.battingoversPlayed = strikerBatsman!.battingoversPlayed;
      } else {
          console.warn("Batsman not found in either team.");
      }
      setStrikerBatsman({...strikerBatsman!});
      setCurrentBowler({...currentBowler!});
      setTeam1Players([...team1Players]);
      setTeam2Players([...team2Players]);
      setBattingTeam({...battingTeam!});
      setBowlingTeam({...bowlingTeam!});
      if (battingTeam?.team_id === team1?.team_id) {
        setTeam1({ ...battingTeam! });
      } else if (battingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...battingTeam! });
      }
  
      if (bowlingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...bowlingTeam! });
      } else if (bowlingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...bowlingTeam! });
      }
  
      handlePlayerOut();    
      calculateStats();
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  const handleWideButtonPress = () => {
    setWideModalVisible(true);
  };

  const battingAddWideRuns = async () =>{
    let bool2 = false;
    try{
      const wideRuns = byeRuns;
      //check if exists
      if (!currentBowler) {
        alert("Error: No bowler selected.");
        return;
      }
      if (!strikerBatsman) {
          alert("Error: No batsman selected.");
          return;
      }
      
      //update display stats
      battingTeam!.battingTotalRuns += (1+wideRuns);
      battingTeam!.battingextras += (1+wideRuns);
      bowlingTeam!.bowlingRunsConceded += (1+wideRuns);
      bowlingTeam!.bowlingExtras += (1+wideRuns);
      currentBowler!.bowlingRunsConceded += (1+wideRuns);
      
      
      //update local stats
      const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
      const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
      if (bowlerInTeam1) {
        bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
      } else if (bowlerInTeam2) {
          bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
      } else {
          console.warn("Bowler not found in either team.");
      }
      setTeam1Players([...team1Players]);
      setTeam2Players([...team2Players]);
      setBattingTeam({ ...battingTeam! });
      setBowlingTeam({ ...bowlingTeam! });
      setCurrentBowler({ ...currentBowler! });
  
      if (battingTeam?.team_id === team1?.team_id) {
        setTeam1({ ...battingTeam! });
      } else if (battingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...battingTeam! });
      }
      if (bowlingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...bowlingTeam! });
      } else if (bowlingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...bowlingTeam! });
      }
      
      if(wideRuns%2!==0){
        bool2 = true;
      }
  
      calculateStats();
      setBattingTeam({...battingTeam!});
      setBowlingTeam({...bowlingTeam!});
      
      setWideModalVisible(false);
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
      displaySelected();
      setByeRuns(0);
    }
  };

  const handleByeButtonPress = () => {
    setByeModalVisible(true);
  };

  const battingAddByeRuns = () => {
    let bool2 = false;
    try{
      //check if exists
      if (!currentBowler) {
        alert("Error: No bowler selected.");
        return;
      }
      if (!strikerBatsman) {
          alert("Error: No batsman selected.");
          return;
      }
      if (Math.round(battingTeam!.battingoversPlayed * 10) % 10 === 5) {
        battingTeam!.battingoversPlayed = Math.floor(battingTeam!.battingoversPlayed) + 1;
        bowlingTeam!.bowlingOvers = Math.floor(bowlingTeam!.bowlingOvers) +1;
        currentBowler!.bowlingOversBowled = Math.floor(currentBowler!.bowlingOversBowled) + 1;
        bool2=true;
        handleOverFinished();
      } else {
          battingTeam!.battingoversPlayed = Math.round((battingTeam!.battingoversPlayed + 0.1) * 10) / 10;
          bowlingTeam!.bowlingOvers = Math.round((bowlingTeam!.bowlingOvers + 0.1)* 10) /10;
          currentBowler!.bowlingOversBowled = Math.round((currentBowler!.bowlingOversBowled + 0.1) *10 ) /10;
      }
      //update display stats
      battingTeam!.battingTotalRuns += byeRuns;
      battingTeam!.battingextras+=byeRuns;
      bowlingTeam!.bowlingRunsConceded+=byeRuns;
      bowlingTeam!.bowlingExtras+=byeRuns;
      currentBowler!.bowlingRunsConceded+=byeRuns;
      currentBowler!.bowlingBallsBowled+=1;
      //update local stats
      const bowlerInTeam1 = team1Players.find(p => p.player_id === currentBowler.player_id);
      const bowlerInTeam2 = team2Players.find(p => p.player_id === currentBowler.player_id);
      if (bowlerInTeam1) {
        bowlerInTeam1.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
      } else if (bowlerInTeam2) {
          bowlerInTeam2.bowlingRunsConceded = currentBowler.bowlingRunsConceded;
      } else {
          console.warn("Bowler not found in either team.");
      }
      setCurrentBowler({ ...currentBowler! });
      setTeam1Players([...team1Players]);
      setTeam2Players([...team2Players]);
      setBattingTeam({ ...battingTeam! });
      setBowlingTeam({ ...bowlingTeam! });
      
  
      if (battingTeam?.team_id === team1?.team_id) {
        setTeam1({ ...battingTeam! });
      } else if (battingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...battingTeam! });
      }
      if (bowlingTeam?.team_id === team1?.team_id) {
          setTeam1({ ...bowlingTeam! });
      } else if (bowlingTeam?.team_id === team2?.team_id) {
          setTeam2({ ...bowlingTeam! });
      }
      
      if(byeRuns%2!==0){
        bool2 = true;
      }
    
      calculateStats();
      setBattingTeam({...battingTeam!});
      setBowlingTeam({...bowlingTeam!});
      
      setByeModalVisible(false);
    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
      displaySelected();
      setByeRuns(0);
    }
  };

  const callbattingNoBall = async () =>{
    await battingNoBall();
    displaySelected();
  };

  const battingNoBall = async () =>{
    let bool2=false;
    try{

    }catch(e){
      console.log('error:',e);
    }finally{
      if(bool2){
        const temp=strikerBatsman!;
        setStrikerBatsman(nonStrikerBatsman!);
        setNonStrikerBatsman(temp!);
      }
    }
  };

  //final update DB
  const updateAllStats = async () => {
    setIsMatchOngoing(false);
    
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#005B41" />
        </View>
      ):(<>
      {/* Select Batsman Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Which team will bat first?</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleTeamSelection(team1!)}
            >
              <Text style={styles.modalButtonText}>{team1?.team_name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleTeamSelection(team2!)}
            >
              <Text style={styles.modalButtonText}>{team2?.team_name}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </Modal>

      {/* Modals for selecting players */}
      <Modal 
          visible={selectBatsmanModalVisible} 
          transparent={true} 
          animationType="slide" 
          onRequestClose={() => setSelectBatsmanModalVisible(false)}>
          <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Select Batsman</Text>
                  {(battingTeam?.players || []).map((playerId) => {
                      const player = team1Players.find(p => p.player_id === playerId) || 
                                    team2Players.find(p => p.player_id === playerId);
                      // Only show players who are not out
                      if (player && !player.battingOut && player.player_id !== nonStrikerBatsman?.player_id) {
                          return (

                              <TouchableOpacity
                                  key={player.player_id}
                                  style={styles.modalButton}
                                  onPress={() => handleSelectBatsman(player)}
                              >
                                  <Text style={styles.modalButtonText}>{player.name}</Text>
                              </TouchableOpacity>
                          );
                      }
                      return null;
                  })}
              </View>
          </View>
      </Modal>

      {/* Select Bowler Modal */}
      <Modal visible={selectBowlerModalVisible} transparent={true} animationType="slide" onRequestClose={() => setSelectBowlerModalVisible(false)}>
          <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalText}>Select Bowler</Text>
                  {(bowlingTeam?.players || []).map((playerId) => {
                      const player = team1Players.find(p => p.player_id === playerId) || team2Players.find(p => p.player_id === playerId);
                      
                      return (
                          <TouchableOpacity
                              key={player!.player_id}
                              style={styles.modalButton}
                              onPress={() => handleSelectBowler(player!)}
                          >
                              <Text style={styles.modalButtonText}>{player?.name}</Text>
                          </TouchableOpacity>
                      );
                  })}
              </View>
          </View>
      </Modal>

      {/* wides modal */}
      <Modal visible={isWideModalVisible} transparent={true} animationType="slide" onRequestClose={()=>setWideModalVisible(false)}>
        <View style={styles.modalContainer}><View style={styles.modalContent}>
          <Text style={styles.modalText}>Enter Extra Wide Runs:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={byeRuns.toString()}
            onChangeText={(text) => setByeRuns(Number(text))}
          />
          <TouchableOpacity onPress={battingAddWideRuns} style={styles.modalButton}>
            <Text style={styles.buttonText}>Add Wide Runs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWideModalVisible(false)} style={styles.modalButton}>
            <Text style={styles.buttonText}>Cancel</Text>

          </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* byes modal */}
      <Modal visible={isByeModalVisible} transparent={true} animationType="slide" onRequestClose={()=>setByeModalVisible(false)}>
        <View style={styles.modalContainer}><View style={styles.modalContent}>
          <Text style={styles.modalText}>Enter Bye Runs:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={byeRuns.toString()}
            onChangeText={(text) => setByeRuns(Number(text))}
          />
          <TouchableOpacity onPress={battingAddByeRuns} style={styles.modalButton}>
            <Text style={styles.buttonText}>Add Bye Runs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setByeModalVisible(false)} style={styles.modalButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header with back button and match title */}
      <View style={styles.header}>
        <Text style={styles.matchTitle}>
          {team1?.team_name} vs {team2?.team_name}
        </Text>
      </View>
      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Time: {formattedTimer}</Text>
      </View>

      {/* Match score details */}
      <View style={styles.scoreContainer}>
        <Text style={styles.teamName}>{battingTeam?.team_name}</Text>
        <Text style={styles.scoreText}>{battingTeam?.battingTotalRuns} - {battingTeam?.battingwicketsLost}</Text>
        <Text style={styles.oversText}>Overs: {battingTeam?.battingoversPlayed}/20 - Run rate: {battingTeam?.battingRunRate? battingTeam?.battingRunRate: 'N/A'}</Text>

        {/* Batting details */}
        <View style={styles.statsHeader}>
          <Text style={styles.statsText}>Batter</Text>
          <Text style={styles.statsText}>R</Text>
          <Text style={styles.statsText}>B</Text>
          <Text style={styles.statsText}>4's</Text>
          <Text style={styles.statsText}>6's</Text>
          <Text style={styles.statsText}>S.R</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>* {strikerBatsman?.name || "Not Selected"}</Text>
          <Text style={styles.statsValue}>{strikerBatsman?.battingRunsScored || 0}</Text>
          <Text style={styles.statsValue}>{strikerBatsman?.battingBallsFaced || 0}</Text>
          <Text style={styles.statsValue}>{strikerBatsman?.battingFours || 0}</Text>
          <Text style={styles.statsValue}>{strikerBatsman?.battingSixes || 0}</Text>
          <Text style={styles.statsValue}>{strikerBatsman?.battingStrikeRate || 0 }</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>{nonStrikerBatsman?.name || "Not Selected"}</Text>
          <Text style={styles.statsValue}>{nonStrikerBatsman?.battingRunsScored || 0}</Text>
          <Text style={styles.statsValue}>{nonStrikerBatsman?.battingBallsFaced || 0}</Text>
          <Text style={styles.statsValue}>{nonStrikerBatsman?.battingFours || 0}</Text>
          <Text style={styles.statsValue}>{nonStrikerBatsman?.battingSixes || 0}</Text>
          <Text style={styles.statsValue}>{nonStrikerBatsman?.battingStrikeRate || 0 }</Text>
        </View>

        {/* Bowling details */}
        <Text style={styles.teamName}>{bowlingTeam?.team_name}</Text>
        <View style={styles.statsHeader}>
          <Text style={styles.statsText}>Bowler</Text>
          <Text style={styles.statsText}>R</Text>
          <Text style={styles.statsText}>O</Text>
          <Text style={styles.statsText}>4's</Text>
          <Text style={styles.statsText}>6's</Text>
          <Text style={styles.statsText}>W</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>{currentBowler?.name || "Not Selected"}</Text>
          <Text style={styles.statsValue}>{currentBowler?.bowlingRunsConceded || 0}</Text>
          <Text style={styles.statsValue}>{currentBowler?.bowlingOversBowled || 0}</Text>
          <Text style={styles.statsValue}>{currentBowler?.bowlingFours || 0}</Text>
          <Text style={styles.statsValue}>{currentBowler?.bowlingSixes || 0}</Text>
          <Text style={styles.statsValue}>{currentBowler?.bowlingWicketsTaken || 0}</Text>
        </View>
      </View>

      {/* Scoring Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem} onPress={callbattingAddZeroRuns}>0</Text>
          <Text style={styles.gridItem} onPress={callbattingAddOneRuns}>1</Text>
          <Text style={styles.gridItem} onPress={callbattingAddTwoRuns}>2</Text>
          <Text style={styles.gridItem} onPress={callbattingAddThreeRuns}>3</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem} onPress={callbattingAddFourRuns}>4</Text>
          <Text style={styles.gridItem} onPress={callbattingAddFiveRuns}>5</Text>
          <Text style={styles.gridItem} onPress={callbattingAddSixRuns}>6</Text>
          <Text style={styles.gridItem} onPress={battingPlayerOut}>OUT</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem} onPress={handleByeButtonPress}>Bye</Text>
          <Text style={styles.gridItem}>NB</Text>
          <Text style={styles.gridItem} onPress={handleWideButtonPress}>Wide</Text>
          <Text style={styles.gridItem}>DRS</Text>
        </View>
      </View>

      {/* Record Video Button */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.recordButton} >
          <Text style={styles.recordButtonText}>End Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.recordButton2} >
          <Text style={styles.recordButtonText}>Next Innings</Text>
        </TouchableOpacity>
      </View>
      </>)}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    color:'lightgray',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#005B41",
    padding: 10,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  timerText: {
    fontSize: 18,
    color: "lightgray",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,

    paddingBottom: 10,
  },
  matchTitle: {
    fontSize: 20,
    color: "#005B41",
    marginLeft: 20,
    fontWeight: "bold",
  },
  scoreContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 40,
    padding: 20,
    marginBottom: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  oversText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  statsText: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#222",
    borderRadius: 5,
    marginBottom: 5,
  },
  batterText: {
    color: "#fff",
    flex: 2,
    fontWeight: "bold",
    textAlign: "left",
  },
  statsValue: {
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 17,
  },
  recordButton2: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 17,
  },
  recordButtonText: {
    color: "#fff",
    fontSize: 16,

    fontWeight: "bold",
  },
  recordIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
  },
  gridContainer: {
    backgroundColor: "#005B41",
    borderRadius: 50,
    padding: 15,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridItem: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    width: "22%",
    textAlign: "center",
    paddingVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    width: '20%',
    paddingHorizontal: 10,
    color: 'lightgray', // Text color
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'lightgray',
    fontSize: 16,
  },
});