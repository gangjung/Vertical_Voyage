// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { manageElevators as defaultManageElevators, type AlgorithmInput, type ElevatorCommand } from '@/ai/elevator-algorithm';
import type { PassengerManifest } from '@/ai/passenger-scenarios';

// --- TYPE DEFINITIONS (also exported for custom algorithm use) ---
export type { AlgorithmInput, ElevatorCommand };

export interface Person {
  id: number;
  originFloor: number;
  destinationFloor: number;
  spawnTime: number;
  pickupTime?: number; // Time when picked up by an elevator
}

export interface ElevatorState {
  id: number;
  floor: number;
  direction: 'up' | 'down' | 'idle';
  passengers: Person[];
  distanceTraveled: number;
}

export interface SimulationState {
  currentTime: number;
  elevators: ElevatorState[];
  waitingPassengers: Person[][];
}

export interface Stats {
  totalPassengersServed: number;
  totalWaitTime: number;
  averageWaitTime: number;
  totalTravelTime: number;
  averageTravelTime: number;
  totalJourneyTime: number;
  averageJourneyTime: number;
  totalOperatingTime: number;
  totalDistanceTraveled: number;
}


// --- CONSTANTS ---
const TICK_INTERVAL_MS = 1000;


// --- HELPER FUNCTION: CORE ELEVATOR LOGIC ---
const processElevatorTick = (
  elevator: ElevatorState,
  waitingPassengers: Person[][],
  numFloors: number,
  elevatorCapacity: number,
  command: ElevatorCommand,
  currentTime: number
): { updatedElevator: ElevatorState; updatedWaiting: Person[][]; droppedOffPassengers: Person[] } => {
  let newElevator = { ...elevator, passengers: [...elevator.passengers] };
  let newWaiting = waitingPassengers.map(f => [...f]);
  const initialFloor = newElevator.floor;

  // 1. Drop off passengers at the current floor
  const droppedOffPassengers = newElevator.passengers.filter(
    p => p.destinationFloor === newElevator.floor
  );
  newElevator.passengers = newElevator.passengers.filter(
    p => p.destinationFloor !== newElevator.floor
  );

  // 2. Pick up passengers from the current floor
  const currentFloorWaiting = [...newWaiting[newElevator.floor]];
  const passengersNotPickedUp: Person[] = [];
  
  for (const person of currentFloorWaiting) {
    if (newElevator.passengers.length < elevatorCapacity) {
      const wantsToGoUp = person.destinationFloor > newElevator.floor;
      const wantsToGoDown = person.destinationFloor < newElevator.floor;

      if (
        newElevator.passengers.length === 0 ||
        (command === 'up' && wantsToGoUp) ||
        (command === 'down' && wantsToGoDown) ||
        command === 'idle' // Pick up if idle and someone is waiting on this floor
      ) {
        const pickedUpPerson: Person = { ...person, pickupTime: currentTime };
        newElevator.passengers.push(pickedUpPerson);
      } else {
        passengersNotPickedUp.push(person);
      }
    } else {
      passengersNotPickedUp.push(person);
    }
  }
  newWaiting[newElevator.floor] = passengersNotPickedUp;
  
  // 3. Update direction based on the command from the algorithm
  newElevator.direction = command;

  // 4. Move the elevator based on the new direction
  if (newElevator.direction === 'up' && newElevator.floor < numFloors - 1) {
    newElevator.floor++;
  } else if (newElevator.direction === 'down' && newElevator.floor > 0) {
    newElevator.floor--;
  }

  // 5. Update distance traveled if floor changed
  if(newElevator.floor !== initialFloor) {
    newElevator.distanceTraveled++;
  }

  return { updatedElevator: newElevator, updatedWaiting: newWaiting, droppedOffPassengers };
};


// --- MAIN HOOK ---
export function useElevatorSimulation(
  numFloors: number,
  elevatorCapacity: number,
  numElevators: number,
  passengerManifest: PassengerManifest,
  customManageElevators?: (input: AlgorithmInput) => ElevatorCommand[]
) {
  const [isRunning, setIsRunning] = useState(false);

  const getInitialState = useCallback(() => {
    return {
      state: {
        currentTime: 0,
        elevators: Array.from({ length: numElevators }, (_, i) => ({
          id: i + 1,
          floor: 0,
          direction: 'idle',
          passengers: [],
          distanceTraveled: 0,
        })),
        waitingPassengers: Array.from({ length: numFloors }, () => []),
      },
      stats: {
        totalPassengersServed: 0,
        totalWaitTime: 0,
        averageWaitTime: 0,
        totalTravelTime: 0,
        averageTravelTime: 0,
        totalJourneyTime: 0,
        averageJourneyTime: 0,
        totalOperatingTime: 0,
        totalDistanceTraveled: 0,
      }
    }
  }, [numFloors, numElevators]);

  const [simulation, setSimulation] = useState<{ state: SimulationState, stats: Stats }>(getInitialState());

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setSimulation(prevSimulation => {
      // Prevent one last tick after finishing
      if (prevSimulation.stats.totalOperatingTime > 0) {
        return prevSimulation;
      }

      const prevState = prevSimulation.state;
      const prevStats = prevSimulation.stats;
      const currentTime = prevState.currentTime + 1;
      const manageElevators = customManageElevators || defaultManageElevators;

      // 1. Passenger Generation from Manifest
      let newWaitingPassengers = prevState.waitingPassengers.map(fp => [...fp]);
      const passengersToSpawn = passengerManifest.filter(p => p.spawnTime === currentTime);

      if (passengersToSpawn.length > 0) {
        for (const person of passengersToSpawn) {
          newWaitingPassengers[person.originFloor].push(person);
        }
      }

      // 2. Call the active algorithm to get commands
      const algorithmInput: AlgorithmInput = {
        currentTime: currentTime,
        elevators: prevState.elevators,
        waitingPassengers: newWaitingPassengers,
        numFloors: numFloors,
        elevatorCapacity: elevatorCapacity,
      };
      
      let commands: ElevatorCommand[];
      try {
        commands = manageElevators(algorithmInput);
        if (!Array.isArray(commands) || commands.length !== numElevators) {
            console.error(`Algorithm must return an array with ${numElevators} commands. Reverting to idle.`);
            commands = Array(numElevators).fill('idle');
        }
      } catch (e) {
          console.error("Error executing custom algorithm:", e);
          commands = Array(numElevators).fill('idle'); // Failsafe
      }
      
      // 3. Process Elevators based on commands
      let processedWaiting = newWaitingPassengers;
      const updatedElevators: ElevatorState[] = [];
      const allDroppedOff: Person[] = [];

      prevState.elevators.forEach((elevator, index) => {
        const command = commands[index];
        const { updatedElevator, updatedWaiting, droppedOffPassengers } =
          processElevatorTick(elevator, processedWaiting, numFloors, elevatorCapacity, command, currentTime);
        
        updatedElevators.push(updatedElevator);
        processedWaiting = updatedWaiting;
        allDroppedOff.push(...droppedOffPassengers);
      });

      // 4. Update Stats for dropped off passengers
      let { 
        totalPassengersServed: newTotalPassengersServed,
        totalWaitTime: newTotalWaitTime,
        totalTravelTime: newTotalTravelTime,
        totalJourneyTime: newTotalJourneyTime,
        totalOperatingTime: newTotalOperatingTime
      } = prevStats;

      if (allDroppedOff.length > 0) {
        newTotalPassengersServed += allDroppedOff.length;
        for (const p of allDroppedOff) {
          const waitTime = (p.pickupTime ?? currentTime) - p.spawnTime;
          const travelTime = currentTime - (p.pickupTime ?? currentTime);
          const journeyTime = currentTime - p.spawnTime;
          newTotalWaitTime += waitTime;
          newTotalTravelTime += travelTime;
          newTotalJourneyTime += journeyTime;
        }
      }
      
      const newAverageWaitTime = newTotalPassengersServed > 0 ? newTotalWaitTime / newTotalPassengersServed : 0;
      const newAverageTravelTime = newTotalPassengersServed > 0 ? newTotalTravelTime / newTotalPassengersServed : 0;
      const newAverageJourneyTime = newTotalPassengersServed > 0 ? newTotalJourneyTime / newTotalPassengersServed : 0;

      // Check if the simulation is complete
      if (newTotalPassengersServed === passengerManifest.length && newTotalOperatingTime === 0) {
          newTotalOperatingTime = currentTime;
      }
      
      const newTotalDistanceTraveled = updatedElevators.reduce((sum, e) => sum + e.distanceTraveled, 0);


      // 5. Return new state and stats
      return {
        state: {
          currentTime: currentTime,
          elevators: updatedElevators,
          waitingPassengers: processedWaiting,
        },
        stats: {
          totalPassengersServed: newTotalPassengersServed,
          totalWaitTime: newTotalWaitTime,
          averageWaitTime: newAverageWaitTime,
          totalTravelTime: newTotalTravelTime,
          averageTravelTime: newAverageTravelTime,
          totalJourneyTime: newTotalJourneyTime,
          averageJourneyTime: newAverageJourneyTime,
          totalOperatingTime: newTotalOperatingTime,
          totalDistanceTraveled: newTotalDistanceTraveled
        }
      };
    });
  }, [numFloors, elevatorCapacity, customManageElevators, passengerManifest, numElevators]);
  
  const start = () => {
    if (simulation.stats.totalOperatingTime > 0) {
      reset();
      // Need to start after reset has taken effect.
      // A small timeout is a simple way to achieve this.
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

  // Effect to reset the simulation when the algorithm or parameters change
  useEffect(() => {
    reset();
  }, [customManageElevators, numFloors, elevatorCapacity, numElevators, passengerManifest, reset]);

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

  // When simulation finishes, stop it
  useEffect(() => {
    if (simulation.stats.totalOperatingTime > 0) {
      setIsRunning(false);
    }
  }, [simulation.stats.totalOperatingTime]);
  
  return { ...simulation, isRunning, start, pause, reset };
}
