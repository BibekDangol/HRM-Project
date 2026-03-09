import { Text, View } from "react-native";
import tw from "twrnc";

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={tw`mb-4`}>
      <Text
        style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1`}
      >
        {title}
      </Text>
      <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
        {children}
      </View>
    </View>
  );
}
