import { Platform } from "react-native";
import Constants from "expo-constants";
import { Segment, Lap, Workout, StrokeStyle, DISTANCES, Distance } from "./types";

export interface HealthKitStatus {
  isAvailable: boolean;
  isAuthorized: boolean;
  errorMessage?: string;
}

export interface HealthKitSwimmingData {
  workouts: Workout[];
  segments: Segment[];
}

const HK_STROKE_MAP: Record<number, StrokeStyle> = {
  0: "unknown",
  1: "freestyle",
  2: "backstroke",
  3: "breaststroke",
  4: "butterfly",
  5: "medley",
};

class HealthKitService {
  private _isNativeBuild: boolean = false;
  private _isAuthorized: boolean = false;

  constructor() {
    this._isNativeBuild = this.checkNativeBuildAvailable();
  }

  private checkNativeBuildAvailable(): boolean {
    if (Platform.OS !== "ios") {
      return false;
    }
    const appOwnership = Constants.appOwnership;
    return appOwnership === null || appOwnership !== "expo";
  }

  async getStatus(): Promise<HealthKitStatus> {
    if (Platform.OS !== "ios") {
      return {
        isAvailable: false,
        isAuthorized: false,
        errorMessage: "HealthKit je dostupný pouze na iOS",
      };
    }

    if (!this._isNativeBuild) {
      return {
        isAvailable: false,
        isAuthorized: false,
        errorMessage: "HealthKit vyžaduje nativní build (není dostupný v Expo Go)",
      };
    }

    return {
      isAvailable: true,
      isAuthorized: this._isAuthorized,
    };
  }

  async requestAuthorization(): Promise<boolean> {
    const status = await this.getStatus();
    if (!status.isAvailable) {
      console.log("HealthKit not available:", status.errorMessage);
      return false;
    }

    try {
      this._isAuthorized = true;
      return true;
    } catch (error) {
      console.error("HealthKit authorization failed:", error);
      return false;
    }
  }

  async fetchSwimmingWorkouts(
    startDate: Date,
    endDate: Date
  ): Promise<HealthKitSwimmingData | null> {
    const status = await this.getStatus();
    if (!status.isAvailable || !status.isAuthorized) {
      return null;
    }

    return null;
  }

  mapHealthKitStroke(hkStrokeType: number): StrokeStyle {
    return HK_STROKE_MAP[hkStrokeType] || "unknown";
  }

  findRecordDistances(segmentDistance: number): Distance[] {
    return DISTANCES.filter((d) => segmentDistance >= d);
  }

  calculateSubSegmentTime(
    laps: Lap[],
    targetDistance: Distance,
    poolLength: number = 50
  ): number | null {
    const lapsNeeded = Math.ceil(targetDistance / poolLength);
    if (laps.length < lapsNeeded) {
      return null;
    }

    let bestTime = Infinity;
    for (let start = 0; start <= laps.length - lapsNeeded; start++) {
      const subLaps = laps.slice(start, start + lapsNeeded);
      const totalTime = subLaps.reduce((sum, lap) => sum + lap.elapsedSeconds, 0);
      if (totalTime < bestTime) {
        bestTime = totalTime;
      }
    }

    return bestTime === Infinity ? null : bestTime;
  }

  getRequiredPermissions(): string[] {
    return [
      "HKWorkoutTypeIdentifier",
      "HKQuantityTypeIdentifierSwimmingStrokeCount",
      "HKQuantityTypeIdentifierDistanceSwimming",
      "HKWorkoutRouteTypeIdentifier",
    ];
  }

  getNativeBuildInstructions(): string {
    return `Pro přístup k HealthKit datům potřebujete:

1. Apple Developer účet ($99/rok)
   https://developer.apple.com/programs/

2. Vytvořit development build pomocí EAS:
   npx eas build --profile development --platform ios

3. Přidat HealthKit entitlements do app.json:
   {
     "expo": {
       "ios": {
         "entitlements": {
           "com.apple.developer.healthkit": true,
           "com.apple.developer.healthkit.background-delivery": true
         },
         "infoPlist": {
           "NSHealthShareUsageDescription": "Kniha rekordů potřebuje přístup k vašim plaveckým datům pro zobrazení rekordů.",
           "NSHealthUpdateUsageDescription": "Kniha rekordů neukládá data do Health."
         }
       }
     }
   }

4. Nainstalovat nativní HealthKit knihovnu:
   npx expo install react-native-health

5. Implementovat fetchSwimmingWorkouts() v healthkit.ts`;
  }
}

export const healthKitService = new HealthKitService();
