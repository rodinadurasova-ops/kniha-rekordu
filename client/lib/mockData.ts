import {
  StrokeStyle,
  Segment,
  SwimmingRecord,
  Workout,
  Lap,
  DISTANCES,
  Distance,
} from "./types";

const generateId = () => Math.random().toString(36).substring(2, 15);

const STROKE_STYLES: StrokeStyle[] = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "medley",
];

const BASE_TIMES: { [key in StrokeStyle]: number } = {
  freestyle: 28,
  backstroke: 32,
  breaststroke: 38,
  butterfly: 30,
  medley: 35,
  unknown: 40,
};

const generateLapTime = (style: StrokeStyle, variation: number = 0): number => {
  const baseTime = BASE_TIMES[style];
  const randomVariation = (Math.random() - 0.5) * 8 + variation;
  return Math.max(20, baseTime + randomVariation);
};

const generateLaps = (
  segmentId: string,
  numLaps: number,
  style: StrokeStyle,
  startTime: Date
): Lap[] => {
  const laps: Lap[] = [];
  let currentTime = new Date(startTime);

  for (let i = 0; i < numLaps; i++) {
    const elapsedSeconds = generateLapTime(style);
    laps.push({
      id: generateId(),
      segmentId,
      lapIndex: i,
      startDateTime: currentTime.toISOString(),
      distanceMeters: 50,
      elapsedSeconds,
      strokeStyle: style,
    });
    currentTime = new Date(currentTime.getTime() + elapsedSeconds * 1000);
  }

  return laps;
};

const generateSegment = (
  workoutId: string,
  distance: Distance,
  style: StrokeStyle,
  dateOffset: number,
  timeOffset: number
): Segment => {
  const numLaps = distance / 50;
  const segmentId = generateId();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateOffset);
  startDate.setHours(6 + timeOffset, Math.floor(Math.random() * 60), 0, 0);

  const laps = generateLaps(segmentId, numLaps, style, startDate);
  const totalTime = laps.reduce((sum, lap) => sum + lap.elapsedSeconds, 0);

  return {
    id: segmentId,
    workoutId,
    startDateTime: startDate.toISOString(),
    distanceMeters: distance,
    elapsedSeconds: totalTime,
    strokeStyle: style,
    lapRange: [0, numLaps - 1],
    laps,
  };
};

export const generateMockData = (): {
  workouts: Workout[];
  segments: Segment[];
  records: SwimmingRecord[];
} => {
  const workouts: Workout[] = [];
  const segments: Segment[] = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset += 2 + Math.floor(Math.random() * 3)) {
    const workoutId = generateId();
    const workoutDate = new Date();
    workoutDate.setDate(workoutDate.getDate() - dayOffset);
    workoutDate.setHours(6, 0, 0, 0);

    const numSegments = 3 + Math.floor(Math.random() * 5);
    const workoutSegments: Segment[] = [];

    for (let i = 0; i < numSegments; i++) {
      const style = STROKE_STYLES[Math.floor(Math.random() * STROKE_STYLES.length)];
      const distanceIndex = Math.floor(Math.random() * DISTANCES.length);
      const distance = DISTANCES[distanceIndex];

      const segment = generateSegment(workoutId, distance, style, dayOffset, i);
      workoutSegments.push(segment);
      segments.push(segment);
    }

    const totalDuration = workoutSegments.reduce(
      (sum, seg) => sum + seg.elapsedSeconds,
      0
    );
    const totalDistance = workoutSegments.reduce(
      (sum, seg) => sum + seg.distanceMeters,
      0
    );

    workouts.push({
      id: workoutId,
      startDate: workoutDate.toISOString(),
      endDate: new Date(
        workoutDate.getTime() + totalDuration * 1000
      ).toISOString(),
      durationSeconds: totalDuration,
      totalDistanceMeters: totalDistance,
      poolLengthMeters: 50,
    });
  }

  const records = calculateRecords(segments);

  return { workouts, segments, records };
};

export const calculateRecords = (segments: Segment[]): SwimmingRecord[] => {
  const recordsMap = new Map<string, SwimmingRecord>();

  for (const segment of segments) {
    const key = `${segment.strokeStyle}-${segment.distanceMeters}`;
    const existing = recordsMap.get(key);

    if (!existing || segment.elapsedSeconds < existing.bestElapsedSeconds) {
      recordsMap.set(key, {
        id: generateId(),
        strokeStyle: segment.strokeStyle,
        distanceMeters: segment.distanceMeters,
        bestElapsedSeconds: segment.elapsedSeconds,
        bestDate: segment.startDateTime,
        bestSegmentId: segment.id,
      });
    }
  }

  return Array.from(recordsMap.values());
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const wholeSeconds = Math.floor(secs);
  const hundredths = Math.round((secs - wholeSeconds) * 100);

  if (mins > 0) {
    return `${mins}:${wholeSeconds.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  }
  return `${wholeSeconds}.${hundredths.toString().padStart(2, "0")}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("cs-CZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const groupSegmentsByDay = (segments: Segment[]): { date: string; bestTime: number; segments: Segment[] }[] => {
  const groups = new Map<string, Segment[]>();

  for (const segment of segments) {
    const dateKey = new Date(segment.startDateTime).toDateString();
    const existing = groups.get(dateKey) || [];
    existing.push(segment);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries())
    .map(([dateKey, segs]) => {
      const sorted = [...segs].sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
      return {
        date: segs[0].startDateTime,
        bestTime: sorted[0].elapsedSeconds,
        segments: sorted,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
