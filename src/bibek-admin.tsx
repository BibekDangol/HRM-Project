// import * as React from "react";

// import { PlatformPressable, Text } from "@react-navigation/elements";
// import { ScrollView, View } from "react-native";

// import { RootStackParamList } from "@/src/navigation/types";
// import { Ionicons } from "@expo/vector-icons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { useLinkBuilder } from "@react-navigation/native";
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
// import { SafeAreaView } from "react-native-safe-area-context";
// import tw from "twrnc";
// import ManageUsers from "./ManageUsers";
// import onLogout from "./Moretab";

// // import { useAuthStore } from "@/store/useAuthStore";

// /** This file is mounted by your Root Stack as: <Stack.Screen name="Admin" component={AdminScreen} /> */
// type RootProps = NativeStackScreenProps<RootStackParamList, "Admin">;

// /* ---------------- Custom Tab Bar (from your snippet) ---------------- */
// function MyTabBar({ state, descriptors, navigation }: any) {
//   const { buildHref } = useLinkBuilder();
//   const tabConfig: Record<
//     string,
//     {
//       icon: keyof typeof MaterialCommunityIcons.glyphMap;
//       iconSize?: number;
//       mt?: number;
//       pt?: number;
//     }
//   > = {
//     Dashboard: { icon: "view-dashboard", iconSize: 26, mt: 2, pt: 2 },
//     Employees: { icon: "account-outline", iconSize: 26, mt: 2, pt: 2 },
//     Leaves: { icon: "calendar-month-outline", iconSize: 26, mt: 2, pt: 2 },
//     More: { icon: "dots-horizontal", iconSize: 26, mt: 2, pt: 2 },
//   };

//   return (
//     <View
//       style={[
//         tw`flex-row border-t border-gray-300 bg-gray-100`,
//         {
//           height: 80,
//           paddingHorizontal: 18,
//           paddingTop: 8,
//           paddingBottom: 16,
//         },
//       ]}
//     >
//       {state.routes.map((route: any, index: number) => {
//         const isFocused = state.index === index;

//         const onPress = () => {
//           const event = navigation.emit({
//             type: "tabPress",
//             target: route.key,
//             canPreventDefault: true,
//           });

//           if (!isFocused && !event.defaultPrevented) {
//             navigation.navigate(route.name, route.params);
//           }
//         };

//         const onLongPress = () => {
//           navigation.emit({
//             type: "tabLongPress",
//             target: route.key,
//           });
//         };
//         const cfg = tabConfig[route.name] ?? {
//           icon: "circle-outline",
//           iconSize: 24,
//           mt: 2,
//           pt: 0,
//         };

//         return (
//           <PlatformPressable
//             key={route.key}
//             href={buildHref(route.name, route.params)}
//             accessibilityState={isFocused ? { selected: true } : {}}
//             onPress={onPress}
//             onLongPress={onLongPress}
//             style={[
//               tw`flex-1 items-center justify-center`,
//               cfg.pt ? { paddingTop: cfg.pt } : null,
//             ]}
//           >
//             <MaterialCommunityIcons
//               name={cfg.icon}
//               size={cfg.iconSize ?? 24}
//               color={isFocused ? "#1F7A4D" : "#374151"}
//             />
//           </PlatformPressable>
//         );
//       })}
//     </View>
//   );
// }

// function AdminDashboardTab() {
//   return (
//     <SafeAreaView style={tw`flex-1 bg-[#F5F5F5]`}>
//       <ScrollView contentContainerStyle={tw`px-4 pt-4 pb-8`}>
//         <Text style={tw`text-2xl font-extrabold text-gray-800`}>
//           Hello, Admin
//         </Text>
//         <Text>
//           Welcome to your <Text style={{ fontWeight: "bold" }}>Dashboard</Text>.
//         </Text>

//         <View style={tw`mt-6`}>
//           {/* Row 1 */}
//           <View style={tw`flex-row  justify-center`}>
//             {/* //total employee */}
//             <View
//               style={tw`flex-1 bg-white rounded-2xl px-4 py-4  border border-gray-100 shadow-sm flex-row items-center`}
//             >
//               <View
//                 style={tw`w-12 h-12 rounded-full bg-blue-600 items-center justify-center`}
//               >
//                 <Ionicons name="people" size={28} color="white" />
//               </View>

//               <View style={tw`ml-3 flex-1`}>
//                 <Text style={tw`text-gray-700 font-semibold`}>Employees</Text>
//                 <Text style={tw`text-3xl font-extrabold text-[#1E3354] mt-1`}>
//                   150
//                 </Text>
//               </View>
//             </View>
//             {/*//present today */}
//             <View
//               style={tw`flex-1 bg-white rounded-2xl px-4 py-4 ml-4 border border-gray-100 shadow-sm flex-row items-center`}
//             >
//               <View
//                 style={tw`w-12 h-12 rounded-full bg-green-600 items-center justify-center`}
//               >
//                 <Ionicons name="checkmark-circle" size={28} color="white" />
//               </View>

//               <View style={tw`ml-3 flex-1`}>
//                 <Text style={tw`text-gray-700 font-semibold`}>Present</Text>
//                 <Text style={tw`text-3xl font-extrabold text-gray-900 mt-1`}>
//                   1
//                 </Text>
//               </View>
//             </View>
//           </View>
//           {/*Row 2 */}
//           <View style={tw`flex-row mt-3`}>
//             {/* //On Leave */}
//             <View
//               style={tw`flex-1 bg-white rounded-2xl px-4 py-4  border border-gray-100 shadow-sm flex-row items-center`}
//             >
//               <View
//                 style={tw`w-12 h-12 rounded-full bg-orange-600 items-center justify-center`}
//               >
//                 <Ionicons name="log-out-outline" size={28} color="white" />
//               </View>

//               <View style={tw`ml-3 flex-1`}>
//                 <Text style={tw`text-gray-700 font-semibold`}>On Leave</Text>
//                 <Text style={tw`text-3xl font-extrabold text-[#1E3354] mt-1`}>
//                   1
//                 </Text>
//               </View>
//             </View>

//             {/*//Holidays */}
//             <View
//               style={tw`flex-1 bg-white rounded-2xl px-4 py-4 ml-4 border border-gray-100 shadow-sm flex-row items-center`}
//             >
//               <View
//                 style={tw`w-12 h-12 rounded-full bg-red-600 items-center justify-center`}
//               >
//                 <Ionicons name="calendar" size={28} color="white" />
//               </View>

//               <View style={tw`ml-3 flex-1`}>
//                 <Text style={tw`text-gray-700 font-semibold`}>Holidays</Text>
//                 <Text style={tw`text-3xl font-extrabold text-gray-900 mt-1`}>
//                   1
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// function LeavesTab() {
//   return (
//     <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
//       <Text>Leaves</Text>
//     </SafeAreaView>
//   );
// }

// /* ---------------- Bottom Tabs ---------------- */

// type AdminTabParamList = {
//   Dashboard: undefined;
//   Employees: undefined;
//   Leaves: undefined;
//   More: undefined;
// };

// const Tab = createBottomTabNavigator<AdminTabParamList>();

// export default function AdminScreen(_props: RootProps) {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: { position: "absolute" }, // so it floats nicely
//       }}
//       tabBar={(props) => <MyTabBar {...props} />}
//     >
//       <Tab.Screen name="Dashboard" component={AdminDashboardTab} />
//       <Tab.Screen name="Employees" component={ManageUsers} />
//       <Tab.Screen name="Leaves" component={LeavesTab} />
//       <Tab.Screen name="More" component={onLogout} />
//     </Tab.Navigator>
//   );
// }
