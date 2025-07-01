
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 8;

export function ChallengeTwo() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  const defaultAlgoCode = exampleCompetitionAlgorithms.find(a => !a.isBot)?.code || '';
  const [codeA, setCodeA] = useState(defaultAlgoCode);
  const [codeB, setCodeB] = useState(defaultAlgoCode);
  
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
    if (isRunning) {
       reset();
       setTimeout(() => {
         if (selectedScenarioName === '랜덤') {
            const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
            setPassengerManifest(randomManifest);
            setShouldStartAfterRandom(true);
          } else {
            start();
          }
       }, 50);
    } else {
      if (selectedScenarioName === '랜덤' && passengerManifest.length === 0) {
        const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
        setPassengerManifest(randomManifest);
        setShouldStartAfterRandom(true);
      } else {
        start();
      }
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
      const manageElevatorFunc = new Function('input', code);


      const testElevator = { id: 1, floor: 0, direction: 'idle', passengers: [], distanceTraveled: 0 };
      manageElevatorFunc({ myElevator: testElevator, waitingCalls: Array(NUM_FLOORS).fill(false), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY, currentTime: 0 });
      
      setter(() => manageElevatorFunc as any);
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
              <Select onValueChange={v => setCodeA(exampleCompetitionAlgorithms.find(a => a.name === v)?.code || '')} defaultValue={exampleCompetitionAlgorithms[0].name}>
                  <SelectTrigger id="algo-a-select"><SelectValue/></SelectTrigger>
                  <SelectContent>
                      {exampleCompetitionAlgorithms.filter(a => !a.isBot).map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Textarea value={codeA} onChange={e => setCodeA(e.target.value)} className="font-mono h-[300px] text-xs mt-2" placeholder="// 알고리즘 코드를 여기에 입력하세요..." />
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
                    const codeToSet = selectedAlgo.code || '';
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
                className="font-mono h-[300px] text-xs mt-2" 
                placeholder="// 알고리즘 코드를 여기에 입력하세요..."
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
                    const selectedScenario = passengerScenarios.find(s => s.name === value);
                    if (selectedScenario) {
                      setPassengerManifest(selectedScenario.manifest); // This will include the empty array for '랜덤'
                      reset();
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
                    <span className="font-bold">{passengerManifest.length > 0 ? Math.max(0, passengerManifest.length - (stats.passengersServed[0] + stats.passengersServed[1])) : 0}</span>
                </div>
            </div>
          </div>
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>대결 규칙</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <ul className="list-disc list-inside pl-2 space-y-1 text-xs">
                    <li><strong className="text-foreground">승리 조건:</strong> <span className="text-green-600">1순위 - 더 많은 승객 수송</span>, <span className="text-amber-600">2순위(동점 시) - 더 적은 이동 거리</span>.</li>
                    <li><strong className="text-foreground">정보 제한:</strong> 상대 엘리베이터 정보나 대기 승객의 목적지는 알 수 없습니다. 오직 <code className="p-0.5 rounded bg-muted">waitingCalls</code> 배열(<code className="p-0.5 rounded bg-muted">true</code>/`false`)을 통해 층별 <strong className="text-foreground">호출 유무만</strong> 알 수 있습니다.</li>
                    <li><strong className="text-foreground">동시 도착:</strong> 두 엘리베이터가 같은 층에 동시에 도착하면, 대기 중인 승객은 <strong className="text-foreground">랜덤하게</strong> 나뉘어 탑승합니다.</li>
                    <li><strong className="text-foreground">호출 신호:</strong> 층의 호출 신호는 해당 층의 마지막 대기 승객이 탑승한 직후 `false`로 바뀝니다. (다음 스텝에 반영)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>알고리즘 가이드 (`manageElevator` 함수)</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <p className="text-xs mb-2">
                    `manageElevator` 함수는 <strong className="text-foreground">내 엘리베이터 한 대</strong>에 대한 다음 행동(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, <code className="p-0.5 rounded bg-muted">'idle'</code>)을 결정하여 반환해야 합니다. `input` 객체는 다음 속성을 가집니다:
                  </p>
                  <ul className="list-disc list-inside pl-2 space-y-2 text-xs">
                    <li>
                      <code className="p-0.5 rounded bg-muted">myElevator</code>: 제어할 내 엘리베이터의 상태 객체.
                      <div className="pl-6 mt-1 border-l ml-2 py-1">
                          <ul className="list-['-_'] list-inside pl-2 mt-1 space-y-1">
                            <li><code className="p-0.5 rounded bg-muted">floor</code>: 현재 층</li>
                            <li><code className="p-0.5 rounded bg-muted">direction</code>: 현재 방향</li>
                            <li><code className="p-0.5 rounded bg-muted">passengers</code>: 탑승객 배열. (각 승객은 목적지 <code className="p-0.5 rounded bg-muted">destinationFloor</code>를 가짐)</li>
                          </ul>
                      </div>
                    </li>
                    <li><code className="p-0.5 rounded bg-muted">waitingCalls</code>: 각 층의 호출 여부 배열 (<code className="p-0.5 rounded bg-muted">true</code>/`false`). `waitingCalls[3]`가 `true`이면 3층에서 호출이 있다는 의미.</li>
                    <li><code className="p-0.5 rounded bg-muted">currentTime</code>, <code className="p-0.5 rounded bg-muted">numFloors</code>, etc.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>핵심 규칙: 승객 탑승과 시간 효율</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
                    <div>
                      <strong className="text-foreground">1. 승객 자동 탑승 규칙</strong>
                      <p className="text-xs mt-1">엘리베이터가 특정 층에 있고, 빈자리가 있을 때 <strong className="text-foreground">당신의 명령에 따라</strong> 승객이 자동으로 탑승합니다.</p>
                      <ul className="list-['•_'] list-inside pl-6 mt-1 text-xs space-y-1">
                        <li><code className="p-0.5 rounded bg-muted">'up'</code> 명령 시: <strong className="text-foreground">위로 가려는</strong> 승객만 탑승.</li>
                        <li><code className="p-0.5 rounded bg-muted">'down'</code> 명령 시: <strong className="text-foreground">아래로 가려는</strong> 승객만 탑승.</li>
                        <li><code className="p-0.5 rounded bg-muted">'idle'</code> 명령 시: <strong className="text-foreground">방향에 상관없이</strong> 모든 대기 승객 탑승 (가장 확실한 방법).</li>
                      </ul>
                      <div className="mt-2">
                        <strong className="text-foreground text-xs">예시 코드:</strong>
                        <pre className="bg-muted p-2 rounded-md mt-1 text-xs text-foreground font-mono">
{`// 현재 층에 호출이 있으면 'idle'을 반환하여 승객을 태웁니다.
if (input.waitingCalls[input.myElevator.floor]) {
  return 'idle'; 
}`}
                        </pre>
                      </div>
                    </div>
                     <div className="mt-2">
                      <strong className="text-foreground">2. 💡 시간 효율 마스터하기 (고득점 팁)</strong>
                       <p className="text-xs mt-1">명령어에 따라 승객을 태우고 이동하는 데 걸리는 시간(스텝)이 다릅니다. 이걸 잘 써야 이깁니다.</p>
                       <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-2 text-xs">
                         <li>
                           <strong className="text-green-600">⚡ 1-스텝 픽업 (가장 빠름):</strong> 
                           <br/>
                           엘리베이터의 이동 방향(<code className="p-0.5 rounded bg-muted">'up'</code>/<code className="p-0.5 rounded bg-muted">'down'</code>)과 같은 방향으로 가는 승객을 만나면, 멈춤 없이 즉시 태우고 <strong className="text-foreground">같은 스텝에 바로 다음 층으로 이동</strong>합니다. (대결 모드에서는 승객 목적지를 모르므로 위험 부담이 있습니다)
                         </li>
                         <li>
                           <strong className="text-amber-600">🐢 2-스텝 픽업 (안전함):</strong>
                           <br/>
                           <code className="p-0.5 rounded bg-muted">'idle'</code> 명령은 '완전한 정지'를 의미합니다. <strong className="text-foreground">한 스텝을 소모해 멈춰서</strong> 승객을 태우고, <strong className="text-foreground">그 다음 스텝</strong>에 새로운 목적지를 향해 이동을 시작합니다.
                         </li>
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
