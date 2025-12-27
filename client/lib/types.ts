export type StrokeStyle =
  | "freestyle"
  | "backstroke"
  | "breaststroke"
  | "butterfly"
  | "medley"
  | "unknown";

export const STROKE_LABELS: Record<StrokeStyle, string> = {
  freestyle: "Kraul",
  backstroke: "Znak",
  breaststroke: "Prsa",
  butterfly: "Motýl",
  medley: "Mix",
  unknown: "Neznámý",
};

export const DISTANCES = [50, 100, 200, 300, 400, 500, 600] as const;
export type Distance = (typeof DISTANCES)[number];

export interface Lap {
  id: string;
  segmentId: string;
  lapIndex: number;
  startDateTime: string;
  distanceMeters: number;
  elapsedSeconds: number;
  strokeStyle: StrokeStyle;
}

export interface Segment {
  id: string;
  workoutId: string;
  startDateTime: string;
  distanceMeters: number;
  elapsedSeconds: number;
  strokeStyle: StrokeStyle;
  lapRange: [number, number];
  laps: Lap[];
}

export interface SwimmingRecord {
  id: string;
  strokeStyle: StrokeStyle;
  distanceMeters: number;
  bestElapsedSeconds: number;
  bestDate: string;
  bestSegmentId: string;
}

export interface Workout {
  id: string;
  startDate: string;
  endDate: string;
  durationSeconds: number;
  totalDistanceMeters: number;
  poolLengthMeters: number;
}

export interface DayGroup {
  date: string;
  bestTime: number;
  segments: Segment[];
}

export interface Settings {
  displayName: string;
  avatarIndex: number;
  showUnknownRecords: boolean;
  themeMode: "light" | "dark" | "system";
  useHealthKit: boolean;
  lastHealthKitSync: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  displayName: "Plavec",
  avatarIndex: 0,
  showUnknownRecords: true,
  themeMode: "system",
  useHealthKit: false,
  lastHealthKitSync: null,
};
