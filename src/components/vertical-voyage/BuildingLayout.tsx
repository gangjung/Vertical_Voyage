// components/vertical-voyage/BuildingLayout.tsx
import type { ElevatorState, Person } from '@/hooks/useElevatorSimulation';
import { ElevatorShaft } from './ElevatorShaft';
import { FloorsDisplay } from './FloorsDisplay';

interface BuildingLayoutProps {
  numFloors: number;
  elevators: ElevatorState[];
  waitingPassengers: Person[][];
}

export function BuildingLayout({ numFloors, elevators, waitingPassengers }: BuildingLayoutProps) {
  if (!elevators || elevators.length === 0) {
    return null; // or some placeholder
  }
  
  const leftElevators = elevators.slice(0, elevators.length / 2);
  const rightElevators = elevators.slice(elevators.length / 2);
  
  return (
    <div className="flex w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] border-2 border-primary rounded-lg overflow-hidden bg-secondary/10 shadow-inner" data-ai-hint="building cross-section">
      {/* Left Elevator Shafts */}
      {leftElevators.map(elevator => (
         <ElevatorShaft
          key={elevator.id}
          numFloors={numFloors}
          elevator={elevator}
          waitingPassengers={waitingPassengers}
        />
      ))}

      {/* Floors Display in the center */}
      <FloorsDisplay
        numFloors={numFloors}
        waitingPassengers={waitingPassengers}
        elevatorFloors={elevators.map(e => e.floor)}
      />

      {/* Right Elevator Shafts */}
      {rightElevators.map(elevator => (
         <ElevatorShaft
          key={elevator.id}
          numFloors={numFloors}
          elevator={elevator}
          waitingPassengers={waitingPassengers}
        />
      ))}
    </div>
  );
}
