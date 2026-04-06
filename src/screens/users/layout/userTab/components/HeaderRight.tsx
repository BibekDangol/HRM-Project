// import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
// import { CircleCheck, LogOut, User } from "lucide-react-native";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Modal,
//   Pressable,
//   Text,
//   TouchableWithoutFeedback,
//   View,
// } from "react-native";

// import { TW } from "@/theme/twStyles";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface HeaderRightProps {
//   isLocked: boolean;
//   onCheckInAndOut: () => void;
//   isCheckedIn: boolean;
//   isCheckOpen: boolean;
//   checkedInAt: Date | null;
//   onProfileClick: () => void;
//   elapsedMs: number;
//   onToggleCheck: () => void;
//   onLogout: () => void;
//   onProfileMenuClick: () => void;
//   isProfileMenuOpen: boolean;
// }

// type AnchorLayout = {
//   pageX: number;
//   pageY: number;
//   width: number;
//   height: number;
// };

// const DEFAULT_LAYOUT: AnchorLayout = {
//   pageX: 0,
//   pageY: 0,
//   width: 0,
//   height: 0,
// };
// const SCREEN = Dimensions.get("window");
// const HEADER_OFFSET = 20;

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function getDropdownPosition(
//   anchor: AnchorLayout,
//   menuWidth: number,
//   align: "center" | "right" = "right",
// ) {
//   const top = anchor.pageY + anchor.height + 8 + HEADER_OFFSET;
//   let left =
//     align === "center"
//       ? anchor.pageX + anchor.width / 2 - menuWidth / 2
//       : anchor.pageX + anchor.width - menuWidth;

//   left = Math.min(Math.max(left, 12), SCREEN.width - menuWidth - 12);
//   return { top, left };
// }

// // ─── AnimatedDropdown ─────────────────────────────────────────────────────────

// interface AnimatedDropdownProps {
//   visible: boolean;
//   children: React.ReactNode;
// }

// const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
//   visible,
//   children,
// }) => {
//   const opacity = useRef(new Animated.Value(0)).current;
//   const translateY = useRef(new Animated.Value(-8)).current;
//   const scale = useRef(new Animated.Value(0.96)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.timing(opacity, {
//           toValue: 1,
//           duration: 180,
//           useNativeDriver: true,
//         }),
//         Animated.spring(translateY, {
//           toValue: 0,
//           damping: 18,
//           stiffness: 260,
//           mass: 0.9,
//           useNativeDriver: true,
//         }),
//         Animated.spring(scale, {
//           toValue: 1,
//           damping: 18,
//           stiffness: 260,
//           mass: 0.9,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(opacity, {
//           toValue: 0,
//           duration: 120,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scale, {
//           toValue: 0.96,
//           duration: 120,
//           useNativeDriver: true,
//         }),
//         Animated.timing(translateY, {
//           toValue: -8,
//           duration: 120,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible, opacity, scale, translateY]);

//   return (
//     <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
//       {children}
//     </Animated.View>
//   );
// };

// // ─── CheckMenu ────────────────────────────────────────────────────────────────

// interface CheckMenuProps {
//   isLocked: boolean;
//   isCheckedIn: boolean;
//   isCheckOpen: boolean;
//   checkedInAt: Date | null;
//   elapsedMs: number;
//   onCheckInAndOut: () => void;
//   onToggleCheck: () => void;
// }

// const CHECK_MENU_WIDTH = 150;

// const CheckMenu: React.FC<CheckMenuProps> = ({
//   isLocked,
//   isCheckedIn,
//   isCheckOpen,
//   checkedInAt,
//   elapsedMs,
//   onCheckInAndOut,
//   onToggleCheck,
// }) => {
//   const btnRef = useRef<View>(null);
//   const [layout, setLayout] = useState<AnchorLayout>(DEFAULT_LAYOUT);

//   const measure = () => {
//     requestAnimationFrame(() => {
//       btnRef.current?.measureInWindow((x, y, width, height) => {
//         setLayout({ pageX: x, pageY: y, width, height });
//       });
//     });
//   };

//   useEffect(() => {
//     const timer = setTimeout(measure, 250);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (isCheckOpen) measure();
//   }, [isCheckOpen]);

//   const menuPosition = getDropdownPosition(layout, CHECK_MENU_WIDTH, "center");

//   return (
//     <View>
//       {/* Trigger button */}
//       <View ref={btnRef} collapsable={false} onLayout={measure}>
//         <Pressable
//           disabled={isLocked}
//           onPress={() => {
//             measure();
//             onCheckInAndOut();
//           }}
//           hitSlop={10}
//           style={({ pressed }) => ({
//             height: 36,
//             width: 36,
//             borderRadius: 18,
//             alignItems: "center",
//             justifyContent: "center",
//             opacity: pressed ? 0.7 : 1,
//           })}
//         >
//           <View
//             style={{
//               height: 12,
//               width: 12,
//               borderRadius: 6,
//               backgroundColor: isCheckedIn ? "#4ADE80" : "#FCA5A5",
//             }}
//           />
//         </Pressable>
//       </View>

//       {/* Dropdown modal */}
//       <Modal
//         visible={isCheckOpen}
//         transparent
//         animationType="none"
//         statusBarTranslucent
//         onRequestClose={onCheckInAndOut}
//       >
//         <TouchableWithoutFeedback onPress={onCheckInAndOut}>
//           <View style={{ flex: 1 }}>
//             <TouchableWithoutFeedback>
//               <View
//                 style={{
//                   position: "absolute",
//                   top: menuPosition.top,
//                   left: menuPosition.left,
//                   width: CHECK_MENU_WIDTH,
//                 }}
//               >
//                 <AnimatedDropdown visible={isCheckOpen}>
//                   <View
//                     style={{
//                       borderRadius: 14,
//                       backgroundColor: "#FFFFFF",
//                       borderWidth: 1,
//                       borderColor: "#E2E8F0",
//                       padding: 10,
//                       width: CHECK_MENU_WIDTH,
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 4 },
//                       shadowOpacity: 0.08,
//                       shadowRadius: 10,
//                       elevation: 10,
//                     }}
//                   >
//                     {isCheckedIn ? (
//                       <View style={{ alignItems: "center" }}>
//                         <Text
//                           style={{
//                             fontSize: 11,
//                             color: TW.textSecondary,
//                             marginBottom: 2,
//                           }}
//                         >
//                           Since{" "}
//                           {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
//                         </Text>

//                         <Text
//                           style={{
//                             fontSize: 16,
//                             fontWeight: "700",
//                             color: TW.textPrimary,
//                             marginBottom: 8,
//                           }}
//                         >
//                           {formatElapsed(elapsedMs)}
//                         </Text>

//                         <Pressable
//                           onPress={onToggleCheck}
//                           style={({ pressed }) => ({
//                             width: "100%",
//                             flexDirection: "row",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             gap: 6,
//                             paddingVertical: 8,
//                             borderRadius: 10,
//                             backgroundColor: "#FFB300",
//                             opacity: pressed ? 0.8 : 1,
//                           })}
//                         >
//                           <LogOut size={14} color="#1F2937" />
//                           <Text
//                             style={{
//                               fontSize: 13,
//                               fontWeight: "600",
//                               color: "#1F2937",
//                             }}
//                           >
//                             Check Out
//                           </Text>
//                         </Pressable>
//                       </View>
//                     ) : (
//                       <Pressable
//                         onPress={onToggleCheck}
//                         style={({ pressed }) => ({
//                           flexDirection: "row",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           gap: 6,
//                           paddingVertical: 10,
//                           borderRadius: 10,
//                           backgroundColor: "#FFB300",
//                           opacity: pressed ? 0.8 : 1,
//                         })}
//                       >
//                         <CircleCheck size={14} color="#1F2937" />
//                         <Text
//                           style={{
//                             fontSize: 13,
//                             fontWeight: "600",
//                             color: "#1F2937",
//                           }}
//                         >
//                           Check In
//                         </Text>
//                       </Pressable>
//                     )}
//                   </View>
//                 </AnimatedDropdown>
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// // ─── ProfileMenu ──────────────────────────────────────────────────────────────

// interface ProfileMenuProps {
//   isLocked: boolean;
//   isProfileMenuOpen: boolean;
//   onProfileClick: () => void;
//   onProfileMenuClick: () => void;
//   onLogout: () => void;
// }

// const PROFILE_MENU_WIDTH = 130;

// const ProfileMenu: React.FC<ProfileMenuProps> = ({
//   isLocked,
//   isProfileMenuOpen,
//   onProfileClick,
//   onProfileMenuClick,
//   onLogout,
// }) => {
//   const btnRef = useRef<View>(null);
//   const [layout, setLayout] = useState<AnchorLayout>(DEFAULT_LAYOUT);

//   const measure = () => {
//     requestAnimationFrame(() => {
//       btnRef.current?.measureInWindow((x, y, width, height) => {
//         setLayout({ pageX: x, pageY: y, width, height });
//       });
//     });
//   };

//   useEffect(() => {
//     const timer = setTimeout(measure, 250);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (isProfileMenuOpen) measure();
//   }, [isProfileMenuOpen]);

//   const menuPosition = getDropdownPosition(layout, PROFILE_MENU_WIDTH, "right");

//   return (
//     <View>
//       {/* Trigger button */}
//       <View ref={btnRef} collapsable={false} onLayout={measure}>
//         <Pressable
//           disabled={isLocked}
//           onPress={() => {
//             measure();
//             onProfileClick();
//           }}
//           hitSlop={10}
//           style={({ pressed }) => ({
//             height: 36,
//             width: 36,
//             borderRadius: 18,
//             backgroundColor: "rgba(255,255,255,0.15)",
//             borderWidth: 2,
//             borderColor: "rgba(255,255,255,0.5)",
//             alignItems: "center",
//             justifyContent: "center",
//             opacity: pressed ? 0.7 : 1,
//           })}
//         >
//           <User size={17} color="#ffffff" />
//         </Pressable>
//       </View>

//       {/* Dropdown modal */}
//       <Modal
//         visible={isProfileMenuOpen}
//         transparent
//         animationType="none"
//         statusBarTranslucent
//         onRequestClose={onProfileClick}
//       >
//         <TouchableWithoutFeedback onPress={onProfileClick}>
//           <View style={{ flex: 1 }}>
//             <TouchableWithoutFeedback>
//               <View
//                 style={{
//                   position: "absolute",
//                   top: menuPosition.top,
//                   left: menuPosition.left,
//                   width: PROFILE_MENU_WIDTH,
//                 }}
//               >
//                 <AnimatedDropdown visible={isProfileMenuOpen}>
//                   <View
//                     style={{
//                       width: PROFILE_MENU_WIDTH,
//                       borderRadius: 14,
//                       backgroundColor: "#FFFFFF",
//                       borderWidth: 1,
//                       borderColor: "#E2E8F0",
//                       paddingVertical: 4,
//                       paddingHorizontal: 6,
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 4 },
//                       shadowOpacity: 0.08,
//                       shadowRadius: 10,
//                       elevation: 10,
//                     }}
//                   >
//                     <Pressable
//                       onPress={onProfileMenuClick}
//                       style={({ pressed }) => ({
//                         flexDirection: "row",
//                         alignItems: "center",
//                         gap: 10,
//                         paddingHorizontal: 14,
//                         paddingVertical: 12,
//                         opacity: pressed ? 0.75 : 1,
//                       })}
//                     >
//                       <User size={18} color="#111827" />
//                       <Text
//                         style={{
//                           fontSize: 15,
//                           fontWeight: "600",
//                           color: "#111827",
//                         }}
//                       >
//                         Profile
//                       </Text>
//                     </Pressable>

//                     <View
//                       style={{
//                         height: 1,
//                         backgroundColor: "#E5E7EB",
//                         marginHorizontal: 12,
//                       }}
//                     />

//                     <Pressable
//                       onPress={onLogout}
//                       style={({ pressed }) => ({
//                         flexDirection: "row",
//                         alignItems: "center",
//                         gap: 10,
//                         paddingHorizontal: 14,
//                         paddingVertical: 12,
//                         opacity: pressed ? 0.75 : 1,
//                       })}
//                     >
//                       <LogOut size={18} color="#EF4444" />
//                       <Text
//                         style={{
//                           fontSize: 15,
//                           fontWeight: "600",
//                           color: "#EF4444",
//                         }}
//                       >
//                         Logout
//                       </Text>
//                     </Pressable>
//                   </View>
//                 </AnimatedDropdown>
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// // ─── HeaderRight ──────────────────────────────────────────────────────────────

// const HeaderRight: React.FC<HeaderRightProps> = ({
//   isLocked,
//   onCheckInAndOut,
//   isCheckedIn,
//   isCheckOpen,
//   checkedInAt,
//   onProfileClick,
//   onProfileMenuClick,
//   elapsedMs,
//   onToggleCheck,
//   onLogout,
//   isProfileMenuOpen,
// }) => {
//   return (
//     <View
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 12,
//         marginRight: 16,
//         marginBottom: 8,
//       }}
//     >
//       <CheckMenu
//         isLocked={isLocked}
//         isCheckedIn={isCheckedIn}
//         isCheckOpen={isCheckOpen}
//         checkedInAt={checkedInAt}
//         elapsedMs={elapsedMs}
//         onCheckInAndOut={onCheckInAndOut}
//         onToggleCheck={onToggleCheck}
//       />

//       <ProfileMenu
//         isLocked={isLocked}
//         isProfileMenuOpen={isProfileMenuOpen}
//         onProfileClick={onProfileClick}
//         onProfileMenuClick={onProfileMenuClick}
//         onLogout={onLogout}
//       />
//     </View>
//   );
// };

// export default HeaderRight;
