
// components/vertical-voyage/ChallengeTwo.tsx
"use client";

import { BuildingLayout } from '@/components/vertical-voyage/BuildingLayout';
import { useElevatorCompetition } from '@/hooks/useElevatorCompetition';
import type { CompetitionAlgorithmInput, ElevatorCommand, Person } from '@/hooks/useElevatorCompetition';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Users, Footprints, Code, Play, Trophy, Route, Timer, UsersRound, Bot, Pause, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exampleCompetitionAlgorithms } from '@/ai/example-algorithms';
import { Label } from '@/components/ui/label';
import { generateRandomManifest, passengerScenarios } from '@/ai/passenger-scenarios';
import type { PassengerManifest } from '@/ai/passenger-scenarios';
import { cn } from '@/lib/utils';
import { manageElevator as defaultManageElevator } from '@/ai/competition-algorithm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 8;

export function ChallengeTwo() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  const [codeA, setCodeA] = useState(defaultManageElevator.toString().replace(/^function manageElevator\(input\) \{|\}$/g, ''));
  const [codeB, setCodeB] = useState(defaultManageElevator.toString().replace(/^function manageElevator\(input\) \{|\}$/g, ''));
  
  const [algorithmA, setAlgorithmA] = useState<((input: CompetitionAlgorithmInput) => ElevatorCommand) | null>(null);
  const [algorithmB, setAlgorithmB] = useState<((input: CompetitionAlgorithmInput) => ElevatorCommand) | null>(null);
  
  const [isBotB, setIsBotB] = useState(false);

  const [selectedScenarioName, setSelectedScenarioName] = useState(passengerScenarios[0].name);
  const [passengerManifest, setPassengerManifest] = useState<PassengerManifest>(passengerScenarios[0].manifest);
  const [shouldStartAfterRandom, setShouldStartAfterRandom] = useState(false);
  
  const { 
    state: simulation, 
    stats,
    isRunning,
    start,
    pause,
    reset
  } = useElevatorCompetition(
    NUM_FLOORS, 
    ELEVATOR_CAPACITY,
    passengerManifest,
    algorithmA || undefined,
    algorithmB || undefined,
  );
  
  useEffect(() => {
    setIsClient(true);
    handleApplyCode(codeA, setAlgorithmA, '알고리즘 A', true);
    handleApplyCode(codeB, setAlgorithmB, '알고리즘 B', true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shouldStartAfterRandom) {
      start();
      setShouldStartAfterRandom(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengerManifest, shouldStartAfterRandom]);

  const handleStartClick = () => {
    if (selectedScenarioName === '랜덤') {
      const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
      reset();
      setPassengerManifest(randomManifest);
      setShouldStartAfterRandom(true);
    } else {
      start();
    }
  };

  const handleApplyCode = (
    code: string, 
    setter: React.Dispatch<React.SetStateAction<((input: CompetitionAlgorithmInput) => ElevatorCommand) | null>>,
    algoName: string,
    isInitialLoad = false
    ) => {
    if (!code || !code.trim()) {
      toast({ variant: "destructive", title: "코드가 비어있습니다", description: `${algoName} 알고리즘 코드를 입력해주세요.` });
      return;
    }

    try {
      const fullCode = `
        function manageElevator(input) {
          ${code}
        }
        return manageElevator;
      `;
      const manageElevatorFunc = new Function(fullCode)();


      const testElevator = { id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 };
      manageElevatorFunc({ myElevator: testElevator, waitingCalls: Array(NUM_FLOORS).fill(false), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY, currentTime: 0 });
      
      setter(() => manageElevatorFunc);
      reset();

      if (!isInitialLoad) {
        toast({
          title: "성공!",
          description: `${algoName} 알고리즘이 적용되었습니다. '시작' 버튼을 눌러 대결을 시작하세요.`,
        });
      }
    } catch (e) {
      console.error(`Algorithm ${algoName} Error:`, e);
      setter(null);
      toast({
        variant: "destructive",
        title: `${algoName} 알고리즘 오류`,
        description: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  };

  const handleApplyCodeA = (isInitial:boolean = false) => handleApplyCode(codeA, setAlgorithmA, '알고리즘 A', isInitial);
  const handleApplyCodeB = (isInitial:boolean = false) => handleApplyCode(codeB, setAlgorithmB, '알고리즘 B', isInitial);

  // --- Stat Comparison Logic ---
  const servedA = stats.passengersServed[0];
  const servedB = stats.passengersServed[1];
  const distA = stats.distanceTraveled[0];
  const distB = stats.distanceTraveled[1];

  const isServedAWinning = servedA > servedB;
  const isServedBWinning = servedB > servedA;
  const isDistAWinning = distA < distB;
  const isDistBWinning = distB < distA;


  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center bg-background p-2 sm:p-4">
         <Card className="w-full shadow-2xl border-primary border-2">
            <CardContent className="p-2 sm:p-3">
              <div className="flex w-full h-[calc(100vh-300px)] min-h-[400px] max-h-[700px] items-center justify-center text-muted-foreground">
                Loading Competition...
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full shadow-2xl border-primary/50 border">
        <CardContent className="p-2 sm:p-3">
          <BuildingLayout 
            numFloors={NUM_FLOORS}
            elevators={simulation.elevators}
            waitingPassengers={simulation.waitingPassengers}
          />
        </CardContent>
      </Card>
      
      <div className="w-full flex justify-center my-2">
        {stats.winner ? (
          <Button onClick={handleStartClick} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart Competition
          </Button>
        ) : isRunning ? (
          <Button onClick={pause} variant="secondary" size="lg">
            <Pause className="mr-2 h-4 w-4" />
            Pause Competition
          </Button>
        ) : (
          <Button onClick={handleStartClick} size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Competition
          </Button>
        )}
      </div>

      {stats.winner && (
        <Card className="w-full shadow-lg border-2 border-accent animate-fadeIn">
          <CardHeader className="text-center pb-3 pt-4">
              <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2 text-accent">
                <Trophy className="w-8 h-8" />
                Competition Over!
              </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-center">
            {stats.winner === 'Draw' ? (
                <p className="text-xl font-bold">It's a Draw!</p>
            ) : (
                <p className="text-xl font-bold">
                    The winner is <span className={cn("text-3xl", stats.winner === 'A' ? "text-blue-500" : "text-red-500")}>
                        Algorithm {stats.winner}
                    </span>!
                </p>
            )}
             <p className="text-sm text-muted-foreground mt-1">
                A: {stats.passengersServed[0]} passengers, {stats.distanceTraveled[0]} distance | B: {stats.passengersServed[1]} passengers, {stats.distanceTraveled[1]} distance
            </p>
          </CardContent>
        </Card>
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* PLAYER A */}
        <Card className="shadow-lg border-blue-500/50 border">
          <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-xl font-headline flex items-center gap-2 text-blue-500">
                <Bot className="w-6 h-6" />
                Algorithm A
              </CardTitle>
          </CardHeader>
          <CardContent className="border-t pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className={cn("flex items-center justify-between p-2 rounded-lg bg-secondary/30 transition-colors", isServedAWinning && "bg-blue-200 dark:bg-blue-500/30")}>
                      <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4"/><span>Served</span></div>
                      <span className="font-bold">{servedA}</span>
                  </div>
                  <div className={cn("flex items-center justify-between p-2 rounded-lg bg-secondary/30 transition-colors", isDistAWinning && "bg-blue-200 dark:bg-blue-500/30")}>
                      <div className="flex items-center gap-2 text-muted-foreground"><Route className="w-4 h-4"/><span>Distance</span></div>
                      <span className="font-bold">{distA}</span>
                  </div>
              </div>
              <Label htmlFor="algo-a-select" className="mb-2 block text-sm font-medium"><Code className="inline-block w-4 h-4 mr-1"/>알고리즘 예시 선택</Label>
              <Select onValueChange={v => setCodeA(exampleCompetitionAlgorithms.find(a => a.name === v)?.code?.replace(/^function manageElevator\(input\) \{|\}$/g, '') || '')} defaultValue={exampleCompetitionAlgorithms[0].name}>
                  <SelectTrigger id="algo-a-select"><SelectValue/></SelectTrigger>
                  <SelectContent>
                      {exampleCompetitionAlgorithms.map(a => <SelectItem key={a.name} value={a.name} disabled={a.isBot}>{a.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Textarea value={codeA} onChange={e => setCodeA(e.target.value)} className="font-mono h-96 text-xs mt-2" placeholder="function manageElevator(input) { ... }"/>
          </CardContent>
          <CardFooter>
              <Button onClick={() => handleApplyCodeA()} className="w-full bg-blue-600 hover:bg-blue-700"><Code className="mr-2 h-4 w-4"/>Apply Algorithm A</Button>
          </CardFooter>
        </Card>

        {/* PLAYER B */}
        <Card className="shadow-lg border-red-500/50 border">
          <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-xl font-headline flex items-center gap-2 text-red-500">
                <Bot className="w-6 h-6" />
                Algorithm B
              </CardTitle>
          </CardHeader>
          <CardContent className="border-t pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className={cn("flex items-center justify-between p-2 rounded-lg bg-secondary/30 transition-colors", isServedBWinning && "bg-red-200 dark:bg-red-500/30")}>
                      <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4"/><span>Served</span></div>
                      <span className="font-bold">{servedB}</span>
                  </div>
                  <div className={cn("flex items-center justify-between p-2 rounded-lg bg-secondary/30 transition-colors", isDistBWinning && "bg-red-200 dark:bg-red-500/30")}>
                      <div className="flex items-center gap-2 text-muted-foreground"><Route className="w-4 h-4"/><span>Distance</span></div>
                      <span className="font-bold">{distB}</span>
                  </div>
              </div>
              <Label htmlFor="algo-b-select" className="mb-2 block text-sm font-medium"><Code className="inline-block w-4 h-4 mr-1"/>알고리즘 예시 또는 봇 선택</Label>
              <Select
                onValueChange={(value) => {
                  const selectedAlgo = exampleCompetitionAlgorithms.find(a => a.name === value);
                  if (selectedAlgo) {
                    const codeToSet = selectedAlgo.code?.replace(/^function manageElevator\(input\) \{|\}$/g, '') || '';
                    setCodeB(codeToSet);
                    if (selectedAlgo.isBot) {
                      setIsBotB(true);
                      handleApplyCode(codeToSet, setAlgorithmB, selectedAlgo.name);
                    } else {
                      setIsBotB(false);
                    }
                  }
                }}
                defaultValue={exampleCompetitionAlgorithms.find(a => !a.isBot)?.name}
              >
                  <SelectTrigger id="algo-b-select"><SelectValue/></SelectTrigger>
                  <SelectContent>
                      {exampleCompetitionAlgorithms.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Textarea 
                value={isBotB ? `// 봇 알고리즘이 선택되었습니다.\n// 코드는 볼 수 없습니다.` : codeB} 
                onChange={e => {
                    setCodeB(e.target.value);
                    setIsBotB(false);
                }}
                className="font-mono h-96 text-xs mt-2" 
                placeholder="function manageElevator(input) { ... }"
                readOnly={isBotB}
              />
          </CardContent>
          <CardFooter>
              <Button onClick={() => handleApplyCodeB()} className="w-full bg-red-600 hover:bg-red-700" disabled={isBotB}>
                <Code className="mr-2 h-4 w-4"/>
                Apply Algorithm B
              </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-lg font-headline">Competition Settings & Rules</CardTitle>
        </CardHeader>
        <CardContent className="border-t pt-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scenario-select-2" className="mb-2 block text-sm font-medium"><UsersRound className="inline-block w-4 h-4 mr-1"/>승객 시나리오 선택</Label>
              <Select
                  value={selectedScenarioName}
                  onValueChange={(value) => {
                    setSelectedScenarioName(value);
                    if (value !== '랜덤') {
                      const selectedScenario = passengerScenarios.find(s => s.name === value);
                      if (selectedScenario) {
                        reset();
                        setPassengerManifest(selectedScenario.manifest);
                      }
                    } else {
                      reset();
                      setPassengerManifest([]);
                    }
                  }}
              >
                <SelectTrigger id="scenario-select-2"><SelectValue /></SelectTrigger>
                <SelectContent>{passengerScenarios.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div className="p-2 rounded-lg bg-secondary/30 text-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground"><Timer className="w-4 h-4"/><span>Current Step</span></div>
                    <span className="font-bold">{simulation.currentTime}</span>
                </div>
                 <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4"/><span>Passengers Left</span></div>
                    <span className="font-bold">{passengerManifest.length > 0 ? passengerManifest.length - stats.passengersServed.reduce((a,b) => a+b, 0) : 0}</span>
                </div>
            </div>
          </div>
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>대결 규칙</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><span className="font-bold text-foreground">승리 조건:</span> 1순위 - 더 많은 승객 수송. 2순위(동점 시) - 더 적은 이동 거리.</li>
                    <li><span className="font-bold text-foreground">정보 제한:</span> 알고리즘은 각 층에 호출이 있는지(`true/false`)만 알 수 있으며, 대기 승객 수나 목적지 정보는 알 수 없습니다.</li>
                    <li><span className="font-bold text-foreground">동시 도착:</span> 두 엘리베이터가 같은 층에 동시에 도착하면, 대기 중인 승객은 랜덤하게 나뉘어 탑승합니다.</li>
                    <li><span className="font-bold text-foreground">호출 신호 변경:</span> 층의 호출 신호는 승객이 나타나면 `true`가 되며, 해당 층의 마지막 대기 승객이 탑승한 직후 `false`로 바뀝니다. 이 변경 사항은 다음 스텝에 반영됩니다.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>알고리즘 가이드 (`manageElevator` 함수)</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <p className="text-xs">
                    `manageElevator` 함수는 **내 엘리베이터 한 대**에 대한 다음 행동(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, <code className="p-0.5 rounded bg-muted">'idle'</code>)을 결정하여 반환해야 합니다.
                  </p>
                  <div>
                    <h5 className="font-medium text-foreground">`input` 객체 속성:</h5>
                    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-xs">
                      <li>
                        <code className="p-0.5 rounded bg-muted">myElevator</code>: 제어할 내 엘리베이터의 상태 객체.
                        <ul className="list-['-_'] list-inside pl-6 mt-1">
                          <li><code className="p-0.5 rounded bg-muted">floor</code>: 현재 층 (0부터 시작)</li>
                          <li><code className="p-0.5 rounded bg-muted">direction</code>: 현재 방향 ('up', 'down', 'idle')</li>
                          <li><code className="p-0.5 rounded bg-muted">passengers</code>: 탑승객 배열. 각 승객은 목적지 `destinationFloor`를 가집니다.</li>
                          <li><code className="p-0.5 rounded bg-muted">distanceTraveled</code>: 총 이동 거리</li>
                        </ul>
                      </li>
                      <li><code className="p-0.5 rounded bg-muted">waitingCalls</code>: 각 층의 호출 여부 배열 (<code className="p-0.5 rounded bg-muted">true</code>/`false`). `waitingCalls[3]`가 `true`이면 3층에서 호출이 있다는 의미입니다.</li>
                      <li><code className="p-0.5 rounded bg-muted">numFloors</code>, <code className="p-0.5 rounded bg-muted">elevatorCapacity</code>, <code className="p-0.5 rounded bg-muted">currentTime</code></li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>승객 탑승 및 이동 규칙 (핵심!)</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <p className="text-xs">
                      탑승은 시뮬레이션에 의해 자동으로 처리됩니다. 알고리즘은 다음 조건을 만족시켜야 합니다:
                  </p>
                  <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1 text-xs">
                    <li>엘리베이터가 승객이 기다리는 층에 있어야 합니다.</li>
                    <li>엘리베이터에 빈 자리가 있어야 합니다.</li>
                    <li>
                        반환하는 명령(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, <code className="p-0.5 rounded bg-muted">'idle'</code>)이 중요합니다.
                        <ul className="list-['•_'] list-inside pl-4 mt-1">
                            <li><code className="p-0.5 rounded bg-muted">'up'</code>: 위로 가려는 승객만 태웁니다.</li>
                            <li><code className="p-0.5 rounded bg-muted">'down'</code>: 아래로 가려는 승객만 태웁니다.</li>
                            <li><code className="p-0.5 rounded bg-muted">'idle'</code>: 방향에 상관없이 대기 중인 승객을 태웁니다. (가장 안전한 탑승 전략)</li>
                        </ul>
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">예시 코드:</span>
                      <pre className="bg-muted p-2 rounded-md mt-1 text-xs text-foreground font-mono">
{`// 현재 층에 호출이 있으면 'idle'을 반환하여 승객을 태웁니다.
if (input.waitingCalls[input.myElevator.floor]) {
  return 'idle'; 
}`}
                      </pre>
                    </li>
                  </ul>
                  <div className="mt-2">
                    <h5 className="font-semibold text-foreground">💡 팁: 시간 효율 마스터하기</h5>
                     <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1 text-xs">
                        <li><strong className="text-foreground">1-스텝 픽업 (방향 유지):</strong> 엘리베이터의 이동 방향(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>)과 같은 방향으로 가려는 승객을 만나면, 멈춤 없이 즉시 태우고 다음 스텝에 바로 이동합니다. 가장 빠른 방법이지만, 승객의 목적지를 모르므로 위험이 따릅니다.</li>
                        <li><strong className="text-foreground">2-스텝 픽업 ('idle' 정차):</strong> <code className="p-0.5 rounded bg-muted">'idle'</code> 명령은 '완전한 정지'를 의미합니다. 한 스텝을 소모해 멈춰서 승객을 태우고, 그 다음 스텝에 새 목적지를 향해 이동을 시작합니다. 방향에 상관없이 태울 수 있는 가장 안전한 방법입니다.</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
