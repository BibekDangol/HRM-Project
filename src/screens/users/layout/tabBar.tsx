import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import {
  CalendarDays,
  House,
  LucideIcon,
  MoreHorizontal,
} from "lucide-react-native";
import { View } from "react-native";
import tw from "twrnc";

export function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();

  const tabConfig: Record<
    string,
    { icon: LucideIcon; iconSize?: number; pt?: number }
  > = {
    dashboard: { icon: House, iconSize: 26, pt: 2 },
    leaves: { icon: CalendarDays, iconSize: 26, pt: 2 },
    more: { icon: MoreHorizontal, iconSize: 26, pt: 2 },
  };

  // console.log("state.routes", state.routes);
  const visibleRoutes = state.routes.filter((route: any) => {
    const options = descriptors[route.key]?.options;
    const isHidden = options?.href === null;
    const isInTabConfig = !!tabConfig[route.name];
    return !isHidden && isInTabConfig;
  });

  return (
    <View
      style={[
        tw`flex-row border-t border-gray-300 bg-gray-100`,
        { height: 80, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const isFocused = state.routes[state.index]?.key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const cfg = tabConfig[route.name];
        const Icon = cfg.icon;

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              tw`flex-1 items-center justify-center`,
              cfg.pt ? { paddingTop: cfg.pt } : null,
            ]}
          >
            <Icon
              size={cfg.iconSize ?? 24}
              color={isFocused ? "#1F7A4D" : "#374151"}
            />
          </PlatformPressable>
        );
      })}
    </View>
  );
}
