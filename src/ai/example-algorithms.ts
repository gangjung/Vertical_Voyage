export const exampleAlgorithms = [
    {
        name: '기본: 스마트 분배',
        code: `// 기본 알고리즘: 탑승객 우선, 이후 가장 가까운 호출에 응답합니다.
// 이 로직은 엘리베이터 수에 상관없이 동작합니다.
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
}`
    },
    {
        name: '구역 분할 전략',
        code: `// 구역 분할 전략: 엘리베이터 절반은 저층, 절반은 고층을 담당합니다.
function manageElevators(input) {
    const { elevators, waitingPassengers, numFloors } = input;
    const midFloor = Math.floor(numFloors / 2);

    const getCommandForElevator = (elevator, isLowerZone) => {
        const myZoneFloors = isLowerZone 
            ? { start: 0, end: midFloor - 1 } 
            : { start: midFloor, end: numFloors - 1 };

        // 1. 탑승객 목적지 처리
        if (elevator.passengers.length > 0) {
            const firstPassengerDest = elevator.passengers[0].destinationFloor;
            if (firstPassengerDest > elevator.floor) return 'up';
            if (firstPassengerDest < elevator.floor) return 'down';
            return 'idle'; // 목적지 도착
        }

        // 2. 내 구역의 대기 승객 찾기
        let closestCall = -1;
        let minDistance = Infinity;
        for (let i = myZoneFloors.start; i <= myZoneFloors.end; i++) {
            if (waitingPassengers[i] && waitingPassengers[i].length > 0) {
                const distance = Math.abs(elevator.floor - i);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCall = i;
                }
            }
        }
        
        if (closestCall !== -1) {
            if (closestCall > elevator.floor) return 'up';
            if (closestCall < elevator.floor) return 'down';
            return 'idle'; // 대기 승객 층 도착
        }
        
        // 3. 할 일이 없으면 구역의 중앙으로 이동
        const baseFloor = isLowerZone 
            ? Math.floor(midFloor / 2) 
            : midFloor + Math.floor((numFloors - midFloor) / 2);
        if (elevator.floor > baseFloor) return 'down';
        if (elevator.floor < baseFloor) return 'up';

        return 'idle';
    };
    
    const commands = elevators.map((elevator, index) => {
        // 엘리베이터 ID(1-based)가 엘리베이터 총 수의 절반보다 작거나 같으면 저층 담당
        const isLowerZone = elevator.id <= elevators.length / 2;
        return getCommandForElevator(elevator, isLowerZone);
    });

    return commands;
}`
    },
    {
        name: '홀/짝수층 전략',
        code: `// 홀/짝수층 전략: 엘리베이터를 홀수층 담당과 짝수층 담당으로 나눕니다.
function manageElevators(input) {
    const { elevators, waitingPassengers } = input;

    const getCommandForElevator = (elevator, isOddFloorElevator) => {
        const myFloorTypeCheck = (floor) => isOddFloorElevator ? floor % 2 !== 0 : floor % 2 === 0;

        // 1. 내 담당 층으로 가는 탑승객 우선 처리
        const myPassengers = elevator.passengers.filter(p => myFloorTypeCheck(p.destinationFloor));
        if (myPassengers.length > 0) {
            const nextDest = myPassengers.sort((a,b) => Math.abs(elevator.floor - a.destinationFloor) - Math.abs(elevator.floor - b.destinationFloor))[0].destinationFloor;
            if (nextDest > elevator.floor) return 'up';
            if (nextDest < elevator.floor) return 'down';
            return 'idle';
        }
        
        // 2. 다른 엘리베이터 담당 층으로 가는 승객 처리
        if (elevator.passengers.length > 0) {
             const otherElevatorDest = elevator.passengers[0].destinationFloor;
             if (otherElevatorDest > elevator.floor) return 'up';
             if (otherElevatorDest < elevator.floor) return 'down';
             return 'idle';
        }

        // 3. 내 담당 층에서 대기하는 승객 찾기
        let closestCall = -1;
        let minDistance = Infinity;

        waitingPassengers.forEach((passengers, floor) => {
            if (passengers.length > 0 && myFloorTypeCheck(floor)) {
                const distance = Math.abs(elevator.floor - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCall = floor;
                }
            }
        });

        if (closestCall !== -1) {
            if (closestCall > elevator.floor) return 'up';
            if (closestCall < elevator.floor) return 'down';
            return 'idle';
        }
        
        // 4. 담당이 아니지만 다른 층에서 부르면 이동 (협력)
        waitingPassengers.forEach((passengers, floor) => {
            if (passengers.length > 0) {
                 if (closestCall === -1) { // 아직 호출 못찾았을때만
                    const distance = Math.abs(elevator.floor - floor);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCall = floor;
                    }
                }
            }
        });
        
        if (closestCall !== -1) {
            if (closestCall > elevator.floor) return 'up';
            if (closestCall < elevator.floor) return 'down';
            return 'idle';
        }

        return 'idle';
    };
    
    const commands = elevators.map((elevator, index) => {
        // 엘리베이터 ID(1-based)가 홀수면 홀수층, 짝수면 짝수층 담당
        const isOddFloorElevator = elevator.id % 2 !== 0;
        return getCommandForElevator(elevator, isOddFloorElevator);
    });

    return commands;
}`
    }
];

export const exampleCompetitionAlgorithms = [
    {
        name: '기본: 최근접 호출 우선',
        isBot: false,
        code: `// 챌린지 2 기본 알고리즘: 탑승객을 먼저 내리고, 가장 가까운 호출에 응답합니다.
/*
 * @param {object} input - 시뮬레이션 상태 데이터
 * @param {object} input.myElevator - 내 엘리베이터 상태 (floor, passengers 등)
 * @param {boolean[]} input.waitingCalls - 층별 호출 여부 (승객 정보는 알 수 없음)
 * @param {number} input.numFloors - 총 층수
 * @returns {'up'|'down'|'idle'} - 엘리베이터 이동 명령
 */
function manageElevator(input) {
  const { myElevator, waitingCalls } = input;

  // 1. 탑승객이 있으면 목적지로 이동
  if (myElevator.passengers.length > 0) {
    const destination = myElevator.passengers[0].destinationFloor;
    if (destination > myElevator.floor) return 'up';
    if (destination < myElevator.floor) return 'down';
    return 'idle';
  }

  // 2. 가장 가까운 호출 층으로 이동
  let closestCall = -1;
  let minDistance = Infinity;

  waitingCalls.forEach((isWaiting, floorIndex) => {
    if (isWaiting) {
      const distance = Math.abs(myElevator.floor - floorIndex);
      if (distance < minDistance) {
        minDistance = distance;
        closestCall = floorIndex;
      }
    }
  });

  if (closestCall !== -1) {
    if (closestCall > myElevator.floor) return 'up';
    if (closestCall < myElevator.floor) return 'down';
    return 'idle';
  }
  
  return 'idle';
}`
    },
    {
        name: '공격적: 항상 위로',
        isBot: false,
        code: `// 챌린지 2 예시: 항상 위쪽 호출을 먼저 확인하는 공격적인 알고리즘
/*
 * @param {object} input - 시뮬레이션 상태 데이터
 * @param {object} input.myElevator - 내 엘리베이터 상태 (floor, passengers 등)
 * @param {boolean[]} input.waitingCalls - 층별 호출 여부 (승객 정보는 알 수 없음)
 * @param {number} input.numFloors - 총 층수
 * @returns {'up'|'down'|'idle'} - 엘리베이터 이동 명령
 */
function manageElevator(input) {
    const { myElevator, waitingCalls, numFloors } = input;

    // 1. 탑승객 우선
    if (myElevator.passengers.length > 0) {
        const dest = myElevator.passengers[0].destinationFloor;
        if (dest > myElevator.floor) return 'up';
        if (dest < myElevator.floor) return 'down';
        return 'idle';
    }

    // 2. 위쪽 호출이 있는지 확인
    for (let i = myElevator.floor; i < numFloors; i++) {
        if (waitingCalls[i]) {
            if (i > myElevator.floor) return 'up';
            return 'idle'; // 현재 층 호출
        }
    }

    // 3. 아래쪽 호출이 있는지 확인
    for (let i = myElevator.floor; i >= 0; i--) {
        if (waitingCalls[i]) {
            if (i < myElevator.floor) return 'down';
            return 'idle'; // 현재 층 호출
        }
    }

    // 4. 할 일 없으면 대기
    return 'idle';
}`
    },
    {
        name: '봇 (초급)',
        isBot: true,
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e}=input;if(t.passengers.length>0){const i=t.passengers[0].destinationFloor;return i>t.floor?"up":i<t.floor?"down":"idle"}const i=e.findIndex(t=>!0===t);return-1!==i?i>t.floor?"up":i<t.floor?"down":"idle":"idle"}`
    },
    {
        name: '봇 (중급)',
        isBot: true,
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e}=input;if(t.passengers.length>0){const i=t.passengers.reduce((e,i)=>Math.abs(i.destinationFloor-t.floor)<Math.abs(e.destinationFloor-t.floor)?i:e).destinationFloor;return i>t.floor?"up":i<t.floor?"down":"idle"}let i=-1,r=1/0;return e.forEach((s,o)=>{if(s){const n=Math.abs(t.floor-o);n<r&&(r=n,i=o)}}),-1!==i?i>t.floor?"up":i<t.floor?"down":"idle":"idle"}`
    },
    {
        name: '봇 (고급)',
        isBot: true,
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e,numFloors:i}=input,r=()=>t.passengers.some(e=>e.destinationFloor>t.floor)||e.some((e,i)=>e&&i>t.floor),s=()=>t.passengers.some(e=>e.destinationFloor<t.floor)||e.some((e,i)=>e&&i<t.floor);if(t.passengers.some(e=>e.destinationFloor===t.floor))return"idle";if(e[t.floor])return"idle";if("up"===t.direction)return r()?"up":s()?"down":"idle";if("down"===t.direction)return s()?"down":r()?"up":"idle";if("idle"===t.direction){if(r())return"up";if(s())return"down"}return"idle"}`
    }
];
