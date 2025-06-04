// components/vertical-voyage/BuildingLayout.tsx
import type { ElevatorSimulationState } from '@/hooks/useElevatorSimulation';
import { ElevatorShaft } from './ElevatorShaft';
import { FloorsDisplay } from './FloorsDisplay';

interface BuildingLayoutProps extends ElevatorSimulationState {
  numFloors: number;
}

export function BuildingLayout({ numFloors, elevatorFloor, passengersInElevator, waitingPassengers, elevatorDirection }: BuildingLayoutProps) {
  return (
    <div className="flex w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] border-2 border-primary rounded-lg overflow-hidden bg-secondary/10 shadow-inner" data-ai-hint="building cross-section">
      <ElevatorShaft
        numFloors={numFloors}
        currentFloor={elevatorFloor}
        passengers={passengersInElevator}
        direction={elevatorDirection}
      />
      <div className="w-px bg-primary/30" /> {/* Separator */}
      <FloorsDisplay
        numFloors={numFloors}
        waitingPassengers={waitingPassengers}
        elevatorCurrentFloor={elevatorFloor}
      />
    </div>
  );
}
