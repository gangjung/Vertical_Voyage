// hooks/useElevatorSimulation.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Person {
  id: number;
  originFloor: number;
  destinationFloor: number;
}

export interface ElevatorSimulationState {
  currentTime: number;
  elevatorFloor: number;
  elevatorDirection: 'up' | 'down' | 'idle';
  passengersInElevator: Person[];
  waitingPassengers: Person[][];
}

const TICK_INTERVAL_MS = 1000;
const PASSENGER_SPAWN_PROBABILITY_PER_TICK_PER_FLOOR = 0.1;
const MAX_PASSENGERS_PER_FLOOR_WAITING = 5;

let nextPersonId = 1;

export function useElevatorSimulation(numFloors: number, elevatorCapacity: number) {
  const [state, setState] = useState<ElevatorSimulationState>({
    currentTime: 0,
    elevatorFloor: 0,
    elevatorDirection: 'up',
    passengersInElevator: [],
    waitingPassengers: Array.from({ length: numFloors }, () => []),
  });

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    setState(prevState => {
      let newCurrentTime = prevState.currentTime + 1;
      let newElevatorFloor = prevState.elevatorFloor;
      let newElevatorDirection = prevState.elevatorDirection;
      let newPassengersInElevator = [...prevState.passengersInElevator];
      let newWaitingPassengers = prevState.waitingPassengers.map(fp => [...fp]);

      // 1. Passenger Generation
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
      
      // 2. Elevator Action: Drop off passengers
      const passengersStaying: Person[] = [];
      newPassengersInElevator.forEach(p => {
        if (p.destinationFloor !== newElevatorFloor) {
          passengersStaying.push(p);
        }
      });
      newPassengersInElevator = passengersStaying;

      // 3. Elevator Action: Pick up passengers
      const currentFloorWaitingList = [...newWaitingPassengers[newElevatorFloor]];
      const passengersNotPickedUp: Person[] = [];
      
      for (const person of currentFloorWaitingList) {
        if (newPassengersInElevator.length < elevatorCapacity) {
          let shouldPickUp = false;
          if (newElevatorDirection === 'up' && person.destinationFloor > newElevatorFloor) {
            shouldPickUp = true;
          } else if (newElevatorDirection === 'down' && person.destinationFloor < newElevatorFloor) {
            shouldPickUp = true;
          } else if (newElevatorDirection === 'idle') {
             shouldPickUp = true;
             if (newPassengersInElevator.length === 0) { 
                newElevatorDirection = person.destinationFloor > newElevatorFloor ? 'up' : 'down';
             }
          }

          if (shouldPickUp) {
            newPassengersInElevator.push(person);
          } else {
            passengersNotPickedUp.push(person);
          }
        } else {
          passengersNotPickedUp.push(person); 
        }
      }
      newWaitingPassengers[newElevatorFloor] = passengersNotPickedUp;

      // 4. Elevator Movement Logic
      const isAnyoneWaitingAnywhere = newWaitingPassengers.some(floor => floor.length > 0);
      if (newPassengersInElevator.length === 0 && !isAnyoneWaitingAnywhere) {
        newElevatorDirection = 'idle';
      } else {
        if (newElevatorDirection === 'idle') { // Was idle, but now there's a reason to move
          if (newPassengersInElevator.length > 0) {
            newElevatorDirection = newPassengersInElevator[0].destinationFloor > newElevatorFloor ? 'up' : 'down';
          } else { // People waiting somewhere, elevator empty
             // Find first floor with waiting passengers
            const firstWaitingFloorIndex = newWaitingPassengers.findIndex(f => f.length > 0);
            if (firstWaitingFloorIndex !== -1) {
                if (firstWaitingFloorIndex > newElevatorFloor) newElevatorDirection = 'up';
                else if (firstWaitingFloorIndex < newElevatorFloor) newElevatorDirection = 'down';
                else newElevatorDirection = newWaitingPassengers[firstWaitingFloorIndex][0].destinationFloor > newElevatorFloor ? 'up' : 'down';
            } else {
                 newElevatorDirection = 'up'; // Default if logic is stuck
            }
          }
        }
      }

      // Actual movement
      if (newElevatorDirection === 'up') {
        if (newElevatorFloor < numFloors - 1) {
          newElevatorFloor++;
        } else { 
          newElevatorDirection = 'down';
        }
      } else if (newElevatorDirection === 'down') {
        if (newElevatorFloor > 0) {
          newElevatorFloor--;
        } else { 
          newElevatorDirection = 'up';
        }
      }
      // If 'idle', newElevatorFloor remains unchanged

      return {
        currentTime: newCurrentTime,
        elevatorFloor: newElevatorFloor,
        elevatorDirection: newElevatorDirection,
        passengersInElevator: newPassengersInElevator,
        waitingPassengers: newWaitingPassengers,
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
