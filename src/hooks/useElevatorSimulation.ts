// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { manageElevators as defaultManageElevators, type AlgorithmInput, type ElevatorCommand } from '@/ai/elevator-algorithm';

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
}


// --- CONSTANTS ---
const TICK_INTERVAL_MS = 1000;
const PASSENGER_SPAWN_PROBABILITY_PER_TICK_PER_FLOOR = 0.08;
const MAX_PASSENGERS_PER_FLOOR_WAITING = 5;


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

  const nextPersonId = useRef(1);
  
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
    setSimulation(prevSimulation => {
      const prevState = prevSimulation.state;
      const prevStats = prevSimulation.stats;
      const currentTime = prevState.currentTime;
      const manageElevators = customManageElevators || defaultManageElevators;

      // 1. Passenger Generation
      let newWaitingPassengers = prevState.waitingPassengers.map(fp => [...fp]);
      if(currentTime > 0) { // Don't spawn on the first tick
        for (let floorIdx = 0; floorIdx < numFloors; floorIdx++) {
          if (newWaitingPassengers[floorIdx].length < MAX_PASSENGERS_PER_FLOOR_WAITING && Math.random() < PASSENGER_SPAWN_PROBABILITY_PER_TICK_PER_FLOOR) {
            let destinationFloor;
            do {
              destinationFloor = Math.floor(Math.random() * numFloors);
            } while (destinationFloor === floorIdx);

            newWaitingPassengers[floorIdx].push({
              id: nextPersonId.current++,
              originFloor: floorIdx,
              destinationFloor: destinationFloor,
              spawnTime: currentTime,
            });
          }
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
      let newTotalPassengersServed = prevStats.totalPassengersServed;
      let newTotalWaitTime = prevStats.totalWaitTime;

      if (allDroppedOff.length > 0) {
        newTotalPassengersServed += allDroppedOff.length;
        for (const p of allDroppedOff) {
          const waitTime = (p.pickupTime ?? p.spawnTime) - p.spawnTime;
          newTotalWaitTime += waitTime;
        }
      }
      
      const newAverageWaitTime = newTotalPassengersServed > 0 ? newTotalWaitTime / newTotalPassengersServed : 0;


      // 5. Return new state and stats
      return {
        state: {
          currentTime: currentTime + 1,
          elevator1,
          elevator2,
          waitingPassengers: waitingAfterE2,
        },
        stats: {
          totalPassengersServed: newTotalPassengersServed,
          totalWaitTime: newTotalWaitTime,
          averageWaitTime: newAverageWaitTime,
        }
      };
    });
  }, [numFloors, elevatorCapacity, customManageElevators, defaultManageElevators]);

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
