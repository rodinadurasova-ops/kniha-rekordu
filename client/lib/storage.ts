import AsyncStorage from "@react-native-async-storage/async-storage";
import { Segment, SwimmingRecord, Workout, Settings, DEFAULT_SETTINGS } from "./types";
import { generateMockData, calculateRecords } from "./mockData";

const STORAGE_KEYS = {
  WORKOUTS: "@swimming_workouts",
  SEGMENTS: "@swimming_segments",
  RECORDS: "@swimming_records",
  SETTINGS: "@swimming_settings",
  INITIALIZED: "@swimming_initialized",
};

export const initializeData = async (): Promise<boolean> => {
  try {
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (initialized === "true") {
      return false;
    }

    const { workouts, segments, records } = generateMockData();
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    await AsyncStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(segments));
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");

    return true;
  } catch (error) {
    console.error("Error initializing data:", error);
    return false;
  }
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting workouts:", error);
    return [];
  }
};

export const getSegments = async (): Promise<Segment[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SEGMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting segments:", error);
    return [];
  }
};

export const getRecords = async (): Promise<SwimmingRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting records:", error);
    return [];
  }
};

export const getSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error getting settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const getSegmentById = async (segmentId: string): Promise<Segment | null> => {
  try {
    const segments = await getSegments();
    return segments.find((s) => s.id === segmentId) || null;
  } catch (error) {
    console.error("Error getting segment:", error);
    return null;
  }
};

export const getWorkoutById = async (workoutId: string): Promise<Workout | null> => {
  try {
    const workouts = await getWorkouts();
    return workouts.find((w) => w.id === workoutId) || null;
  } catch (error) {
    console.error("Error getting workout:", error);
    return null;
  }
};

export const updateSegmentStyle = async (
  segmentId: string,
  newStyle: string
): Promise<void> => {
  try {
    const segments = await getSegments();
    const updatedSegments = segments.map((s) =>
      s.id === segmentId ? { ...s, strokeStyle: newStyle as any } : s
    );
    await AsyncStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(updatedSegments));
    
    const newRecords = calculateRecords(updatedSegments);
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(newRecords));
  } catch (error) {
    console.error("Error updating segment style:", error);
  }
};

export const recalculateRecords = async (): Promise<void> => {
  try {
    const segments = await getSegments();
    const newRecords = calculateRecords(segments);
    await AsyncStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(newRecords));
  } catch (error) {
    console.error("Error recalculating records:", error);
  }
};

export const resetAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    await initializeData();
  } catch (error) {
    console.error("Error resetting data:", error);
  }
};
