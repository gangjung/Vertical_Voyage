// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { manageElevators as defaultManageElevators, type AlgorithmInput, type ElevatorCommand } from '@/ai/elevator-algorithm';
import { PASSENGER_MANIFEST } from '@/ai/passenger-manifest';

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
  elevator1: ElevatorState;
  elevator2: ElevatorState;
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
  customManageElevators?: (input: AlgorithmInput) => ElevatorCommand[]
): { state: SimulationState, stats: Stats } {

  const getInitialState = useCallback(() => {
    return {
      state: {
        currentTime: 0,
        elevator1: { id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
        elevator2: { id: 2, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
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
  }, [numFloors]);

  const [simulation, setSimulation] = useState<{ state: SimulationState, stats: Stats }>(getInitialState());

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to reset the simulation when the algorithm or parameters change
  useEffect(() => {
    setSimulation(getInitialState());
  }, [customManageElevators, numFloors, elevatorCapacity, getInitialState]);


  const tick = useCallback(() => {
    // Stop the simulation if it's finished
    if (simulation.stats.totalOperatingTime > 0) {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
        }
        return;
    }

    setSimulation(prevSimulation => {
      const prevState = prevSimulation.state;
      const prevStats = prevSimulation.stats;
      const currentTime = prevState.currentTime + 1;
      const manageElevators = customManageElevators || defaultManageElevators;

      // 1. Passenger Generation from Manifest
      let newWaitingPassengers = prevState.waitingPassengers.map(fp => [...fp]);
      const passengersToSpawn = PASSENGER_MANIFEST.filter(p => p.spawnTime === currentTime);

      if (passengersToSpawn.length > 0) {
        for (const person of passengersToSpawn) {
          newWaitingPassengers[person.originFloor].push(person);
        }
      }

      // 2. Call the active algorithm to get commands
      const algorithmInput: AlgorithmInput = {
        currentTime: currentTime,
        elevators: [prevState.elevator1, prevState.elevator2],
        waitingPassengers: newWaitingPassengers,
        numFloors: numFloors,
        elevatorCapacity: elevatorCapacity,
      };
      
      let commands: ElevatorCommand[];
      try {
        commands = manageElevators(algorithmInput);
        if (!Array.isArray(commands) || commands.length !== 2) {
            console.error("Algorithm must return an array with 2 commands. Reverting to idle.");
            commands = ['idle', 'idle'];
        }
      } catch (e) {
          console.error("Error executing custom algorithm:", e);
          commands = ['idle', 'idle']; // Failsafe
      }
      const [command1, command2] = commands;


      // 3. Process Elevators based on commands
      const { updatedElevator: elevator1, updatedWaiting: waitingAfterE1, droppedOffPassengers: droppedE1 } =
        processElevatorTick(prevState.elevator1, newWaitingPassengers, numFloors, elevatorCapacity, command1, currentTime);

      const { updatedElevator: elevator2, updatedWaiting: waitingAfterE2, droppedOffPassengers: droppedE2 } =
        processElevatorTick(prevState.elevator2, waitingAfterE1, numFloors, elevatorCapacity, command2, currentTime);

      // 4. Update Stats for dropped off passengers
      const allDroppedOff = [...droppedE1, ...droppedE2];
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
      if (newTotalPassengersServed === PASSENGER_MANIFEST.length && newTotalOperatingTime === 0) {
          newTotalOperatingTime = currentTime;
      }
      
      const newTotalDistanceTraveled = elevator1.distanceTraveled + elevator2.distanceTraveled;


      // 5. Return new state and stats
      return {
        state: {
          currentTime: currentTime,
          elevator1,
          elevator2,
          waitingPassengers: waitingAfterE2,
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
  }, [numFloors, elevatorCapacity, customManageElevators, defaultManageElevators, simulation.stats.totalOperatingTime]);

  useEffect(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    simulationIntervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [tick]);

  return simulation;
}
