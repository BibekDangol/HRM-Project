// import React from "react";
// import { ScrollView, Text, View } from "react-native";
// import tw from "twrnc";

// import { Leave } from "@/src/services/leave.service";
// import {
//   LabelValue,
//   StatusConfigValue,
// } from "@/src/screens/admin/leave/PendingDetails";

// interface Props {
//   leave: Leave;
//   cfg: StatusConfigValue;
//   remainingDays: number | null;
//   usedDays: number | null;
// }

// const UserPendingView = ({ leave, cfg, remainingDays, usedDays }: Props) => {
//   return (
//     <View style={tw`flex-1 bg-white`}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={tw`pb-10`}
//       >
//         {/* Profile Card */}
//         <View
//           style={tw`mx-5 mt-5 rounded-3xl bg-slate-50 border border-slate-100 px-5 py-6 items-center`}
//         >
//           {/* Name */}
//           <Text style={tw`text-lg font-bold text-slate-900`}>
//             {leave.first_name} {leave.last_name}
//           </Text>

//           {/* Leave Type */}
//           <Text style={tw`text-sm text-slate-400 mt-0.5`}>
//             {leave.leave_type_name ?? "Leave Request"}
//           </Text>

//           {/* Status Badge */}
//           <View
//             style={[
//               tw`mt-3 px-4 py-1.5 rounded-full`,
//               { backgroundColor: cfg.bg },
//             ]}
//           >
//             <Text style={[tw`text-xs font-bold`, { color: cfg.text }]}>
//               {cfg.label}
//             </Text>
//           </View>

//           {/* Duration / Remaining / Limit */}
//           <View style={tw`mt-4 flex-row gap-4`}>
//             <View style={tw`items-center`}>
//               <Text style={tw`text-lg font-bold text-slate-900`}>
//                 {leave.days_count ?? 0}
//               </Text>
//               <Text style={tw`text-xs text-slate-400`}>Days</Text>
//             </View>

//             {remainingDays !== null && (
//               <>
//                 <View style={tw`w-px bg-slate-200`} />
//                 <View style={tw`items-center`}>
//                   <Text
//                     style={[
//                       tw`text-lg font-bold`,
//                       remainingDays <= 0
//                         ? tw`text-red-500`
//                         : tw`text-emerald-600`,
//                     ]}
//                   >
//                     {remainingDays}
//                   </Text>
//                   <Text style={tw`text-xs text-slate-400`}>Remaining</Text>
//                 </View>
//               </>
//             )}

//             <View style={tw`w-px bg-slate-200`} />
//             <View style={tw`items-center`}>
//               <Text style={tw`text-lg font-bold text-slate-900`}>
//                 {leave.leave_limit}
//               </Text>
//               <Text style={tw`text-xs text-slate-400`}>Limit</Text>
//             </View>
//           </View>
//         </View>

//         {/* Details Section */}
//         <View style={tw`px-5 mt-6 border-t border-slate-100`}>
//           <Text
//             style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}
//           >
//             Details
//           </Text>

//           {/* Start & End Date */}
//           <View style={tw`flex-row justify-between items-center`}>
//             <View style={tw`flex-1 border-b border-slate-100`}>
//               <LabelValue
//                 label="Start Date"
//                 value={leave.start_date ?? "N/A"}
//               />
//             </View>
//             <View style={tw`flex-1 border-b border-slate-100`}>
//               <LabelValue label="End Date" value={leave.end_date ?? "N/A"} />
//             </View>
//           </View>

//           {/* Duration */}
//           <View style={tw`border-b border-slate-100`}>
//             <LabelValue
//               label="Duration"
//               value={`${leave.days_count ?? 0} days`}
//             />
//           </View>

//           {/* Reason */}
//           <View style={tw`border-b border-slate-100`}>
//             <LabelValue label="Reason" value={leave.reason ?? "N/A"} />
//           </View>
//         </View>

//         {/* Leave Balance Section */}
//         {usedDays !== null && remainingDays !== null && (
//           <View style={tw`px-5 mt-6`}>
//             <Text
//               style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}
//             >
//               Leave Balance
//             </Text>

//             <View style={tw`flex-row justify-between items-center`}>
//               <View style={tw`flex-1 border-b border-slate-100`}>
//                 <LabelValue
//                   label="Used"
//                   value={`${usedDays} days`}
//                   valueStyle={{ color: "#ef4444" }}
//                 />
//               </View>
//               <View style={tw`flex-1 border-b border-slate-100`}>
//                 <LabelValue
//                   label="Limit"
//                   value={`${leave.leave_limit} days`}
//                   valueStyle={{ color: "#111827" }}
//                 />
//               </View>
//             </View>

//             <View style={tw`flex-row`}>
//               <View style={tw`flex-1 pr-2 border-b border-slate-100`}>
//                 <LabelValue
//                   label="Remaining"
//                   value={`${remainingDays} days`}
//                   valueStyle={{
//                     color: remainingDays <= 0 ? "#ef4444" : "#16a34a",
//                   }}
//                 />
//               </View>
//               <View style={tw`flex-1 border-b border-slate-100`}>
//                 <LabelValue
//                   label="Type"
//                   value={leave.leave_type_name ?? "N/A"}
//                 />
//               </View>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// export default UserPendingView;
