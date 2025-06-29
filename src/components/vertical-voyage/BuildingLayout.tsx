// components/vertical-voyage/BuildingLayout.tsx
import type { ElevatorState, Person } from '@/hooks/useElevatorSimulation';
import { ElevatorShaft } from './ElevatorShaft';
import { FloorsDisplay } from './FloorsDisplay';

interface BuildingLayoutProps {
  numFloors: number;
  elevator1: ElevatorState;
  elevator2: ElevatorState;
  waitingPassengers: Person[][];
}

export function BuildingLayout({ numFloors, elevator1, elevator2, waitingPassengers }: BuildingLayoutProps) {
  return (
    <div className="flex w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] border-2 border-primary rounded-lg overflow-hidden bg-secondary/10 shadow-inner" data-ai-hint="building cross-section">
      {/* Left Elevator Shaft */}
      <ElevatorShaft
        numFloors={numFloors}
        currentFloor={elevator1.floor}
        passengers={elevator1.passengers}
        direction={elevator1.direction}
      />

      {/* Floors Display in the center */}
      <FloorsDisplay
        numFloors={numFloors}
        waitingPassengers={waitingPassengers}
        elevatorFloors={[elevator1.floor, elevator2.floor]}
      />

      {/* Right Elevator Shaft */}
      <ElevatorShaft
        numFloors={numFloors}
        currentFloor={elevator2.floor}
        passengers={elevator2.passengers}
        direction={elevator2.direction}
      />
    </div>
  );
}
