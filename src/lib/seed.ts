import "dotenv/config";
import { db } from "@/infrastructure/database/drizzle";
import {
  users,
  buildings,
  floors,
  rooms,
  equipment,
  equipmentCategories,
  reservations,
} from "@/infrastructure/database/schema";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding database...");

  // Create Users
  const hashedPassword = await hash("password123", 10);

  const adminUser = {
    id: uuidv4(),
    email: "admin@example.com",
    password: hashedPassword,
    name: "Admin User",
    role: "ADMIN" as const,
  };

  // Create 2 editor users
  const editorUsers = Array.from({ length: 2 }, (_, i) => ({
    id: uuidv4(),
    email: `editor${i + 1}@example.com`,
    password: hashedPassword,
    name: `Editor User ${i + 1}`,
    role: "EDITOR" as const,
  }));

  // Create 10 general users
  const generalUsers = Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    email: `general${i + 1}@example.com`,
    password: hashedPassword,
    name: `General User ${i + 1}`,
    role: "GENERAL" as const,
  }));

  await db
    .insert(users)
    .values([adminUser, ...editorUsers, ...generalUsers])
    .onConflictDoNothing();
  console.log("Created users:");
  console.log("- admin@example.com / password123 (ADMIN)");
  editorUsers.forEach((user) => {
    console.log(`- ${user.email} / password123 (EDITOR)`);
  });
  generalUsers.forEach((user) => {
    console.log(`- ${user.email} / password123 (GENERAL)`);
  });

  // Create Buildings
  const buildingData = [
    { name: "Main Building", address: "123 Main Street" },
    { name: "Research Building", address: "456 Research Avenue" },
    { name: "Engineering Building", address: "789 Engineering Road" },
    { name: "Science Building", address: "321 Science Park" },
  ];

  const buildingsList = buildingData.map((b) => ({
    id: uuidv4(),
    name: b.name,
    address: b.address,
  }));

  await db.insert(buildings).values(buildingsList).onConflictDoNothing();
  console.log(`Created ${buildingsList.length} buildings`);

  // Create Floors (各建物に2-4フロア)
  const floorsList: Array<{
    id: string;
    name: string;
    buildingId: string;
    floorNumber: number;
  }> = [];

  buildingsList.forEach((building, buildingIndex) => {
    const floorCount =
      buildingIndex === 0
        ? 4
        : buildingIndex === 1
          ? 3
          : buildingIndex === 2
            ? 5
            : 3;
    for (let i = 1; i <= floorCount; i++) {
      floorsList.push({
        id: uuidv4(),
        name: `${i === 1 ? "1st" : i === 2 ? "2nd" : i === 3 ? "3rd" : `${i}th`} Floor`,
        buildingId: building.id,
        floorNumber: i,
      });
    }
  });

  await db.insert(floors).values(floorsList).onConflictDoNothing();
  console.log(`Created ${floorsList.length} floors`);

  // Create Rooms (各フロアに2-4部屋)
  const roomsList: Array<{
    id: string;
    name: string;
    floorId: string;
    capacity: number;
  }> = [];

  floorsList.forEach((floor) => {
    const roomCount = Math.floor(Math.random() * 3) + 2; // 2-4部屋
    for (let i = 1; i <= roomCount; i++) {
      const floorNumber = floor.floorNumber;
      const roomNumber = floorNumber * 100 + i;
      roomsList.push({
        id: uuidv4(),
        name: `Room ${roomNumber}`,
        floorId: floor.id,
        capacity: Math.floor(Math.random() * 30) + 10, // 10-40人
      });
    }
  });

  await db.insert(rooms).values(roomsList).onConflictDoNothing();
  console.log(`Created ${roomsList.length} rooms`);

  // Create Categories
  const categories = [
    { categoryMajor: "Laboratory", categoryMinor: "Optics" },
    { categoryMajor: "Laboratory", categoryMinor: "Processing" },
    { categoryMajor: "Laboratory", categoryMinor: "Measurement" },
    { categoryMajor: "Laboratory", categoryMinor: "Analysis" },
    { categoryMajor: "Office", categoryMinor: "Audio/Video" },
    { categoryMajor: "Office", categoryMinor: "Projection" },
    { categoryMajor: "Office", categoryMinor: "Printing" },
    { categoryMajor: "Office", categoryMinor: "Computing" },
    { categoryMajor: "Manufacturing", categoryMinor: "Cutting" },
    { categoryMajor: "Manufacturing", categoryMinor: "Molding" },
    { categoryMajor: "Medical", categoryMinor: "Diagnostic" },
    { categoryMajor: "Medical", categoryMinor: "Therapeutic" },
  ].map((cat) => ({
    id: uuidv4(),
    categoryMajor: cat.categoryMajor,
    categoryMinor: cat.categoryMinor,
  }));

  await db.insert(equipmentCategories).values(categories).onConflictDoNothing();
  console.log(`Created ${categories.length} categories`);

  // Create Equipment (各部屋に最低1つ、多くて3つ)
  const equipmentNames = [
    // Laboratory - Optics
    ["Microscope", "Spectrometer", "Laser System", "Optical Bench"],
    // Laboratory - Processing
    ["Centrifuge", "Autoclave", "Incubator", "Shaker"],
    // Laboratory - Measurement
    ["Balance", "pH Meter", "Thermometer", "Oscilloscope"],
    // Laboratory - Analysis
    ["Chromatograph", "Mass Spectrometer", "Analyzer", "Detector"],
    // Office - Audio/Video
    ["Speaker System", "Microphone", "Video Camera", "Audio Mixer"],
    // Office - Projection
    ["Projector", "Display Screen", "Interactive Whiteboard", "Monitor"],
    // Office - Printing
    ["Printer", "Scanner", "Copier", "Plotter"],
    // Office - Computing
    ["Workstation", "Server", "Tablet", "Laptop"],
    // Manufacturing - Cutting
    ["Laser Cutter", "CNC Machine", "Water Jet", "Plasma Cutter"],
    // Manufacturing - Molding
    ["Injection Molder", "Press Machine", "Extruder", "Mold"],
    // Medical - Diagnostic
    ["X-Ray Machine", "Ultrasound", "MRI Scanner", "CT Scanner"],
    // Medical - Therapeutic
    [
      "Therapy Device",
      "Treatment Unit",
      "Rehabilitation Equipment",
      "Therapy Chair",
    ],
  ];

  const equipmentsList: Array<{
    id: string;
    name: string;
    description: string;
    categoryMajor: string;
    categoryMinor: string;
    roomId: string;
  }> = [];

  roomsList.forEach((room, roomIndex) => {
    const equipmentCount = Math.floor(Math.random() * 3) + 1; // 1-3装置（最低1つ）
    for (let i = 0; i < equipmentCount; i++) {
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const category = categories[categoryIndex];
      const nameList = equipmentNames[categoryIndex] || equipmentNames[0];
      const baseName = nameList[Math.floor(Math.random() * nameList.length)];
      const equipmentName = `${baseName} ${String.fromCharCode(65 + (roomIndex % 26))}${i + 1}`;

      equipmentsList.push({
        id: uuidv4(),
        name: equipmentName,
        description: `High quality ${baseName.toLowerCase()} for ${room.name}`,
        categoryMajor: category.categoryMajor,
        categoryMinor: category.categoryMinor,
        roomId: room.id,
      });
    }
  });

  await db.insert(equipment).values(equipmentsList).onConflictDoNothing();
  console.log(`Created ${equipmentsList.length} equipment items`);

  // Create Reservations
  const allUsers = [adminUser, ...editorUsers, ...generalUsers];
  const reservationsList: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    comment: string | null;
    userId: string;
    equipmentId: string;
  }> = [];

  // 各装置に対して、ランダムに1-3件の予約を作成
  equipmentsList.forEach((equipment) => {
    const reservationCount = Math.floor(Math.random() * 3) + 1; // 1-3予約
    for (let i = 0; i < reservationCount; i++) {
      // ランダムなユーザーを選択
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];

      // 未来の日付で予約を作成（今日から30日後まで）
      const daysFromNow = Math.floor(Math.random() * 30);
      const startHour = Math.floor(Math.random() * 8) + 9; // 9時から16時まで
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + daysFromNow);
      startDate.setHours(startHour, Math.floor(Math.random() * 4) * 15, 0, 0); // 0分、15分、30分、45分

      const endDate = new Date(startDate);
      const durationHours = Math.floor(Math.random() * 3) + 1; // 1-3時間の予約
      endDate.setHours(startDate.getHours() + durationHours);

      const comments = [
        "Research project",
        "Team meeting",
        "Training session",
        "Maintenance check",
        "Data collection",
        "Experiment",
        "Presentation",
        null,
        null, // コメントなしの確率を高く
      ];

      reservationsList.push({
        id: uuidv4(),
        startTime: startDate,
        endTime: endDate,
        comment: comments[Math.floor(Math.random() * comments.length)],
        userId: user.id,
        equipmentId: equipment.id,
      });
    }
  });

  await db.insert(reservations).values(reservationsList).onConflictDoNothing();
  console.log(`Created ${reservationsList.length} reservations`);

  console.log("Seeding finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
