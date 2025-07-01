// src/ai/passenger-scenarios.ts
// 개발자 참고: 새로운 승객 시나리오를 생성할 때, 특정 층에 승객이 과도하게 몰리지 않도록 (예: 동시에 15명 이상 대기) 고려하여 분산시켜주세요.
import type { Person } from '@/hooks/useElevatorSimulation';

// This type is exported for use in other files
export type PassengerManifest = Omit<Person, 'pickupTime'>[];

export const generateRandomManifest = (numFloors: number, numPassengers: number, maxSpawnTime: number): PassengerManifest => {
    const manifest: Omit<Person, 'id' | 'pickupTime'>[] = [];
    for (let i = 0; i < numPassengers; i++) {
        let originFloor = 0;
        let destinationFloor = 0;
        do {
            originFloor = Math.floor(Math.random() * numFloors);
            destinationFloor = Math.floor(Math.random() * numFloors);
        } while (originFloor === destinationFloor);
        
        manifest.push({
            spawnTime: Math.floor(Math.random() * maxSpawnTime) + 1,
            originFloor,
            destinationFloor,
        });
    }
    return manifest
      .sort((a, b) => a.spawnTime - b.spawnTime)
      .map((p, i) => ({ ...p, id: i + 1 }));
};

const normalScenario: PassengerManifest = [
  { id: 1, spawnTime: 4, originFloor: 1, destinationFloor: 8 },
  { id: 2, spawnTime: 6, originFloor: 8, destinationFloor: 2 },
  { id: 3, spawnTime: 10, originFloor: 9, destinationFloor: 1 },
  { id: 4, spawnTime: 13, originFloor: 5, destinationFloor: 2 },
  { id: 5, spawnTime: 16, originFloor: 0, destinationFloor: 7 },
  { id: 6, spawnTime: 18, originFloor: 2, destinationFloor: 6 },
  { id: 7, spawnTime: 21, originFloor: 5, destinationFloor: 9 },
  { id: 8, spawnTime: 26, originFloor: 7, destinationFloor: 3 },
  { id: 9, spawnTime: 29, originFloor: 3, destinationFloor: 0 },
  { id: 10, spawnTime: 31, originFloor: 5, destinationFloor: 0 },
  { id: 11, spawnTime: 35, originFloor: 0, destinationFloor: 9 },
  { id: 12, spawnTime: 39, originFloor: 2, destinationFloor: 7 },
  { id: 13, spawnTime: 42, originFloor: 8, destinationFloor: 3 },
  { id: 14, spawnTime: 44, originFloor: 3, destinationFloor: 6 },
  { id: 15, spawnTime: 49, originFloor: 6, destinationFloor: 0 },
  { id: 16, spawnTime: 53, originFloor: 1, destinationFloor: 5 },
  { id: 17, spawnTime: 57, originFloor: 4, destinationFloor: 8 },
  { id: 18, spawnTime: 59, originFloor: 7, destinationFloor: 4 },
  { id: 19, spawnTime: 61, originFloor: 2, destinationFloor: 5 },
  { id: 20, spawnTime: 66, originFloor: 9, destinationFloor: 4 },
  { id: 21, spawnTime: 69, originFloor: 0, destinationFloor: 6 },
  { id: 22, spawnTime: 71, originFloor: 4, destinationFloor: 1 },
  { id: 23, spawnTime: 75, originFloor: 6, destinationFloor: 3 },
  { id: 24, spawnTime: 79, originFloor: 9, destinationFloor: 0 },
  { id: 25, spawnTime: 82, originFloor: 1, destinationFloor: 7 },
  { id: 26, spawnTime: 86, originFloor: 3, destinationFloor: 8 },
  { id: 27, spawnTime: 91, originFloor: 7, destinationFloor: 2 },
  { id: 28, spawnTime: 94, originFloor: 2, destinationFloor: 9 },
  { id: 29, spawnTime: 96, originFloor: 5, destinationFloor: 1 },
  { id: 30, spawnTime: 99, originFloor: 8, destinationFloor: 4 },
  { id: 31, spawnTime: 104, originFloor: 0, destinationFloor: 5 },
  { id: 32, spawnTime: 107, originFloor: 4, destinationFloor: 7 },
  { id: 33, spawnTime: 110, originFloor: 6, destinationFloor: 2 },
  { id: 34, spawnTime: 114, originFloor: 3, destinationFloor: 9 },
  { id: 35, spawnTime: 116, originFloor: 9, destinationFloor: 5 },
  { id: 36, spawnTime: 121, originFloor: 1, destinationFloor: 6 },
  { id: 37, spawnTime: 125, originFloor: 5, destinationFloor: 3 },
  { id: 38, spawnTime: 127, originFloor: 8, destinationFloor: 1 },
  { id: 39, spawnTime: 132, originFloor: 2, destinationFloor: 7 },
  { id: 40, spawnTime: 135, originFloor: 7, destinationFloor: 0 },
  { id: 41, spawnTime: 139, originFloor: 4, destinationFloor: 9 },
  { id: 42, spawnTime: 142, originFloor: 0, destinationFloor: 8 },
  { id: 43, spawnTime: 147, originFloor: 6, destinationFloor: 4 },
  { id: 44, spawnTime: 151, originFloor: 3, destinationFloor: 5 },
  { id: 45, spawnTime: 153, originFloor: 9, destinationFloor: 2 },
  { id: 46, spawnTime: 157, originFloor: 5, destinationFloor: 0 },
  { id: 47, spawnTime: 161, originFloor: 1, destinationFloor: 4 },
  { id: 48, spawnTime: 166, originFloor: 7, destinationFloor: 1 },
  { id: 49, spawnTime: 168, originFloor: 4, destinationFloor: 6 },
  { id: 50, spawnTime: 172, originFloor: 8, destinationFloor: 0 },
];

const morningRushScenario: PassengerManifest = [
  { id: 1, spawnTime: 1, originFloor: 0, destinationFloor: 7 },
  { id: 2, spawnTime: 2, originFloor: 0, destinationFloor: 5 },
  { id: 3, spawnTime: 2, originFloor: 0, destinationFloor: 9 },
  { id: 4, spawnTime: 3, originFloor: 0, destinationFloor: 4 },
  { id: 5, spawnTime: 4, originFloor: 0, destinationFloor: 6 },
  { id: 6, spawnTime: 5, originFloor: 0, destinationFloor: 8 },
  { id: 7, spawnTime: 6, originFloor: 2, destinationFloor: 5 },
  { id: 8, spawnTime: 7, originFloor: 0, destinationFloor: 3 },
  { id: 9, spawnTime: 7, originFloor: 0, destinationFloor: 7 },
  { id: 10, spawnTime: 8, originFloor: 0, destinationFloor: 2 },
  { id: 11, spawnTime: 9, originFloor: 0, destinationFloor: 9 },
  { id: 12, spawnTime: 10, originFloor: 0, destinationFloor: 5 },
  { id: 13, spawnTime: 11, originFloor: 0, destinationFloor: 6 },
  { id: 14, spawnTime: 12, originFloor: 0, destinationFloor: 3 },
  { id: 15, spawnTime: 14, originFloor: 1, destinationFloor: 9 },
  { id: 16, spawnTime: 15, originFloor: 0, destinationFloor: 8 },
  { id: 17, spawnTime: 15, originFloor: 0, destinationFloor: 4 },
  { id: 18, spawnTime: 16, originFloor: 0, destinationFloor: 7 },
  { id: 19, spawnTime: 17, originFloor: 0, destinationFloor: 2 },
  { id: 20, spawnTime: 19, originFloor: 0, destinationFloor: 6 },
  { id: 21, spawnTime: 20, originFloor: 0, destinationFloor: 5 },
  { id: 22, spawnTime: 22, originFloor: 0, destinationFloor: 9 },
  { id: 23, spawnTime: 23, originFloor: 0, destinationFloor: 4 },
  { id: 24, spawnTime: 25, originFloor: 3, destinationFloor: 8 },
  { id: 25, spawnTime: 26, originFloor: 0, destinationFloor: 7 },
  { id: 26, spawnTime: 28, originFloor: 0, destinationFloor: 3 },
  { id: 27, spawnTime: 30, originFloor: 0, destinationFloor: 8 },
  { id: 28, spawnTime: 32, originFloor: 0, destinationFloor: 1 },
  { id: 29, spawnTime: 33, originFloor: 0, destinationFloor: 9 },
  { id: 30, spawnTime: 35, originFloor: 0, destinationFloor: 6 },
  { id: 31, spawnTime: 38, originFloor: 0, destinationFloor: 4 },
  { id: 32, spawnTime: 40, originFloor: 0, destinationFloor: 5 },
  { id: 33, spawnTime: 43, originFloor: 0, destinationFloor: 2 },
  { id: 34, spawnTime: 45, originFloor: 0, destinationFloor: 8 },
  { id: 35, spawnTime: 48, originFloor: 4, destinationFloor: 7 },
  { id: 36, spawnTime: 52, originFloor: 0, destinationFloor: 9 },
  { id: 37, spawnTime: 55, originFloor: 0, destinationFloor: 3 },
  { id: 38, spawnTime: 59, originFloor: 0, destinationFloor: 6 },
  { id: 39, spawnTime: 62, originFloor: 0, destinationFloor: 7 },
  { id: 40, spawnTime: 65, originFloor: 1, destinationFloor: 4 },
  { id: 41, spawnTime: 70, originFloor: 0, destinationFloor: 5 },
  { id: 42, spawnTime: 74, originFloor: 0, destinationFloor: 8 },
  { id: 43, spawnTime: 78, originFloor: 0, destinationFloor: 2 },
  { id: 44, spawnTime: 83, originFloor: 2, destinationFloor: 9 },
  { id: 45, spawnTime: 88, originFloor: 0, destinationFloor: 9 },
  { id: 46, spawnTime: 94, originFloor: 0, destinationFloor: 3 },
  { id: 47, spawnTime: 100, originFloor: 0, destinationFloor: 7 },
  { id: 48, spawnTime: 106, originFloor: 5, destinationFloor: 8 },
  { id: 49, spawnTime: 112, originFloor: 0, destinationFloor: 6 },
  { id: 50, spawnTime: 120, originFloor: 0, destinationFloor: 4 },
];

const eveningRushScenario: PassengerManifest = [
  { id: 1, spawnTime: 5, originFloor: 8, destinationFloor: 4 },
  { id: 2, spawnTime: 10, originFloor: 9, destinationFloor: 0 },
  { id: 3, spawnTime: 12, originFloor: 7, destinationFloor: 0 },
  { id: 4, spawnTime: 14, originFloor: 5, destinationFloor: 0 },
  { id: 5, spawnTime: 15, originFloor: 6, destinationFloor: 0 },
  { id: 6, spawnTime: 17, originFloor: 8, destinationFloor: 0 },
  { id: 7, spawnTime: 18, originFloor: 4, destinationFloor: 0 },
  { id: 8, spawnTime: 20, originFloor: 3, destinationFloor: 0 },
  { id: 9, spawnTime: 22, originFloor: 9, destinationFloor: 0 },
  { id: 10, spawnTime: 24, originFloor: 2, destinationFloor: 0 },
  { id: 11, spawnTime: 25, originFloor: 7, destinationFloor: 0 },
  { id: 12, spawnTime: 27, originFloor: 5, destinationFloor: 2 },
  { id: 13, spawnTime: 29, originFloor: 6, destinationFloor: 0 },
  { id: 14, spawnTime: 31, originFloor: 4, destinationFloor: 0 },
  { id: 15, spawnTime: 33, originFloor: 8, destinationFloor: 0 },
  { id: 16, spawnTime: 34, originFloor: 3, destinationFloor: 0 },
  { id: 17, spawnTime: 36, originFloor: 9, destinationFloor: 0 },
  { id: 18, spawnTime: 38, originFloor: 1, destinationFloor: 0 },
  { id: 19, spawnTime: 40, originFloor: 7, destinationFloor: 0 },
  { id: 20, spawnTime: 41, originFloor: 5, destinationFloor: 0 },
  { id: 21, spawnTime: 43, originFloor: 6, destinationFloor: 0 },
  { id: 22, spawnTime: 45, originFloor: 2, destinationFloor: 0 },
  { id: 23, spawnTime: 47, originFloor: 8, destinationFloor: 0 },
  { id: 24, spawnTime: 48, originFloor: 4, destinationFloor: 0 },
  { id: 25, spawnTime: 50, originFloor: 9, destinationFloor: 5 },
  { id: 26, spawnTime: 52, originFloor: 3, destinationFloor: 0 },
  { id: 27, spawnTime: 54, originFloor: 7, destinationFloor: 0 },
  { id: 28, spawnTime: 55, originFloor: 1, destinationFloor: 0 },
  { id: 29, spawnTime: 57, originFloor: 6, destinationFloor: 0 },
  { id: 30, spawnTime: 59, originFloor: 8, destinationFloor: 0 },
  { id: 31, spawnTime: 61, originFloor: 2, destinationFloor: 0 },
  { id: 32, spawnTime: 62, originFloor: 5, destinationFloor: 0 },
  { id: 33, spawnTime: 64, originFloor: 9, destinationFloor: 0 },
  { id: 34, spawnTime: 66, originFloor: 4, destinationFloor: 0 },
  { id: 35, spawnTime: 68, originFloor: 7, destinationFloor: 0 },
  { id: 36, spawnTime: 70, originFloor: 3, destinationFloor: 0 },
  { id: 37, spawnTime: 71, originFloor: 6, destinationFloor: 0 },
  { id: 38, spawnTime: 73, originFloor: 8, destinationFloor: 0 },
  { id: 39, spawnTime: 75, originFloor: 1, destinationFloor: 0 },
  { id: 40, spawnTime: 77, originFloor: 9, destinationFloor: 3 },
  { id: 41, spawnTime: 79, originFloor: 5, destinationFloor: 0 },
  { id: 42, spawnTime: 81, originFloor: 2, destinationFloor: 0 },
  { id: 43, spawnTime: 83, originFloor: 7, destinationFloor: 0 },
  { id: 44, spawnTime: 85, originFloor: 4, destinationFloor: 0 },
  { id: 45, spawnTime: 88, originFloor: 8, destinationFloor: 0 },
  { id: 46, spawnTime: 91, originFloor: 6, destinationFloor: 0 },
  { id: 47, spawnTime: 94, originFloor: 3, destinationFloor: 0 },
  { id: 48, spawnTime: 98, originFloor: 9, destinationFloor: 0 },
  { id: 49, spawnTime: 102, originFloor: 5, destinationFloor: 0 },
  { id: 50, spawnTime: 105, originFloor: 7, destinationFloor: 0 },
];

export const passengerScenarios = [
    {
        name: '일반',
        manifest: normalScenario,
    },
    {
        name: '아침 출근 시간',
        manifest: morningRushScenario,
    },
    {
        name: '저녁 퇴근 시간',
        manifest: eveningRushScenario,
    },
    {
        name: '랜덤',
        manifest: [], // Placeholder for dynamically generated manifest
    }
];


// --- Scenarios for 100 Passengers ---

const normalScenario100: PassengerManifest = [
    { id: 1, spawnTime: 2, originFloor: 6, destinationFloor: 1 }, { id: 2, spawnTime: 4, originFloor: 3, destinationFloor: 8 }, { id: 3, spawnTime: 5, originFloor: 0, destinationFloor: 5 }, { id: 4, spawnTime: 7, originFloor: 7, destinationFloor: 2 }, { id: 5, spawnTime: 10, originFloor: 9, destinationFloor: 4 }, { id: 6, spawnTime: 12, originFloor: 1, destinationFloor: 7 }, { id: 7, spawnTime: 15, originFloor: 5, destinationFloor: 0 }, { id: 8, spawnTime: 18, originFloor: 8, destinationFloor: 3 }, { id: 9, spawnTime: 21, originFloor: 2, destinationFloor: 9 }, { id: 10, spawnTime: 24, originFloor: 4, destinationFloor: 6 },
    { id: 11, spawnTime: 28, originFloor: 6, destinationFloor: 0 }, { id: 12, spawnTime: 31, originFloor: 1, destinationFloor: 5 }, { id: 13, spawnTime: 33, originFloor: 8, destinationFloor: 2 }, { id: 14, spawnTime: 35, originFloor: 3, destinationFloor: 7 }, { id: 15, spawnTime: 38, originFloor: 9, destinationFloor: 1 }, { id: 16, spawnTime: 42, originFloor: 0, destinationFloor: 8 }, { id: 17, spawnTime: 45, originFloor: 5, destinationFloor: 3 }, { id: 18, spawnTime: 47, originFloor: 2, destinationFloor: 6 }, { id: 19, spawnTime: 50, originFloor: 7, destinationFloor: 9 }, { id: 20, spawnTime: 53, originFloor: 4, destinationFloor: 0 },
    { id: 21, spawnTime: 57, originFloor: 9, destinationFloor: 2 }, { id: 22, spawnTime: 60, originFloor: 1, destinationFloor: 8 }, { id: 23, spawnTime: 63, originFloor: 6, destinationFloor: 3 }, { id: 24, spawnTime: 65, originFloor: 3, destinationFloor: 9 }, { id: 25, spawnTime: 69, originFloor: 7, destinationFloor: 1 }, { id: 26, spawnTime: 72, originFloor: 0, destinationFloor: 6 }, { id: 27, spawnTime: 75, originFloor: 5, destinationFloor: 2 }, { id: 28, spawnTime: 78, originFloor: 2, destinationFloor: 7 }, { id: 29, spawnTime: 81, originFloor: 8, destinationFloor: 4 }, { id: 30, spawnTime: 84, originFloor: 4, destinationFloor: 1 },
    { id: 31, spawnTime: 88, originFloor: 7, destinationFloor: 3 }, { id: 32, spawnTime: 91, originFloor: 1, destinationFloor: 9 }, { id: 33, spawnTime: 94, originFloor: 5, destinationFloor: 8 }, { id: 34, spawnTime: 96, originFloor: 9, destinationFloor: 0 }, { id: 35, spawnTime: 100, originFloor: 2, destinationFloor: 5 }, { id: 36, spawnTime: 103, originFloor: 6, destinationFloor: 4 }, { id: 37, spawnTime: 106, originFloor: 0, destinationFloor: 7 }, { id: 38, spawnTime: 109, originFloor: 4, destinationFloor: 2 }, { id: 39, spawnTime: 112, originFloor: 8, destinationFloor: 1 }, { id: 40, spawnTime: 115, originFloor: 3, destinationFloor: 6 },
    { id: 41, spawnTime: 119, originFloor: 9, destinationFloor: 5 }, { id: 42, spawnTime: 122, originFloor: 2, destinationFloor: 8 }, { id: 43, spawnTime: 125, originFloor: 7, destinationFloor: 0 }, { id: 44, spawnTime: 128, originFloor: 4, destinationFloor: 9 }, { id: 45, spawnTime: 131, originFloor: 1, destinationFloor: 6 }, { id: 46, spawnTime: 134, originFloor: 6, destinationFloor: 2 }, { id: 47, spawnTime: 137, originFloor: 3, destinationFloor: 5 }, { id: 48, spawnTime: 140, originFloor: 8, destinationFloor: 0 }, { id: 49, spawnTime: 143, originFloor: 0, destinationFloor: 4 }, { id: 50, spawnTime: 146, originFloor: 5, destinationFloor: 7 },
    { id: 51, spawnTime: 150, originFloor: 8, destinationFloor: 5 }, { id: 52, spawnTime: 153, originFloor: 3, destinationFloor: 9 }, { id: 53, spawnTime: 156, originFloor: 6, destinationFloor: 1 }, { id: 54, spawnTime: 159, originFloor: 1, destinationFloor: 7 }, { id: 55, spawnTime: 162, originFloor: 9, destinationFloor: 3 }, { id: 56, spawnTime: 165, originFloor: 4, destinationFloor: 8 }, { id: 57, spawnTime: 168, originFloor: 7, destinationFloor: 2 }, { id: 58, spawnTime: 171, originFloor: 2, destinationFloor: 6 }, { id: 59, spawnTime: 174, originFloor: 5, destinationFloor: 0 }, { id: 60, spawnTime: 177, originFloor: 0, destinationFloor: 9 },
    { id: 61, spawnTime: 181, originFloor: 4, destinationFloor: 1 }, { id: 62, spawnTime: 184, originFloor: 8, destinationFloor: 6 }, { id: 63, spawnTime: 187, originFloor: 2, destinationFloor: 7 }, { id: 64, spawnTime: 190, originFloor: 6, destinationFloor: 3 }, { id: 65, spawnTime: 193, originFloor: 9, destinationFloor: 0 }, { id: 66, spawnTime: 196, originFloor: 3, destinationFloor: 5 }, { id: 67, spawnTime: 199, originFloor: 7, destinationFloor: 4 }, { id: 68, spawnTime: 202, originFloor: 1, destinationFloor: 9 }, { id: 69, spawnTime: 205, originFloor: 5, destinationFloor: 2 }, { id: 70, spawnTime: 208, originFloor: 0, destinationFloor: 7 },
    { id: 71, spawnTime: 212, originFloor: 6, destinationFloor: 4 }, { id: 72, spawnTime: 215, originFloor: 2, destinationFloor: 9 }, { id: 73, spawnTime: 218, originFloor: 8, destinationFloor: 3 }, { id: 74, spawnTime: 221, originFloor: 4, destinationFloor: 7 }, { id: 75, spawnTime: 224, originFloor: 9, destinationFloor: 1 }, { id: 76, spawnTime: 227, originFloor: 1, destinationFloor: 5 }, { id: 77, spawnTime: 230, originFloor: 5, destinationFloor: 8 }, { id: 78, spawnTime: 233, originFloor: 0, destinationFloor: 6 }, { id: 79, spawnTime: 236, originFloor: 7, destinationFloor: 0 }, { id: 80, spawnTime: 239, originFloor: 3, destinationFloor: 2 },
    { id: 81, spawnTime: 243, originFloor: 7, destinationFloor: 5 }, { id: 82, spawnTime: 246, originFloor: 2, destinationFloor: 8 }, { id: 83, spawnTime: 249, originFloor: 6, destinationFloor: 0 }, { id: 84, spawnTime: 252, originFloor: 9, destinationFloor: 4 }, { id: 85, spawnTime: 255, originFloor: 4, destinationFloor: 1 }, { id: 86, spawnTime: 258, originFloor: 1, destinationFloor: 6 }, { id: 87, spawnTime: 261, originFloor: 5, destinationFloor: 3 }, { id: 88, spawnTime: 264, originFloor: 8, destinationFloor: 2 }, { id: 89, spawnTime: 267, originFloor: 0, destinationFloor: 9 }, { id: 90, spawnTime: 270, originFloor: 3, destinationFloor: 7 },
    { id: 91, spawnTime: 274, originFloor: 8, destinationFloor: 1 }, { id: 92, spawnTime: 277, originFloor: 4, destinationFloor: 6 }, { id: 93, spawnTime: 280, originFloor: 7, destinationFloor: 9 }, { id: 94, spawnTime: 283, originFloor: 2, destinationFloor: 5 }, { id: 95, spawnTime: 286, originFloor: 9, destinationFloor: 2 }, { id: 96, spawnTime: 289, originFloor: 5, destinationFloor: 7 }, { id: 97, spawnTime: 292, originFloor: 1, destinationFloor: 8 }, { id: 98, spawnTime: 295, originFloor: 6, destinationFloor: 3 }, { id: 99, spawnTime: 298, originFloor: 3, destinationFloor: 0 }, { id: 100, spawnTime: 301, originFloor: 0, destinationFloor: 4 },
];

const morningRushScenario100: PassengerManifest = [
    { id: 1, spawnTime: 1, originFloor: 0, destinationFloor: 7 }, { id: 2, spawnTime: 2, originFloor: 0, destinationFloor: 5 }, { id: 3, spawnTime: 3, originFloor: 1, destinationFloor: 9 }, { id: 4, spawnTime: 4, originFloor: 0, destinationFloor: 4 }, { id: 5, spawnTime: 5, originFloor: 0, destinationFloor: 8 }, { id: 6, spawnTime: 6, originFloor: 0, destinationFloor: 6 }, { id: 7, spawnTime: 7, originFloor: 2, destinationFloor: 7 }, { id: 8, spawnTime: 8, originFloor: 0, destinationFloor: 3 }, { id: 9, spawnTime: 9, originFloor: 0, destinationFloor: 9 }, { id: 10, spawnTime: 10, originFloor: 0, destinationFloor: 2 },
    { id: 11, spawnTime: 12, originFloor: 0, destinationFloor: 5 }, { id: 12, spawnTime: 13, originFloor: 0, destinationFloor: 8 }, { id: 13, spawnTime: 15, originFloor: 0, destinationFloor: 6 }, { id: 14, spawnTime: 16, originFloor: 0, destinationFloor: 4 }, { id: 15, spawnTime: 18, originFloor: 1, destinationFloor: 7 }, { id: 16, spawnTime: 20, originFloor: 0, destinationFloor: 9 }, { id: 17, spawnTime: 22, originFloor: 0, destinationFloor: 3 }, { id: 18, spawnTime: 24, originFloor: 0, destinationFloor: 5 }, { id: 19, spawnTime: 26, originFloor: 0, destinationFloor: 8 }, { id: 20, spawnTime: 28, originFloor: 2, destinationFloor: 6 },
    { id: 21, spawnTime: 30, originFloor: 0, destinationFloor: 7 }, { id: 22, spawnTime: 32, originFloor: 0, destinationFloor: 2 }, { id: 23, spawnTime: 34, originFloor: 0, destinationFloor: 9 }, { id: 24, spawnTime: 36, originFloor: 1, destinationFloor: 5 }, { id: 25, spawnTime: 38, originFloor: 0, destinationFloor: 4 }, { id: 26, spawnTime: 40, originFloor: 0, destinationFloor: 8 }, { id: 27, spawnTime: 42, originFloor: 0, destinationFloor: 6 }, { id: 28, spawnTime: 44, originFloor: 3, destinationFloor: 7 }, { id: 29, spawnTime: 46, originFloor: 0, destinationFloor: 3 }, { id: 30, spawnTime: 48, originFloor: 0, destinationFloor: 9 },
    { id: 31, spawnTime: 50, originFloor: 0, destinationFloor: 5 }, { id: 32, spawnTime: 52, originFloor: 0, destinationFloor: 7 }, { id: 33, spawnTime: 54, originFloor: 1, destinationFloor: 8 }, { id: 34, spawnTime: 56, originFloor: 0, destinationFloor: 2 }, { id: 35, spawnTime: 58, originFloor: 0, destinationFloor: 6 }, { id: 36, spawnTime: 60, originFloor: 0, destinationFloor: 4 }, { id: 37, spawnTime: 63, originFloor: 2, destinationFloor: 9 }, { id: 38, spawnTime: 65, originFloor: 0, destinationFloor: 7 }, { id: 39, spawnTime: 67, originFloor: 0, destinationFloor: 5 }, { id: 40, spawnTime: 69, originFloor: 0, destinationFloor: 3 },
    { id: 41, spawnTime: 71, originFloor: 0, destinationFloor: 8 }, { id: 42, spawnTime: 73, originFloor: 1, destinationFloor: 6 }, { id: 43, spawnTime: 75, originFloor: 0, destinationFloor: 9 }, { id: 44, spawnTime: 77, originFloor: 0, destinationFloor: 4 }, { id: 45, spawnTime: 79, originFloor: 0, destinationFloor: 2 }, { id: 46, spawnTime: 81, originFloor: 3, destinationFloor: 8 }, { id: 47, spawnTime: 83, originFloor: 0, destinationFloor: 7 }, { id: 48, spawnTime: 85, originFloor: 0, destinationFloor: 5 }, { id: 49, spawnTime: 87, originFloor: 0, destinationFloor: 9 }, { id: 50, spawnTime: 89, originFloor: 1, destinationFloor: 4 },
    { id: 51, spawnTime: 92, originFloor: 0, destinationFloor: 6 }, { id: 52, spawnTime: 94, originFloor: 0, destinationFloor: 8 }, { id: 53, spawnTime: 96, originFloor: 2, destinationFloor: 5 }, { id: 54, spawnTime: 98, originFloor: 0, destinationFloor: 3 }, { id: 55, spawnTime: 100, originFloor: 0, destinationFloor: 7 }, { id: 56, spawnTime: 102, originFloor: 0, destinationFloor: 9 }, { id: 57, spawnTime: 104, originFloor: 1, destinationFloor: 5 }, { id: 58, spawnTime: 106, originFloor: 0, destinationFloor: 8 }, { id: 59, spawnTime: 108, originFloor: 0, destinationFloor: 2 }, { id: 60, spawnTime: 110, originFloor: 0, destinationFloor: 6 },
    { id: 61, spawnTime: 113, originFloor: 4, destinationFloor: 9 }, { id: 62, spawnTime: 115, originFloor: 0, destinationFloor: 4 }, { id: 63, spawnTime: 117, originFloor: 0, destinationFloor: 7 }, { id: 64, spawnTime: 119, originFloor: 0, destinationFloor: 5 }, { id: 65, spawnTime: 121, originFloor: 1, destinationFloor: 9 }, { id: 66, spawnTime: 123, originFloor: 0, destinationFloor: 3 }, { id: 67, spawnTime: 125, originFloor: 0, destinationFloor: 8 }, { id: 68, spawnTime: 127, originFloor: 2, destinationFloor: 7 }, { id: 69, spawnTime: 129, originFloor: 0, destinationFloor: 6 }, { id: 70, spawnTime: 131, originFloor: 0, destinationFloor: 2 },
    { id: 71, spawnTime: 134, originFloor: 0, destinationFloor: 9 }, { id: 72, spawnTime: 136, originFloor: 0, destinationFloor: 5 }, { id: 73, spawnTime: 138, originFloor: 0, destinationFloor: 7 }, { id: 74, spawnTime: 140, originFloor: 1, destinationFloor: 4 }, { id: 75, spawnTime: 142, originFloor: 0, destinationFloor: 8 }, { id: 76, spawnTime: 144, originFloor: 0, destinationFloor: 6 }, { id: 77, spawnTime: 146, originFloor: 3, destinationFloor: 9 }, { id: 78, spawnTime: 148, originFloor: 0, destinationFloor: 3 }, { id: 79, spawnTime: 150, originFloor: 0, destinationFloor: 5 }, { id: 80, spawnTime: 152, originFloor: 0, destinationFloor: 7 },
    { id: 81, spawnTime: 155, originFloor: 0, destinationFloor: 2 }, { id: 82, spawnTime: 157, originFloor: 1, destinationFloor: 8 }, { id: 83, spawnTime: 159, originFloor: 0, destinationFloor: 9 }, { id: 84, spawnTime: 161, originFloor: 0, destinationFloor: 4 }, { id: 85, spawnTime: 163, originFloor: 2, destinationFloor: 6 }, { id: 86, spawnTime: 165, originFloor: 0, destinationFloor: 7 }, { id: 87, spawnTime: 167, originFloor: 0, destinationFloor: 5 }, { id: 88, spawnTime: 169, originFloor: 0, destinationFloor: 8 }, { id: 89, spawnTime: 171, originFloor: 4, destinationFloor: 7 }, { id: 90, spawnTime: 173, originFloor: 0, destinationFloor: 3 },
    { id: 91, spawnTime: 176, originFloor: 0, destinationFloor: 9 }, { id: 92, spawnTime: 178, originFloor: 0, destinationFloor: 6 }, { id: 93, spawnTime: 180, originFloor: 1, destinationFloor: 5 }, { id: 94, spawnTime: 182, originFloor: 0, destinationFloor: 2 }, { id: 95, spawnTime: 184, originFloor: 0, destinationFloor: 8 }, { id: 96, spawnTime: 186, originFloor: 0, destinationFloor: 4 }, { id: 97, spawnTime: 188, originFloor: 2, destinationFloor: 9 }, { id: 98, spawnTime: 190, originFloor: 0, destinationFloor: 7 }, { id: 99, spawnTime: 192, originFloor: 0, destinationFloor: 5 }, { id: 100, spawnTime: 195, originFloor: 0, destinationFloor: 8 },
];

const eveningRushScenario100: PassengerManifest = [
    { id: 1, spawnTime: 2, originFloor: 8, destinationFloor: 0 }, { id: 2, spawnTime: 4, originFloor: 9, destinationFloor: 1 }, { id: 3, spawnTime: 5, originFloor: 7, destinationFloor: 0 }, { id: 4, spawnTime: 7, originFloor: 6, destinationFloor: 0 }, { id: 5, spawnTime: 10, originFloor: 5, destinationFloor: 0 }, { id: 6, spawnTime: 12, originFloor: 8, destinationFloor: 0 }, { id: 7, spawnTime: 15, originFloor: 4, destinationFloor: 0 }, { id: 8, spawnTime: 18, originFloor: 9, destinationFloor: 0 }, { id: 9, spawnTime: 21, originFloor: 3, destinationFloor: 0 }, { id: 10, spawnTime: 24, originFloor: 7, destinationFloor: 0 },
    { id: 11, spawnTime: 28, originFloor: 2, destinationFloor: 0 }, { id: 12, spawnTime: 31, originFloor: 6, destinationFloor: 1 }, { id: 13, spawnTime: 33, originFloor: 8, destinationFloor: 0 }, { id: 14, spawnTime: 35, originFloor: 5, destinationFloor: 0 }, { id: 15, spawnTime: 38, originFloor: 9, destinationFloor: 0 }, { id: 16, spawnTime: 42, originFloor: 4, destinationFloor: 0 }, { id: 17, spawnTime: 45, originFloor: 7, destinationFloor: 0 }, { id: 18, spawnTime: 47, originFloor: 3, destinationFloor: 0 }, { id: 19, spawnTime: 50, originFloor: 6, destinationFloor: 0 }, { id: 20, spawnTime: 53, originFloor: 8, destinationFloor: 2 },
    { id: 21, spawnTime: 57, originFloor: 9, destinationFloor: 0 }, { id: 22, spawnTime: 60, originFloor: 5, destinationFloor: 0 }, { id: 23, spawnTime: 63, originFloor: 2, destinationFloor: 0 }, { id: 24, spawnTime: 65, originFloor: 7, destinationFloor: 0 }, { id: 25, spawnTime: 69, originFloor: 4, destinationFloor: 0 }, { id: 26, spawnTime: 72, originFloor: 8, destinationFloor: 0 }, { id: 27, spawnTime: 75, originFloor: 6, destinationFloor: 0 }, { id: 28, spawnTime: 78, originFloor: 3, destinationFloor: 0 }, { id: 29, spawnTime: 81, originFloor: 9, destinationFloor: 1 }, { id: 30, spawnTime: 84, originFloor: 5, destinationFloor: 0 },
    { id: 31, spawnTime: 88, originFloor: 7, destinationFloor: 0 }, { id: 32, spawnTime: 91, originFloor: 4, destinationFloor: 0 }, { id: 33, spawnTime: 94, originFloor: 8, destinationFloor: 0 }, { id: 34, spawnTime: 96, originFloor: 2, destinationFloor: 0 }, { id: 35, spawnTime: 100, originFloor: 6, destinationFloor: 0 }, { id: 36, spawnTime: 103, originFloor: 9, destinationFloor: 0 }, { id: 37, spawnTime: 106, originFloor: 3, destinationFloor: 0 }, { id: 38, spawnTime: 109, originFloor: 5, destinationFloor: 0 }, { id: 39, spawnTime: 112, originFloor: 7, destinationFloor: 2 }, { id: 40, spawnTime: 115, originFloor: 8, destinationFloor: 0 },
    { id: 41, spawnTime: 119, originFloor: 4, destinationFloor: 0 }, { id: 42, spawnTime: 122, originFloor: 6, destinationFloor: 0 }, { id: 43, spawnTime: 125, originFloor: 9, destinationFloor: 0 }, { id: 44, spawnTime: 128, originFloor: 2, destinationFloor: 0 }, { id: 45, spawnTime: 131, originFloor: 5, destinationFloor: 0 }, { id: 46, spawnTime: 134, originFloor: 7, destinationFloor: 0 }, { id: 47, spawnTime: 137, originFloor: 8, destinationFloor: 0 }, { id: 48, spawnTime: 140, originFloor: 3, destinationFloor: 0 }, { id: 49, spawnTime: 143, originFloor: 9, destinationFloor: 0 }, { id: 50, spawnTime: 146, originFloor: 6, destinationFloor: 0 },
    { id: 51, spawnTime: 150, originFloor: 4, destinationFloor: 0 }, { id: 52, spawnTime: 153, originFloor: 7, destinationFloor: 0 }, { id: 53, spawnTime: 156, originFloor: 2, destinationFloor: 1 }, { id: 54, spawnTime: 159, originFloor: 8, destinationFloor: 0 }, { id: 55, spawnTime: 162, originFloor: 5, destinationFloor: 0 }, { id: 56, spawnTime: 165, originFloor: 9, destinationFloor: 0 }, { id: 57, spawnTime: 168, originFloor: 3, destinationFloor: 0 }, { id: 58, spawnTime: 171, originFloor: 6, destinationFloor: 0 }, { id: 59, spawnTime: 174, originFloor: 8, destinationFloor: 0 }, { id: 60, spawnTime: 177, originFloor: 7, destinationFloor: 0 },
    { id: 61, spawnTime: 181, originFloor: 4, destinationFloor: 0 }, { id: 62, spawnTime: 184, originFloor: 9, destinationFloor: 2 }, { id: 63, spawnTime: 187, originFloor: 5, destinationFloor: 0 }, { id: 64, spawnTime: 190, originFloor: 2, destinationFloor: 0 }, { id: 65, spawnTime: 193, originFloor: 6, destinationFloor: 0 }, { id: 66, spawnTime: 196, originFloor: 8, destinationFloor: 0 }, { id: 67, spawnTime: 199, originFloor: 3, destinationFloor: 0 }, { id: 68, spawnTime: 202, originFloor: 7, destinationFloor: 0 }, { id: 69, spawnTime: 205, originFloor: 9, destinationFloor: 0 }, { id: 70, spawnTime: 208, originFloor: 5, destinationFloor: 0 },
    { id: 71, spawnTime: 212, originFloor: 8, destinationFloor: 1 }, { id: 72, spawnTime: 215, originFloor: 4, destinationFloor: 0 }, { id: 73, spawnTime: 218, originFloor: 6, destinationFloor: 0 }, { id: 74, spawnTime: 221, originFloor: 2, destinationFloor: 0 }, { id: 75, spawnTime: 224, originFloor: 7, destinationFloor: 0 }, { id: 76, spawnTime: 227, originFloor: 9, destinationFloor: 0 }, { id: 77, spawnTime: 230, originFloor: 3, destinationFloor: 0 }, { id: 78, spawnTime: 233, originFloor: 5, destinationFloor: 0 }, { id: 79, spawnTime: 236, originFloor: 8, destinationFloor: 0 }, { id: 80, spawnTime: 239, originFloor: 6, destinationFloor: 0 },
    { id: 81, spawnTime: 243, originFloor: 4, destinationFloor: 0 }, { id: 82, spawnTime: 246, originFloor: 9, destinationFloor: 0 }, { id: 83, spawnTime: 249, originFloor: 7, destinationFloor: 1 }, { id: 84, spawnTime: 252, originFloor: 2, destinationFloor: 0 }, { id: 85, spawnTime: 255, originFloor: 5, destinationFloor: 0 }, { id: 86, spawnTime: 258, originFloor: 8, destinationFloor: 0 }, { id: 87, spawnTime: 261, originFloor: 3, destinationFloor: 0 }, { id: 88, spawnTime: 264, originFloor: 6, destinationFloor: 0 }, { id: 89, spawnTime: 267, originFloor: 9, destinationFloor: 0 }, { id: 90, spawnTime: 270, originFloor: 4, destinationFloor: 0 },
    { id: 91, spawnTime: 274, originFloor: 7, destinationFloor: 0 }, { id: 92, spawnTime: 277, originFloor: 5, destinationFloor: 0 }, { id: 93, spawnTime: 280, originFloor: 8, destinationFloor: 0 }, { id: 94, spawnTime: 283, originFloor: 2, destinationFloor: 0 }, { id: 95, spawnTime: 286, originFloor: 6, destinationFloor: 1 }, { id: 96, spawnTime: 289, originFloor: 9, destinationFloor: 0 }, { id: 97, spawnTime: 292, originFloor: 3, destinationFloor: 0 }, { id: 98, spawnTime: 295, originFloor: 7, destinationFloor: 0 }, { id: 99, spawnTime: 298, originFloor: 5, destinationFloor: 0 }, { id: 100, spawnTime: 301, originFloor: 8, destinationFloor: 0 },
];

export const passengerScenarios100 = [
    {
        name: '일반',
        manifest: normalScenario100,
    },
    {
        name: '아침 출근 시간',
        manifest: morningRushScenario100,
    },
    {
        name: '저녁 퇴근 시간',
        manifest: eveningRushScenario100,
    },
    {
        name: '랜덤',
        manifest: [], // Placeholder for dynamically generated manifest
    }
];
