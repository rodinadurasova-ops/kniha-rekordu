import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import RecordsBookScreen from "@/screens/RecordsBookScreen";
import RecordHistoryScreen from "@/screens/RecordHistoryScreen";
import SegmentDetailScreen from "@/screens/SegmentDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import EditStyleScreen from "@/screens/EditStyleScreen";

export type StrokeStyle = 
  | "freestyle"
  | "backstroke"
  | "breaststroke"
  | "butterfly"
  | "medley"
  | "unknown";

export type RootStackParamList = {
  RecordsBook: undefined;
  RecordHistory: {
    strokeStyle: StrokeStyle;
    distance: number;
  };
  SegmentDetail: {
    segmentId: string;
  };
  Settings: undefined;
  EditStyle: {
    segmentId: string;
    currentStyle: StrokeStyle;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="RecordsBook"
        component={RecordsBookScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecordHistory"
        component={RecordHistoryScreen}
        options={opaqueScreenOptions}
      />
      <Stack.Screen
        name="SegmentDetail"
        component={SegmentDetailScreen}
        options={opaqueScreenOptions}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: "Nastavení",
        }}
      />
      <Stack.Screen
        name="EditStyle"
        component={EditStyleScreen}
        options={{
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: "Upravit styl",
        }}
      />
    </Stack.Navigator>
  );
}
