// app/page.tsx
"use client";

import { BuildingLayout } from '@/components/vertical-voyage/BuildingLayout';
import { useElevatorSimulation } from '@/hooks/useElevatorSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For debug panel
import { useState, useEffect } from 'react';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 4;

export default function VerticalVoyagePage() {
  const simulation = useElevatorSimulation(NUM_FLOORS, ELEVATOR_CAPACITY);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a loading state or null on the server to avoid hydration mismatch for the debug panel
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
          <BuildingLayout {...simulation} numFloors={NUM_FLOORS} />
        </CardContent>
      </Card>
      
       <Card className="mt-4 w-full max-w-2xl lg:max-w-4xl shadow-lg">
         <CardHeader className="pb-2 pt-3">
           <CardTitle className="text-lg font-headline">Simulation Log</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
          <ScrollArea className="h-32 sm:h-40 p-3 border-t">
            <pre className="text-xs whitespace-pre-wrap break-all">
              {`Time: ${simulation.currentTime}\nElevator Floor: ${simulation.elevatorFloor}\nDirection: ${simulation.elevatorDirection}\nIn Elevator: ${simulation.passengersInElevator.length} passengers\n`}
              {simulation.passengersInElevator.map(p => `  - P${p.id} (O:${p.originFloor} D:${p.destinationFloor})`).join('\n')}
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
