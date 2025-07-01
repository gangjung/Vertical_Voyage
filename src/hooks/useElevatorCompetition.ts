// hooks/useElevatorCompetition.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { manageElevator as defaultManageElevator, type CompetitionAlgorithmInput, type ElevatorCommand } from '@/ai/competition-algorithm';
import type { PassengerManifest } from '@/ai/passenger-scenarios';

// --- TYPE DEFINITIONS ---
export type { CompetitionAlgorithmInput, ElevatorCommand };

export interface Person {
  id: number;
  originFloor: number;
  destinationFloor: number;
  spawnTime: number;
  pickupTime?: number;
  servedBy?: 'A' | 'B';
}

export interface ElevatorState {
  id: number; // 1 for A, 2 for B
  floor: number;
  direction: 'up' | 'down' | 'idle';
  passengers: Person[];
  distanceTraveled: number;
}

export interface CompetitionState {
  currentTime: number;
  elevators: [ElevatorState, ElevatorState];
  waitingPassengers: Person[][];
}

export interface CompetitionStats {
  passengersServed: [number, number]; // [A, B]
  distanceTraveled: [number, number]; // [A, B]
  totalOperatingTime: number;
  winner: 'A' | 'B' | 'Draw' | null;
}

// --- CONSTANTS ---
const TICK_INTERVAL_MS = 250;

// --- MAIN HOOK ---
export function useElevatorCompetition(
  numFloors: number,
  elevatorCapacity: number,
  passengerManifest: PassengerManifest,
  algorithmA?: (input: CompetitionAlgorithmInput) => ElevatorCommand,
  algorithmB?: (input: CompetitionAlgorithmInput) => ElevatorCommand
) {
  const [isRunning, setIsRunning] = useState(false);

  const getInitialState = useCallback(() => {
    return {
      state: {
        currentTime: 0,
        elevators: [
          { id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
          { id: 2, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
        ] as [ElevatorState, ElevatorState],
        waitingPassengers: Array.from({ length: numFloors }, () => []),
      },
      stats: {
        passengersServed: [0, 0] as [number, number],
        distanceTraveled: [0, 0] as [number, number],
        totalOperatingTime: 0,
        winner: null,
      }
    };
  }, [numFloors]);

  const [simulation, setSimulation] = useState(getInitialState());
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setSimulation(prev => {
      if (prev.stats.winner) return prev;

      let { state: prevState, stats: prevStats } = prev;
      const currentTime = prevState.currentTime + 1;
      const manageA = algorithmA || defaultManageElevator;
      const manageB = algorithmB || defaultManageElevator;

      // 1. Passenger Generation
      let newWaiting = prevState.waitingPassengers.map(f => [...f]);
      const passengersToSpawn = passengerManifest.filter(p => p.spawnTime === currentTime);
      passengersToSpawn.forEach(p => newWaiting[p.originFloor].push(p));

      // 2. Get Commands from Algorithms
      const waitingCalls = newWaiting.map(floor => floor.length > 0);
      const inputA: CompetitionAlgorithmInput = { currentTime, myElevator: prevState.elevators[0], waitingCalls, numFloors, elevatorCapacity };
      const inputB: CompetitionAlgorithmInput = { currentTime, myElevator: prevState.elevators[1], waitingCalls, numFloors, elevatorCapacity };
      const commandA = manageA(inputA);
      const commandB = manageB(inputB);

      // 3. Process Tick for both elevators (drop-offs, moves)
      let tempElevators = prevState.elevators.map(e => ({ ...e, passengers: [...e.passengers] }));
      let droppedOffA: Person[] = [];
      let droppedOffB: Person[] = [];

      // Drop-offs
      droppedOffA = tempElevators[0].passengers.filter(p => p.destinationFloor === tempElevators[0].floor);
      tempElevators[0].passengers = tempElevators[0].passengers.filter(p => p.destinationFloor !== tempElevators[0].floor);
      droppedOffB = tempElevators[1].passengers.filter(p => p.destinationFloor === tempElevators[1].floor);
      tempElevators[1].passengers = tempElevators[1].passengers.filter(p => p.destinationFloor !== tempElevators[1].floor);

      // 4. Handle Pickups (the tricky part)
      const floorsWithPickups = new Set([...prevState.elevators.map(e => e.floor)]);
      floorsWithPickups.forEach(floor => {
        const atFloorA = tempElevators[0].floor === floor;
        const atFloorB = tempElevators[1].floor === floor;
        const waitingAtFloor = [...newWaiting[floor]];
        if (waitingAtFloor.length === 0) return;

        let availablePickers: (ElevatorState & { command: ElevatorCommand })[] = [];
        if (atFloorA) availablePickers.push({ ...tempElevators[0], command: commandA });
        if (atFloorB) availablePickers.push({ ...tempElevators[1], command: commandB });
        
        const passengersLeftOnFloor: Person[] = [];

        waitingAtFloor.forEach(person => {
          const wantsUp = person.destinationFloor > floor;
          const wantsDown = person.destinationFloor < floor;
          
          let potentialPickers = availablePickers.filter(e => {
            const hasSpace = e.passengers.length < elevatorCapacity;
            if (!hasSpace) return false;
            // Can pickup if idle, or moving in the same direction passenger wants
            return e.command === 'idle' || (e.command === 'up' && wantsUp) || (e.command === 'down' && wantsDown);
          });
          
          if (potentialPickers.length > 0) {
            // Randomly choose one of the potential elevators
            const picker = potentialPickers[Math.floor(Math.random() * potentialPickers.length)];
            const elevatorToUpdate = tempElevators.find(e => e.id === picker.id)!;
            elevatorToUpdate.passengers.push({ ...person, pickupTime: currentTime, servedBy: picker.id === 1 ? 'A' : 'B' });
          } else {
            passengersLeftOnFloor.push(person);
          }
        });
        newWaiting[floor] = passengersLeftOnFloor;
      });

      // 5. Move Elevators
      [tempElevators[0], tempElevators[1]].forEach((e, i) => {
          const command = i === 0 ? commandA : commandB;
          const initialFloor = e.floor;
          e.direction = command;
          if (command === 'up' && e.floor < numFloors - 1) e.floor++;
          if (command === 'down' && e.floor > 0) e.floor--;
          if (e.floor !== initialFloor) e.distanceTraveled++;
      });
      
      // 6. Update Stats
      let newStats = { ...prevStats };
      let servedA = [...droppedOffA];
      let servedB = [...droppedOffB];
      newStats.passengersServed = [prevStats.passengersServed[0] + servedA.length, prevStats.passengersServed[1] + servedB.length];
      newStats.distanceTraveled = [tempElevators[0].distanceTraveled, tempElevators[1].distanceTraveled];
      
      // 7. Check for winner
      const totalServed = newStats.passengersServed[0] + newStats.passengersServed[1];
      if (totalServed === passengerManifest.length && !newStats.winner) {
          newStats.totalOperatingTime = currentTime;
          const [servedA, servedB] = newStats.passengersServed;
          const [distA, distB] = newStats.distanceTraveled;
          if (servedA > servedB) newStats.winner = 'A';
          else if (servedB > servedA) newStats.winner = 'B';
          else { // Tie-break with distance
              if (distA < distB) newStats.winner = 'A';
              else if (distB < distA) newStats.winner = 'B';
              else newStats.winner = 'Draw';
          }
      }

      return {
        state: {
          currentTime,
          elevators: tempElevators as [ElevatorState, ElevatorState],
          waitingPassengers: newWaiting,
        },
        stats: newStats
      };
    });
  }, [algorithmA, algorithmB, passengerManifest, numFloors, elevatorCapacity]);
  
  const start = () => {
    if (simulation.stats.winner) {
      reset();
      setTimeout(() => setIsRunning(true), 50);
    } else {
      setIsRunning(true);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = useCallback(() => {
    setIsRunning(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulation(getInitialState());
  }, [getInitialState]);

  // Reset when main parameters change
  useEffect(() => {
    reset();
  }, [algorithmA, algorithmB, passengerManifest, reset]);

  // Main timer effect
  useEffect(() => {
    if (isRunning) {
      simulationIntervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isRunning, tick]);

  // Stop simulation if finished
  useEffect(() => {
    if (simulation.stats.winner) {
      setIsRunning(false);
    }
  }, [simulation.stats.winner]);


  return { ...simulation, isRunning, start, pause, reset };
}
