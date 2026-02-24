import { Dot } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import tw from "twrnc";

export interface MonthItem {
  key: string;
  label: string;
  color: string;
  tag: string;
}

interface Props {
  items: MonthItem[];
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
        {items.map((item, i) => (
          <View
            key={`${item.key}-${i}`}
            style={[
              tw`flex-row items-center gap-3 px-4 py-3`,
              i < items.length - 1 && tw`border-b border-slate-50`,
            ]}
          >
            <Dot color={item.color} size={10} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs text-slate-400`}>
                {item.key.split("-")[2]}{" "}
                {new Date(item.key).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </Text>
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
              <Text style={[tw`text-xs font-semibold`, { color: item.color }]}>
                {item.tag}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
