import { DAY_OPTIONS } from "@/src/constants/adminCalendar";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { Text, Pressable, View } from "react-native";
import tw from "twrnc";

export function WeekdaySelector() {
  const store = useCalendarStore();
  const offColor = store.colors.weekend;
  const selectedCount = DAY_OPTIONS.filter(
    (day) => store.weekendRules[day.key],
  ).length; 

  return (
    <View style={tw`px-4 py-4`}>
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text style={tw`text-sm font-medium text-slate-600`}>
          Off days per week
        </Text>
        <View
          style={[
            tw`px-2.5 py-0.5 rounded-full`,
            { backgroundColor: offColor + "20" },
          ]}
        >
          <Text style={[tw`text-xs font-bold`, { color: offColor }]}>
            {selectedCount} day{selectedCount !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={tw`flex-row gap-1.5`}>
        {DAY_OPTIONS.map(({ key, short }) => {
          const isOff = store.weekendRules[key];
          return (
            <Pressable
              key={key}
              onPress={() => calendarStore.setWeekendRule(key, !isOff)}
              style={({ pressed }) => [
                tw`flex-1 items-center py-2.5 rounded-xl`,
                {
                  backgroundColor: isOff ? offColor : offColor + "12",
                  borderWidth: 1.5,
                  borderColor: isOff ? offColor : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  { color: isOff ? "white" : "#94a3b8" },
                ]}
              >
                {short}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedCount > 0 && (
        <View style={tw`mt-3 flex-row flex-wrap gap-1.5`}>
          {DAY_OPTIONS.filter((d) => store.weekendRules[d.key]).map((d) => (
            <View
              key={d.key}
              style={[
                tw`flex-row items-center gap-1 px-2 py-0.5 rounded-full`,
                { backgroundColor: offColor + "15" },
              ]}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: offColor,
                }}
              />
              <Text style={[tw`text-xs font-medium`, { color: offColor }]}>
                {d.full}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
