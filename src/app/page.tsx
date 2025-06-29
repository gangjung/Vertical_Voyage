// app/page.tsx
"use client";

import { BuildingLayout } from '@/components/vertical-voyage/BuildingLayout';
import { useElevatorSimulation } from '@/hooks/useElevatorSimulation';
import type { ElevatorState, Person } from '@/hooks/useElevatorSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 4;

const ElevatorStatus = ({ elevator }: { elevator: ElevatorState }) => (
  <>
    {`\nElevator ${elevator.id}:\n  Floor: ${elevator.floor}\n  Direction: ${elevator.direction}\n  Passengers: ${elevator.passengers.length}\n`}
    {elevator.passengers.map(p => `    - P${p.id} (O:${p.originFloor} D:${p.destinationFloor})`).join('\n')}
  </>
);

export default function VerticalVoyagePage() {
  const simulation = useElevatorSimulation(NUM_FLOORS, ELEVATOR_CAPACITY);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-2 sm:p-4">
         <Card className="w-full max-w-2xl lg:max-w-4xl shadow-2xl border-primary border-2">
            <CardHeader className="text-center pb-2 pt-4">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary">Vertical Voyage</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">Elevator Simulation Challenge</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <div className="flex w-full h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] items-center justify-center text-muted-foreground">
                Loading Simulation...
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-2 sm:p-4 pt-4 sm:pt-8">
      <Card className="w-full max-w-2xl lg:max-w-4xl shadow-2xl border-primary/50 border">
        <CardHeader className="text-center pb-2 pt-4">
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-headline text-primary">Vertical Voyage</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">Elevator Simulation Challenge</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <BuildingLayout 
            numFloors={NUM_FLOORS}
            elevator1={simulation.elevator1}
            elevator2={simulation.elevator2}
            waitingPassengers={simulation.waitingPassengers}
          />
        </CardContent>
      </Card>
      
       <Card className="mt-4 w-full max-w-2xl lg:max-w-4xl shadow-lg">
         <CardHeader className="pb-2 pt-3">
           <CardTitle className="text-lg font-headline">Simulation Log</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
          <ScrollArea className="h-48 sm:h-56 p-3 border-t">
            <pre className="text-xs whitespace-pre-wrap break-all">
              {`Time: ${simulation.currentTime}`}
              <ElevatorStatus elevator={simulation.elevator1} />
              <ElevatorStatus elevator={simulation.elevator2} />
              {`\nWaiting Passengers:\n`}
              {simulation.waitingPassengers.map((floor, i) => 
                floor.length > 0 ? `  Floor ${i}: ${floor.map(p => `P${p.id}(D:${p.destinationFloor})`).join(', ')}` : null
              ).filter(Boolean).join('\n') || '  None'}
            </pre>
          </ScrollArea>
         </CardContent>
       </Card>
    </div>
  );
}
