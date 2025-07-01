export const exampleAlgorithms = [
    {
        name: '기본: 최근접 우선',
        code: `// 기본 알고리즘: 탑승객을 먼저 목적지에 내려주고, 이후 가장 가까운 호출에 응답합니다.
// 약점: 여러 엘리베이터가 같은 호출에 몰려가는 비효율적인 문제가 있습니다.
function manageElevators(input) {
  const { elevators, waitingPassengers } = input;

  const commands = elevators.map(elevator => {
    // 1. 엘리베이터에 승객이 있을 때: 가장 가까운 목적지로 이동
    if (elevator.passengers.length > 0) {
      const closestDest = elevator.passengers.reduce((prev, curr) =>
        Math.abs(curr.destinationFloor - elevator.floor) < Math.abs(prev.destinationFloor - elevator.floor) ? curr : prev
      ).destinationFloor;

      if (closestDest > elevator.floor) return 'up';
      if (closestDest < elevator.floor) return 'down';
      return 'idle';
    }

    // 2. 엘리베이터가 비어있을 때: 가장 가까운 호출에 응답
    let closestCall = -1;
    let minDistance = Infinity;

    waitingPassengers.forEach((floor, floorIndex) => {
      if (floor.length > 0) {
        const distance = Math.abs(elevator.floor - floorIndex);
        if (distance < minDistance) {
          minDistance = distance;
          closestCall = floorIndex;
        }
      }
    });

    if (closestCall !== -1) {
      if (closestCall > elevator.floor) return 'up';
      if (closestCall < elevator.floor) return 'down';
      return 'idle';
    }

    // 3. 호출이 없을 때: 대기
    return 'idle';
  });

  return commands;
}`
    },
    {
        name: '구역 분할 전략',
        code: `// 구역 분할 전략: 엘리베이터 절반은 저층, 절반은 고층을 담당하여 분산시킵니다.
// 약점: 특정 구역에만 호출이 몰릴 경우, 다른 구역의 엘리베이터는 비효율적으로 대기하게 될 수 있습니다.
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
        
        // 3. 할 일이 없으면 구역의 중앙으로 이동하여 대기
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
// 약점: 홀수층과 짝수층 간의 이동이 많은 시나리오에서는 동선이 비효율적일 수 있습니다.
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
        name: '기본: 최근접 우선',
        isBot: false,
        code: `// 챌린지 2 기본 알고리즘: 탑승객의 가장 가까운 목적지로 이동하고, 없으면 가장 가까운 호출에 응답합니다.
// 약점: 엘리베이터의 현재 이동 방향을 고려하지 않아 비효율적인 방향 전환이 발생할 수 있습니다.
/*
 * @param {object} input - 시뮬레이션 상태 데이터
 * @param {object} input.myElevator - 내 엘리베이터 상태 (floor, passengers 등)
 * @param {boolean[]} input.waitingCalls - 층별 호출 여부 (승객 정보는 알 수 없음)
 * @param {number} input.numFloors - 총 층수
 * @returns {'up'|'down'|'idle'} - 엘리베이터 이동 명령
 */
function manageElevator(input) {
  const { myElevator, waitingCalls } = input;

  // 1. 탑승객이 있으면 가장 가까운 목적지로 이동
  if (myElevator.passengers.length > 0) {
    const closestDest = myElevator.passengers.reduce((prev, curr) => 
        Math.abs(curr.destinationFloor - myElevator.floor) < Math.abs(prev.destinationFloor - myElevator.floor) ? curr : prev
    ).destinationFloor;
    
    if (closestDest > myElevator.floor) return 'up';
    if (closestDest < myElevator.floor) return 'down';
    return 'idle'; // 목적지 도착
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
// 약점: '아침 출근'처럼 위로 가는 수요가 많을 때 유리하지만, 다른 상황에서는 아래쪽 호출을 무시하여 비효율적일 수 있습니다.
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
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e}=input;if(t.passengers.length>0){const i=t.passengers[0].destinationFloor;return i>t.floor?"up":i<t.floor?"down":"idle"}let i=-1,r=1/0;return e.forEach((s,o)=>{if(s){const n=Math.abs(t.floor-o);n<r&&(r=n,i=o)}}),-1!==i?i>t.floor?"up":i<t.floor?"down":"idle":"idle"}`
    },
    {
        name: '봇 (중급)',
        isBot: true,
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e}=input,r=t.floor,{passengers:n,direction:o}=t;if(n.some(t=>t.destinationFloor===r)||e[r])return"idle";if("up"===o){if(n.some(t=>t.destinationFloor>r)||e.some((t,e)=>t&&e>r))return"up"}if("down"===o){if(n.some(t=>t.destinationFloor<r)||e.some((t,e)=>t&&e<r))return"down"}const a=[...new Set([...n.map(t=>t.destinationFloor),...e.map((t,e)=>t?e:-1).filter(t=>-1!==t)])];if(0===a.length)return"idle";let i=-1,s=1/0;return a.forEach(t=>{const e=Math.abs(r-t);e<s&&(s=e,i=t)}),i>r?"up":i<r?"down":"idle"}`
    },
    {
        name: '봇 (고급)',
        isBot: true,
        code: `function manageElevator(input){const{myElevator:t,waitingCalls:e,numFloors:i}=input,r=()=>t.passengers.some(e=>e.destinationFloor>t.floor)||e.some((e,i)=>e&&i>t.floor),s=()=>t.passengers.some(e=>e.destinationFloor<t.floor)||e.some((e,i)=>e&&i<t.floor);if(t.passengers.some(e=>e.destinationFloor===t.floor))return"idle";if(e[t.floor])return"idle";if("up"===t.direction)return r()?"up":s()?"down":"idle";if("down"===t.direction)return s()?"down":r()?"up":"idle";if("idle"===t.direction){if(r())return"up";if(s())return"down"}return"idle"}`
    }
];

    
