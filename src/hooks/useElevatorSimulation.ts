// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { manageElevators, type AlgorithmInput, type ElevatorCommand } from '@/ai/elevator-algorithm';

// --- TYPE DEFINITIONS ---
export interface Person {
  id: number;
  originFloor: number;
  destinationFloor: number;
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


// --- CONSTANTS ---
const TICK_INTERVAL_MS = 1000;
const PASSENGER_SPAWN_PROBABILITY_PER_TICK_PER_FLOOR = 0.08;
const MAX_PASSENGERS_PER_FLOOR_WAITING = 5;
let nextPersonId = 1;


// --- HELPER FUNCTION: CORE ELEVATOR LOGIC ---
const processElevatorTick = (
  elevator: ElevatorState,
  waitingPassengers: Person[][],
  numFloors: number,
  elevatorCapacity: number,
  command: ElevatorCommand
): { updatedElevator: ElevatorState; updatedWaiting: Person[][] } => {
  let newElevator = { ...elevator, passengers: [...elevator.passengers] };
  let newWaiting = waitingPassengers.map(f => [...f]);
  const initialFloor = newElevator.floor;

  // 1. Drop off passengers at the current floor
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

      // Pick up conditions:
      // - The elevator is empty, it can take anyone.
      // - The elevator is commanded to go UP, and the person wants to go UP.
      // - The elevator is commanded to go DOWN, and the person wants to go DOWN.
      if (
        newElevator.passengers.length === 0 ||
        (command === 'up' && wantsToGoUp) ||
        (command === 'down' && wantsToGoDown)
      ) {
        newElevator.passengers.push(person);
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
  // If direction is 'idle', it doesn't move.

  // 5. Update distance traveled if floor changed
  if(newElevator.floor !== initialFloor) {
    newElevator.distanceTraveled++;
  }

  return { updatedElevator: newElevator, updatedWaiting: newWaiting };
};


// --- MAIN HOOK ---
export function useElevatorSimulation(numFloors: number, elevatorCapacity: number): SimulationState {
  const [state, setState] = useState<SimulationState>({
    currentTime: 0,
    elevator1: { id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
    elevator2: { id: 2, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 },
    waitingPassengers: Array.from({ length: numFloors }, () => []),
  });

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setState(prevState => {
      // 1. Passenger Generation
      let newWaitingPassengers = prevState.waitingPassengers.map(fp => [...fp]);
      for (let floorIdx = 0; floorIdx < numFloors; floorIdx++) {
        if (newWaitingPassengers[floorIdx].length < MAX_PASSENGERS_PER_FLOOR_WAITING && Math.random() < PASSENGER_SPAWN_PROBABILITY_PER_TICK_PER_FLOOR) {
          let destinationFloor;
          do {
            destinationFloor = Math.floor(Math.random() * numFloors);
          } while (destinationFloor === floorIdx);

          newWaitingPassengers[floorIdx].push({
            id: nextPersonId++,
            originFloor: floorIdx,
            destinationFloor: destinationFloor,
          });
        }
      }

      // 2. Call the user-defined algorithm to get commands
      const algorithmInput: AlgorithmInput = {
        currentTime: prevState.currentTime,
        elevators: [prevState.elevator1, prevState.elevator2],
        waitingPassengers: newWaitingPassengers,
        numFloors: numFloors,
        elevatorCapacity: elevatorCapacity,
      };
      const commands = manageElevators(algorithmInput);
      const [command1, command2] = commands;


      // 3. Process Elevators based on commands
      // Note: We process them sequentially. The waiting list is updated after each elevator.
      // This means the second elevator has slightly more up-to-date info on waiting passengers.
      const { updatedElevator: elevator1, updatedWaiting: waitingAfterE1 } =
        processElevatorTick(prevState.elevator1, newWaitingPassengers, numFloors, elevatorCapacity, command1);

      const { updatedElevator: elevator2, updatedWaiting: waitingAfterE2 } =
        processElevatorTick(prevState.elevator2, waitingAfterE1, numFloors, elevatorCapacity, command2);


      // 4. Return new state
      return {
        currentTime: prevState.currentTime + 1,
        elevator1,
        elevator2,
        waitingPassengers: waitingAfterE2,
      };
    });
  }, [numFloors, elevatorCapacity]);

  useEffect(() => {
    simulationIntervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [tick]);

  return state;
}
