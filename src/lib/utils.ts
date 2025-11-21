import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 落ち着いたパステルカラーパレット（10色）- 視認性を向上させた濃い色
export const EQUIPMENT_COLORS = [
  "#B3D9E6", // 青
  "#D4B3E6", // 紫
  "#FFD9B3", // オレンジ
  "#B3E6B3", // 緑
  "#FFB3D9", // ピンク
  "#B3E6D9", // ティール
  "#FFE6B3", // 黄色
  "#E6B3E6", // ラベンダー
  "#B3D9FF", // スカイブルー
  "#D9E6B3", // ライムグリーン
];

// Helper function to get color index from equipmentId (0-9)
// Uses a simple hash function to ensure consistent color assignment
export function getColorIndexFromEquipmentId(equipmentId: string): number {
  let hash = 0;
  for (let i = 0; i < equipmentId.length; i++) {
    const char = equipmentId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % EQUIPMENT_COLORS.length;
}

// Get color hex code from equipmentId
export function getEquipmentColor(equipmentId: string): string {
  const colorIndex = getColorIndexFromEquipmentId(equipmentId);
  return EQUIPMENT_COLORS[colorIndex] || EQUIPMENT_COLORS[0];
}
