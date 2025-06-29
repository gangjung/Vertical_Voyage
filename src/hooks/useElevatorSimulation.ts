// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

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
  elevatorCapacity: number
): { updatedElevator: ElevatorState; updatedWaiting: Person[][] } => {
  let newElevator = { ...elevator, passengers: [...elevator.passengers] };
  let newWaiting = waitingPassengers.map(f => [...f]);

  // 1. Drop off passengers
  newElevator.passengers = newElevator.passengers.filter(
    p => p.destinationFloor !== newElevator.floor
  );

  // 2. Pick up passengers
  const currentFloorWaiting = [...newWaiting[newElevator.floor]];
  const passengersNotPickedUp: Person[] = [];
  
  for (const person of currentFloorWaiting) {
    if (newElevator.passengers.length < elevatorCapacity) {
      const wantsToGoUp = person.destinationFloor > newElevator.floor;
      if (
        newElevator.direction === 'idle' ||
        (newElevator.direction === 'up' && wantsToGoUp) ||
        (newElevator.direction === 'down' && !wantsToGoUp)
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

  // 3. Determine next direction and move
  const hasPassengers = newElevator.passengers.length > 0;
  const isAnyoneWaiting = newWaiting.some(floor => floor.length > 0);

  if (!hasPassengers && !isAnyoneWaiting) {
    newElevator.direction = 'idle';
  } else {
    // Determine target floors for passengers and waiting people
    const passengerDestinations = newElevator.passengers.map(p => p.destinationFloor);
    const waitingFloors = newWaiting.reduce((acc, floor, idx) => {
      if (floor.length > 0) acc.push(idx);
      return acc;
    }, [] as number[]);

    // If at boundaries, must reverse
    if (newElevator.floor === numFloors - 1 && newElevator.direction === 'up') newElevator.direction = 'down';
    if (newElevator.floor === 0 && newElevator.direction === 'down') newElevator.direction = 'up';
    
    // If idle, find a target
    if (newElevator.direction === 'idle') {
      const target = hasPassengers ? passengerDestinations[0] : waitingFloors[0];
      if (target !== undefined) {
          newElevator.direction = target > newElevator.floor ? 'up' : 'down';
      }
    }

    // Move
    if (newElevator.direction === 'up') {
      newElevator.floor = Math.min(numFloors - 1, newElevator.floor + 1);
    } else if (newElevator.direction === 'down') {
      newElevator.floor = Math.max(0, newElevator.floor - 1);
    }
  }

  return { updatedElevator: newElevator, updatedWaiting: newWaiting };
};


// --- MAIN HOOK ---
export function useElevatorSimulation(numFloors: number, elevatorCapacity: number): SimulationState {
  const [state, setState] = useState<SimulationState>({
    currentTime: 0,
    elevator1: { id: 1, floor: 0, direction: 'up', passengers: [] },
    elevator2: { id: 2, floor: numFloors -1, direction: 'down', passengers: [] },
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

      // 2. Process Elevator 1
      const { updatedElevator: elevator1, updatedWaiting: waitingAfterE1 } =
        processElevatorTick(prevState.elevator1, newWaitingPassengers, numFloors, elevatorCapacity);

      // 3. Process Elevator 2
      const { updatedElevator: elevator2, updatedWaiting: waitingAfterE2 } =
        processElevatorTick(prevState.elevator2, waitingAfterE1, numFloors, elevatorCapacity);

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
