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
import { Users, Footprints, Code, Play, Trophy, Clock, Route, Milestone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exampleAlgorithms } from '@/ai/example-algorithms';
import { Label } from '@/components/ui/label';
import { PASSENGER_MANIFEST } from '@/ai/passenger-manifest';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 4;

const ElevatorStatus = ({ elevator }: { elevator: ElevatorState }) => (
  <>
    {`\nElevator ${elevator.id}:\n  Floor: ${elevator.floor}\n  Direction: ${elevator.direction}\n  Passengers: ${elevator.passengers.length}\n  Distance: ${elevator.distanceTraveled || 0} floors\n`}
    {elevator.passengers.map(p => `    - P${p.id} (O:${p.originFloor} D:${p.destinationFloor})`).join('\n')}
  </>
);

export default function VerticalVoyagePage() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [code, setCode] = useState(exampleAlgorithms[0].code);
  const [customAlgorithm, setCustomAlgorithm] = useState<((input: AlgorithmInput) => ElevatorCommand[]) | null>(null);

  const { state: simulation, stats } = useElevatorSimulation(
    NUM_FLOORS, 
    ELEVATOR_CAPACITY,
    customAlgorithm || undefined
  );
  
  useEffect(() => {
    setIsClient(true);
    // Apply the default algorithm on initial load
    handleApplyCode(true);
  }, []);
  
  const handleApplyCode = (isInitialLoad = false) => {
    if (!code.trim()) {
      toast({ variant: "destructive", title: "코드가 비어있습니다", description: "알고리즘 코드를 입력해주세요." });
      return;
    }

    try {
      // This is a safer way to create a function from a string.
      // We explicitly pass the arguments it can access.
      const newAlgorithm = new Function('input', `
        ${code}
        
        if (typeof manageElevators !== 'function') {
          throw new Error('코드에서 "manageElevators"라는 이름의 함수를 찾을 수 없습니다.');
        }

        return manageElevators(input);
      `);

      // Test the function with a dummy input to catch basic errors
      const testResult = newAlgorithm({ currentTime: 0, elevators: [{id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0}, {id: 2, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0}], waitingPassengers: Array.from({ length: NUM_FLOORS }, () => []), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY});
      if (!Array.isArray(testResult) || testResult.length !== 2) {
         throw new Error('함수는 2대의 엘리베이터에 대한 명령어 배열을 반환해야 합니다.');
      }
      
      // Set the new function for the simulation hook to use.
      // The `() => newAlgorithm` is important to prevent React from trying to execute the function.
      setCustomAlgorithm(() => newAlgorithm as any);

      if (!isInitialLoad) {
        toast({
          title: "성공!",
          description: "새로운 알고리즘이 적용되었습니다. 시뮬레이션이 재시작됩니다.",
        });
      }
    } catch (e) {
      console.error("Algorithm Error:", e);
      setCustomAlgorithm(null); // Revert to default
      toast({
        variant: "destructive",
        title: "알고리즘 오류",
        description: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다. 브라우저 콘솔을 확인하세요.",
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

      {stats.totalOperatingTime > 0 && (
        <Card className="mt-4 w-full max-w-2xl lg:max-w-4xl shadow-lg border-2 border-accent animate-fadeIn">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-accent">
              <Trophy className="w-5 h-5" />
              Final Score & Ranking
            </CardTitle>
            <CardDescription>This is the final result for the current algorithm.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm border-t">
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Total Operating Time</span>
              </div>
              <span className="font-bold text-2xl text-primary mt-1">{stats.totalOperatingTime} steps</span>
              <span className="text-xs text-muted-foreground">(1st Priority)</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Footprints className="w-4 h-4" />
                <span>Avg. Journey Steps</span>
              </div>
              <span className="font-bold text-2xl mt-1">{stats.averageJourneyTime.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">(2nd Priority)</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span>Total Distance</span>
              </div>
              <span className="font-bold text-2xl mt-1">{stats.totalDistanceTraveled}</span>
              <span className="text-xs text-muted-foreground">(3rd Priority)</span>
            </div>
          </CardContent>
        </Card>
      )}

       <Card className="mt-4 w-full max-w-2xl lg:max-w-4xl shadow-lg">
         <CardHeader className="pb-2 pt-3">
           <CardTitle className="text-lg font-headline flex items-center gap-2"><Milestone /> Algorithm Performance</CardTitle>
         </CardHeader>
         <CardContent className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm border-t">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Passengers Served</span>
              </div>
              <span className="font-bold text-base">{stats.totalPassengersServed} / {PASSENGER_MANIFEST.length}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                <Footprints className="w-4 h-4" />
                <span>Average Wait Steps</span>
               </div>
              <span className="font-bold text-base">{stats.averageWaitTime.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span>Average Travel Steps</span>
               </div>
              <span className="font-bold text-base">{stats.averageTravelTime.toFixed(1)}</span>
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
            <div className="mb-4">
              <Label htmlFor="algorithm-select" className="mb-2 block text-sm font-medium">알고리즘 예시 선택</Label>
              <Select
                onValueChange={(value) => {
                  const selectedAlgo = exampleAlgorithms.find(algo => algo.name === value);
                  if (selectedAlgo) {
                    setCode(selectedAlgo.code);
                  }
                }}
                defaultValue={exampleAlgorithms[0].name}
              >
                <SelectTrigger id="algorithm-select" className="w-full sm:w-[280px]">
                  <SelectValue placeholder="예시를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {exampleAlgorithms.map((algo) => (
                    <SelectItem key={algo.name} value={algo.name}>
                      {algo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              아래에 `manageElevators` 함수를 JavaScript로 작성하여 붙여넣거나, 위 예시 중 하나를 선택하여 수정해보세요.
            </p>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="function manageElevators(input) { ... }"
              className="font-mono bg-background/50 h-56 text-xs"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleApplyCode(false)} className="w-full sm:w-auto">
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
