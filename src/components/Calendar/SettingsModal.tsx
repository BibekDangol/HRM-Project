// import {
//   Alert,
//   Modal,
//   Pressable,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import tw from "twrnc";
// import { CalendarColors } from "../../types/adminCalendar";
// import { calendarStore, useCalendarStore } from "../../utils/adminCalendar";
// import { ColorPicker } from "./ColorPicker";
// import { WeekdaySelector } from "./WeekDaySelector";
// import { SectionCard } from "./SectionCard";

// // ── Settings Modal ────────────────────────────────────────────────────────────
// export function SettingsModal({
//   visible,
//   onClose,
// }: {
//   visible: boolean;
//   onClose: () => void;
// }) {
//   const store = useCalendarStore();

//   const colorRows = [
//     { key: "publicHoliday" as keyof CalendarColors, label: "Public Holiday" },
//     { key: "weekend" as keyof CalendarColors, label: "Weekend / Off Day" },
//     { key: "officeDay" as keyof CalendarColors, label: "Office Day" },
//   ];

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent
//       onRequestClose={onClose}
//     >
//       {/* Backdrop */}
//       <Pressable style={tw`flex-1 bg-black/40`} onPress={onClose} />

//       {/* Sheet */}
//       <View style={tw`bg-slate-50 rounded-t-3xl pt-3 px-5 pb-10 max-h-[80%]`}>
//         <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`} />
//         <Text style={tw`text-lg font-bold text-slate-900 mb-5`}>Settings</Text>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           <SectionCard title="Day Type Colours">
//             {colorRows.map(({ key, label }, i) => (
//               <View
//                 key={key}
//                 style={[
//                   tw`px-4 py-3`,
//                   i < colorRows.length - 1 && tw`border-b border-slate-100`,
//                 ]}
//               >
//                 <View style={tw`flex-row items-center gap-3 mb-1`}>
//                   <Text style={tw`text-sm font-semibold text-slate-700`}>
//                     {label}
//                   </Text>
//                   <View
//                     style={[
//                       tw`ml-auto w-5 h-5 rounded-full`,
//                       { backgroundColor: store.colors[key] },
//                     ]}
//                   />
//                 </View>

//                 <ColorPicker
//                   value={store.colors[key]}
//                   onChange={(color) => calendarStore.setColor(key, color)}
//                 />
//               </View>
//             ))}
//           </SectionCard>

//           <SectionCard title="Off Days">
//             <WeekdaySelector />
//           </SectionCard>

//           <TouchableOpacity
//             onPress={() =>
//               Alert.alert(
//                 "Reset Calendar",
//                 "Clear all holidays, events and settings?",
//                 [
//                   { text: "Cancel", style: "cancel" },
//                   {
//                     text: "Reset",
//                     style: "destructive",
//                     onPress: () => {
//                       calendarStore.reset();
//                       onClose();
//                     },
//                   },
//                 ],
//               )
//             }
//             style={tw`py-3 rounded-xl items-center bg-red-50 border border-red-100 mb-6`}
//           >
//             <Text style={tw`text-sm font-semibold text-red-500`}>
//               Reset All Calendar Data
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// }
