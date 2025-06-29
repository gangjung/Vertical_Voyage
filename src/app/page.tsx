// app/page.tsx
"use client";

import { BuildingLayout } from '@/components/vertical-voyage/BuildingLayout';
import { useElevatorSimulation } from '@/hooks/useElevatorSimulation';
import type { ElevatorState, AlgorithmInput, ElevatorCommand } from '@/hooks/useElevatorSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Users, Footprints, Code, Play } from 'lucide-react';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 4;

const ElevatorStatus = ({ elevator }: { elevator: ElevatorState }) => (
  <>
    {`\nElevator ${elevator.id}:\n  Floor: ${elevator.floor}\n  Direction: ${elevator.direction}\n  Passengers: ${elevator.passengers.length}\n  Distance: ${elevator.distanceTraveled || 0} floors\n`}
    {elevator.passengers.map(p => `    - P${p.id} (O:${p.originFloor} D:${p.destinationFloor})`).join('\n')}
  </>
);

const defaultAlgorithmCode = `// 엘리베이터 제어 함수 (JavaScript)
// 'input' 객체를 받아 각 엘리베이터의 다음 행동 ('up', 'down', 'idle')을 배열로 반환하세요.
function manageElevators(input) {
  const { elevators, waitingPassengers, numFloors } = input;
  
  const commands = elevators.map(elevator => {
    // 1. 탑승객이 있을 경우, 목적지를 우선으로 처리합니다.
    if (elevator.passengers.length > 0) {
      const wantsToGoUp = elevator.passengers.some(p => p.destinationFloor > elevator.floor);
      const wantsToGoDown = elevator.passengers.some(p => p.destinationFloor < elevator.floor);

      if (elevator.direction === 'up') {
        if (wantsToGoUp) return 'up';
        if (wantsToGoDown) return 'down';
      }

      if (elevator.direction === 'down') {
        if (wantsToGoDown) return 'down';
        if (wantsToGoUp) return 'up';
      }
      
      if (elevator.direction === 'idle') {
        if (wantsToGoUp) return 'up';
        if (wantsToGoDown) return 'down';
      }

      if (elevator.floor === numFloors - 1 && wantsToGoDown) return 'down';
      if (elevator.floor === 0 && wantsToGoUp) return 'up';
      
      return 'idle';
    }

    // 2. 탑승객이 없고, 대기 승객이 있는 경우 가장 가까운 호출에 응답합니다.
    const isAnyoneWaiting = waitingPassengers.some(floor => floor.length > 0);
    if (isAnyoneWaiting) {
        let closestFloor = -1;
        let minDistance = Infinity;

        waitingPassengers.forEach((floor, floorIndex) => {
            if (floor.length > 0) {
                const distance = Math.abs(elevator.floor - floorIndex);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestFloor = floorIndex;
                }
            }
        });
        
        if (closestFloor !== -1) {
            if (closestFloor > elevator.floor) {
                return 'up';
            } else if (closestFloor < elevator.floor) {
                return 'down';
            } else {
                return 'idle';
            }
        }
    }
    
    // 3. 아무도 없으면 유휴 상태로 대기합니다.
    return 'idle';
  });

  return commands;
}`;

export default function VerticalVoyagePage() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [code, setCode] = useState(defaultAlgorithmCode);
  const [customAlgorithm, setCustomAlgorithm] = useState<((input: AlgorithmInput) => ElevatorCommand[]) | null>(null);

  const { state: simulation, stats } = useElevatorSimulation(
    NUM_FLOORS, 
    ELEVATOR_CAPACITY,
    customAlgorithm || undefined
  );
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleApplyCode = () => {
    if (!code.trim()) {
      toast({ variant: "destructive", title: "Empty Code", description: "Please provide your algorithm code." });
      return;
    }

    try {
      const newAlgorithm = new Function('input', `
        ${code}
        
        if (typeof manageElevators !== 'function') {
          throw new Error('A function named "manageElevators" was not found in your code.');
        }

        return manageElevators(input);
      `);

      const testResult = newAlgorithm({ currentTime: 0, elevators: [{id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0}, {id: 2, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0}], waitingPassengers: Array.from({ length: NUM_FLOORS }, () => []), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY});
      if (!Array.isArray(testResult) || testResult.length !== 2) {
         throw new Error('The function must return an array of commands for 2 elevators.');
      }
      
      setCustomAlgorithm(() => newAlgorithm as any);

      toast({
        title: "Success!",
        description: "New algorithm applied. The simulation will restart.",
      });
    } catch (e) {
      console.error("Algorithm Error:", e);
      setCustomAlgorithm(null); // Revert to default
      toast({
        variant: "destructive",
        title: "Algorithm Error",
        description: e instanceof Error ? e.message : "An unknown error occurred. Check the browser console.",
      });
    }
  };


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
           <CardTitle className="text-lg font-headline">Algorithm Performance</CardTitle>
         </CardHeader>
         <CardContent className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm border-t">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Total Passengers Served</span>
              </div>
              <span className="font-bold text-base">{stats.totalPassengersServed}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                <Footprints className="w-4 h-4" />
                <span>Average Wait Steps</span>
               </div>
              <span className="font-bold text-base">{stats.averageWaitTime.toFixed(1)}</span>
            </div>
         </CardContent>
       </Card>

      <Card className="mt-4 w-full max-w-2xl lg:max-w-4xl shadow-lg">
         <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
           <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary"/>
            <CardTitle className="text-lg font-headline">Submit Your Algorithm</CardTitle>
           </div>
         </CardHeader>
          <CardContent className="p-3 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              아래에 `manageElevators` 함수를 JavaScript로 작성하여 붙여넣으세요. 코드는 `manageElevators(input)` 함수를 포함해야 합니다.
            </p>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="function manageElevators(input) { ... }"
              className="font-mono bg-background/50 h-56 text-xs"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleApplyCode} className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              Apply and Restart Simulation
            </Button>
          </CardFooter>
       </Card>
      
       <Card className="my-4 w-full max-w-2xl lg:max-w-4xl shadow-lg">
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
