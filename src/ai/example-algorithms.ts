export const exampleAlgorithms = [
    {
        name: '기본: 스마트 분배',
        code: `// 기본 알고리즘: 탑승객 우선, 이후 가장 가까운 호출에 응답합니다.
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
        code: `// 구역 분할 전략: 1호기는 저층, 2호기는 고층을 담당합니다.
function manageElevators(input) {
    const { elevators, waitingPassengers, numFloors } = input;
    const midFloor = Math.floor(numFloors / 2);

    const getCommandForElevator = (elevator, isLowerZone) => {
        const myZoneFloors = isLowerZone ? { start: 0, end: midFloor - 1 } : { start: midFloor, end: numFloors - 1 };

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
        const baseFloor = isLowerZone ? Math.floor(midFloor / 2) : midFloor + Math.floor((numFloors - midFloor) / 2);
        if (elevator.floor > baseFloor) return 'down';
        if (elevator.floor < baseFloor) return 'up';

        return 'idle';
    };
    
    const command1 = getCommandForElevator(elevators[0], true); // 1호기 -> 저층
    const command2 = getCommandForElevator(elevators[1], false); // 2호기 -> 고층

    return [command1, command2];
}`
    },
    {
        name: '홀/짝수층 전략',
        code: `// 홀/짝수층 전략: 1호기는 홀수층, 2호기는 짝수층을 담당합니다.
// (단, 모든 층에 갈 수 있도록 다른 층 승객도 태웁니다.)
function manageElevators(input) {
    const { elevators, waitingPassengers } = input;

    const getCommandForElevator = (elevator, isOdd) => {
        const myFloorTypeCheck = (floor) => isOdd ? floor % 2 !== 0 : floor % 2 === 0;

        // 1. 내 담당 층으로 가는 탑승객 우선 처리
        const myPassengers = elevator.passengers.filter(p => myFloorTypeCheck(p.destinationFloor));
        if (myPassengers.length > 0) {
            const nextDest = myPassengers[0].destinationFloor;
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
        
        // 4. 담당이 아니지만 다른 층에서 부르면 이동
        waitingPassengers.forEach((passengers, floor) => {
            if (passengers.length > 0) {
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

        return 'idle';
    };
    
    const command1 = getCommandForElevator(elevators[0], true); // 1호기 -> 홀수층
    const command2 = getCommandForElevator(elevators[1], false); // 2호기 -> 짝수층

    return [command1, command2];
}`
    }
];
