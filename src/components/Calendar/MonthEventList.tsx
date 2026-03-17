import { Text, View } from "react-native";
import tw from "twrnc";

export interface MonthItem {
  key: string;
  endKey?: string;
  label: string;
  color: string;
  tag: string;
}
interface Props {
  items: MonthItem[];
}

function formatShort(dateKey: string) {
  const [, , d] = dateKey.split("-");
  const date = new Date(dateKey + "T00:00:00"); // local parse — no UTC shift
  return `${parseInt(d)} ${date.toLocaleDateString("en-US", { month: "short" })}`;
}

export function MonthEventList({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={tw`mx-4 mb-6`}>
      <Text
        style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2`}
      >
        Events & Holidays
      </Text>
      <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
        {items.map((item, i) => {
          const dateLabel = item.endKey
            ? `${formatShort(item.key)} → ${formatShort(item.endKey)}` // range
            : formatShort(item.key); // single day

          return (
            <View
              key={`${item.key}-${i}`}
              style={[
                tw`flex-row items-center gap-3 px-4 py-3`,
                i < items.length - 1 && tw`border-b border-slate-50`,
              ]}
            >
              {/* Dot — replaced lucide Dot with plain View */}
              <View
                style={[
                  tw`w-2.5 h-2.5 rounded-full`,
                  { backgroundColor: item.color },
                ]}
              />

              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-slate-400`}>{dateLabel}</Text>
                <Text style={tw`text-sm font-medium text-slate-700`}>
                  {item.label}
                </Text>
              </View>

              <View
                style={[
                  tw`px-2 py-0.5 rounded-full`,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Text
                  style={[tw`text-xs font-semibold`, { color: item.color }]}
                >
                  {item.tag}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
