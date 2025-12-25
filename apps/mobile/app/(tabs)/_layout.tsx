import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useColorScheme } from "nativewind";
import { Platform } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: (
            <Icon
              src={<VectorIcon family={MaterialIcons} name="home" size={24} />}
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="workouts">
        <Label>Workouts</Label>
        {Platform.select({
          ios: <Icon sf="dumbbell.fill" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialIcons}
                  name="fitness-center"
                  size={24}
                />
              }
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analytics">
        <Label>Analytics</Label>
        {Platform.select({
          ios: <Icon sf="chart.bar.fill" />,
          android: (
            <Icon
              src={
                <VectorIcon family={MaterialIcons} name="bar-chart" size={24} />
              }
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        {Platform.select({
          ios: <Icon sf="gear" />,
          android: (
            <Icon
              src={
                <VectorIcon family={MaterialIcons} name="settings" size={24} />
              }
            />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
