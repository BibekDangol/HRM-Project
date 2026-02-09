import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { AttendanceRow } from "@/src/types/attendance";
import {
    formatElapsed,
    formatSinceTime,
    getAttendanceStatus,
    getErrorMessage,
    needsCheckInCommentNepal,
    needsCheckOutCommentNepal,
    parseDate,
} from "@/src/utils/checkinHelper";
import { Tabs, useRouter } from "expo-router";
import { CircleCheck, LogOut, User, UserCircle } from "lucide-react-native";
import React from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import tw from "twrnc";
import { MyTabBar } from "./tabBar";

export default function UsersTabsLayout() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [checkOpen, setCheckOpen] = React.useState(false);

  const [loadingAttendance, setLoadingAttendance] = React.useState(false);
  const [attendance, setAttendance] = React.useState<AttendanceRow | null>(
    null,
  );

  const [checkedInAt, setCheckedInAt] = React.useState<Date | null>(null);
  const [now, setNow] = React.useState<number>(() => Date.now());

  // comment modal state
  const [commentModalOpen, setCommentModalOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [commentMode, setCommentMode] = React.useState<
    "checkin" | "checkout" | null
  >(null);

  const checkActionLockRef = React.useRef(false);

  const runOnce = React.useCallback(async (fn: () => Promise<void>) => {
    if (checkActionLockRef.current) return;
    checkActionLockRef.current = true;
    try {
      await fn();
    } finally {
      checkActionLockRef.current = false;
    }
  }, []);

  const status = getAttendanceStatus(attendance);
  const isCheckedIn = status === "incomplete";
  const elapsedMs = checkedInAt ? now - checkedInAt.getTime() : 0;

  React.useEffect(() => {
    if (!checkedInAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  const closeAllMenus = React.useCallback(() => {
    setMenuOpen(false);
    setCheckOpen(false);
  }, []);

  /* ---------------- Supabase attendance logic ---------------- */

  const fetchLatestAttendance = React.useCallback(async () => {
    try {
      setLoadingAttendance(true);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) {
        setAttendance(null);
        setCheckedInAt(null);
        return;
      }

      const { data, error } = await supabase
        .from("attendance")
        .select(
          "id,user_id,check_in_time,check_out_time,status,check_in_comment,check_out_comment",
        )
        .eq("user_id", user.id)
        .order("check_in_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const row = (data as AttendanceRow | null) ?? null;
      setAttendance(row);

      const inAt = parseDate(row?.check_in_time);
      if (row?.status === "incomplete" && inAt) setCheckedInAt(inAt);
      else setCheckedInAt(null);
    } catch (err) {
      Alert.alert("Attendance fetch failed", getErrorMessage(err));
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // check if open session exists, if yes return it instead of inserting again
  const getOpenAttendanceRow = React.useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        "id,user_id,check_in_time,check_out_time,status,check_in_comment,check_out_comment",
      )
      .eq("user_id", userId)
      .is("check_out_time", null)
      .order("check_in_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as AttendanceRow | null) ?? null;
  }, []);

  // accept optional comment
  const checkIn = React.useCallback(
    async (comment?: string) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated.");

      // If already checked in (open row exists), just use it
      const openRow = await getOpenAttendanceRow(user.id);
      if (openRow?.status === "incomplete") {
        setAttendance(openRow);
        setCheckedInAt(parseDate(openRow.check_in_time));
        return;
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert([
          {
            user_id: user.id,
            check_in_time: new Date().toISOString(),
            status: "incomplete",
            check_in_comment: comment?.trim() || null,
          },
        ])
        .select(
          "id,user_id,check_in_time,check_out_time,status,check_in_comment,check_out_comment",
        )
        .single();

      if (error) throw error;

      const row = data as AttendanceRow;
      setAttendance(row);
      setCheckedInAt(parseDate(row.check_in_time));
    },
    [getOpenAttendanceRow],
  );

  //  accept optional comment
  const checkOut = React.useCallback(
    async (openRowId?: string, comment?: string) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated.");

      let rowId = openRowId;

      if (!rowId) {
        const openRow = await getOpenAttendanceRow(user.id);
        rowId = openRow?.id;
      }

      if (!rowId) throw new Error("No open attendance session found.");

      const { data, error } = await supabase
        .from("attendance")
        .update({
          check_out_time: new Date().toISOString(),
          status: "present",
          check_out_comment: comment?.trim() || null,
        })
        .eq("id", rowId)
        .eq("user_id", user.id)
        .is("check_out_time", null)
        .select(
          "id,user_id,check_in_time,check_out_time,status,check_out_comment,check_in_comment",
        )
        .single();

      if (error) throw error;

      const row = data as AttendanceRow;
      setAttendance(row);
      setCheckedInAt(null);
    },
    [getOpenAttendanceRow],
  );

  React.useEffect(() => {
    fetchLatestAttendance();
  }, [fetchLatestAttendance]);

  const onLogout = async () => {
    try {
      closeAllMenus();
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: unknown) {
      Alert.alert("Logout failed", getErrorMessage(e));
    }
  };

  //  called from modal submit (protected by runOnce)
  const submitComment = React.useCallback(() => {
    return runOnce(async () => {
      const comment = commentText.trim();
      if (!commentMode) return;

      if (!comment) {
        Alert.alert("Comment required", "Please enter a comment.");
        return;
      }

      try {
        setLoadingAttendance(true);

        if (commentMode === "checkin") {
          await checkIn(comment);
        } else {
          await checkOut(attendance?.id, comment);
        }

        setCommentModalOpen(false);
        setCommentText("");
        setCommentMode(null);
        setCheckOpen(false);
      } catch (err: unknown) {
        Alert.alert("Action failed", getErrorMessage(err));
        fetchLatestAttendance();
      } finally {
        setLoadingAttendance(false);
      }
    });
  }, [
    runOnce,
    commentText,
    commentMode,
    checkIn,
    checkOut,
    attendance?.id,
    fetchLatestAttendance,
  ]);

  const onToggleCheck = React.useCallback(() => {
    return runOnce(async () => {
      try {
        if (loadingAttendance) return;

        const nowDate = new Date();

        // CHECK IN
        if (!isCheckedIn) {
          if (needsCheckInCommentNepal(nowDate)) {
            setCommentMode("checkin");
            setCommentText("");
            setCommentModalOpen(true);
            return;
          }

          setLoadingAttendance(true);
          await checkIn();
          setCheckOpen(false);
          return;
        }

        // CHECK OUT
        if (needsCheckOutCommentNepal(nowDate)) {
          setCommentMode("checkout");
          setCommentText("");
          setCommentModalOpen(true);
          return;
        }

        setLoadingAttendance(true);
        await checkOut(attendance?.id);
        setCheckOpen(false);
      } catch (err: unknown) {
        Alert.alert("Check action failed", getErrorMessage(err));
        fetchLatestAttendance();
      } finally {
        setLoadingAttendance(false);
      }
    });
  }, [
    runOnce,
    loadingAttendance,
    isCheckedIn,
    attendance?.id,
    checkIn,
    checkOut,
    fetchLatestAttendance,
  ]);

  const isLocked = loadingAttendance || checkActionLockRef.current;

  return (
    <>
      {/* Comment Modal */}
      <Modal transparent visible={commentModalOpen} animationType="fade">
        <View style={tw`flex-1 bg-black/40 items-center justify-center px-6`}>
          <View style={tw`w-full bg-white rounded-2xl p-4`}>
            <Text style={tw`text-lg font-bold text-black`}>
              {commentMode === "checkin" ? "Late check-in" : "Early check-out"}
            </Text>
            <Text style={tw`text-gray-600 mt-1`}>Please write a reason.</Text>

            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Reason..."
              multiline
              style={tw`mt-3 border border-gray-300 rounded-xl p-3 min-h-20 text-black`}
            />

            <View style={tw`flex-row justify-end mt-4`}>
              <Pressable
                disabled={isLocked}
                onPress={() => {
                  if (isLocked) return;
                  setCommentModalOpen(false);
                  setCommentText("");
                  setCommentMode(null);
                }}
                style={({ pressed }) => [
                  tw`px-4 py-2 mr-2`,
                  (pressed || isLocked) && tw`opacity-70`,
                ]}
              >
                <Text style={tw`text-gray-700 font-bold`}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={isLocked}
                onPress={submitComment}
                style={({ pressed }) => [
                  tw`px-4 py-2 bg-green-700 rounded-xl`,
                  (pressed || isLocked) && tw`opacity-70`,
                ]}
              >
                <Text style={tw`text-white font-bold`}>
                  {isLocked ? "..." : "Submit"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={tw`mr-4`}>
              <View style={tw`flex-row items-center`}>
                {/* CHECK (dropdown) */}
                <View style={{ position: "relative" }}>
                  <Pressable
                    disabled={isLocked}
                    onPress={() => {
                      if (isLocked) return;
                      setMenuOpen(false);
                      setCheckOpen((v) => !v);
                    }}
                    style={({ pressed }) => [
                      tw`ml-3`,
                      (pressed || isLocked) && tw`opacity-80`,
                    ]}
                    hitSlop={10}
                  >
                    {isCheckedIn ? (
                      <View style={tw`bg-[#16A34A] h-3 w-3 rounded-full`} />
                    ) : (
                      <View style={tw`bg-[#EF4444] h-3 w-3 rounded-full`} />
                    )}
                  </Pressable>

                  {checkOpen ? (
                    <View
                      style={[
                        tw`absolute right-0 top-12 bg-white border p-2 rounded-xl items-center justify-center border-[#E5E5E5] w-35`,
                      ]}
                    >
                      {isCheckedIn ? (
                        <>
                          <Text style={tw`text-gray-500`}>
                            Since{" "}
                            {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                          </Text>

                          <Text
                            style={tw`mt-1 text-3xl font-bold text-[#0C0C0C]`}
                          >
                            {formatElapsed(elapsedMs)}
                          </Text>

                          <Pressable
                            onPress={onToggleCheck}
                            disabled={isLocked}
                            style={({ pressed }) => [
                              tw`mt-3 rounded-xl px-4 py-3 items-center justify-center`,
                              {
                                backgroundColor: "#EF4444",
                                opacity: isLocked ? 0.6 : pressed ? 0.85 : 1,
                              },
                            ]}
                          >
                            <Text style={tw`text-white font-bold`}>
                              {isLocked ? "..." : "Check out"}
                            </Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable
                          onPress={onToggleCheck}
                          disabled={isLocked}
                          style={({ pressed }) => [
                            tw`rounded-xl px-4 py-3 flex-row items-center justify-center`,
                            {
                              backgroundColor: "#FFFFFF",
                              opacity: isLocked ? 0.6 : pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          <CircleCheck size={20} color="#16A34A" />
                          <Text style={tw`ml-2 font-bold text-[#16A34A]`}>
                            {isLocked ? "..." : "Check In"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  ) : null}
                </View>

                {/* Profile */}
                <View style={{ position: "relative" }}>
                  <Pressable
                    disabled={isLocked}
                    onPress={() => {
                      if (isLocked) return;
                      setCheckOpen(false);
                      setMenuOpen((v) => !v);
                    }}
                    style={({ pressed }) => [
                      tw`ml-3`,
                      (pressed || isLocked) && tw`opacity-80`,
                    ]}
                    hitSlop={10}
                  >
                    <View
                      style={tw`w-9 h-9 rounded-full bg-white border border-[#E5E5E5] items-center justify-center`}
                    >
                      <User size={18} color="#0C0C0C" />
                    </View>
                  </Pressable>

                  {menuOpen ? (
                    <View
                      style={[
                        tw`absolute right-0 top-12 bg-white border border-[#E5E5E5] p-2 rounded-xl`,
                        { width: 150 },
                      ]}
                    >
                      <Pressable
                        disabled={isLocked}
                        onPress={() => {
                          if (isLocked) return;
                          setMenuOpen(false);
                          router.push("/(users)/profile");
                        }}
                        style={({ pressed }) => [
                          tw`flex-row items-center px-3 py-2`,
                          (pressed || isLocked) && tw`opacity-80`,
                        ]}
                      >
                        <UserCircle size={18} color="#0C0C0C" />
                        <Text style={tw`ml-2 font-bold text-[#0C0C0C]`}>
                          Profile
                        </Text>
                      </Pressable>

                      <View style={tw`h-px bg-[#E5E5E5] my-1`} />

                      <Pressable
                        disabled={isLocked}
                        onPress={onLogout}
                        style={({ pressed }) => [
                          tw`flex-row items-center px-3 py-2`,
                          (pressed || isLocked) && tw`opacity-80`,
                        ]}
                      >
                        <LogOut size={20} color="#FF4D4F" />
                        <Text style={tw`ml-2 font-bold text-[#FF4D4F]`}>
                          Logout
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ),
        }}
        tabBar={(props) => <MyTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="leaves" options={{ title: "Leaves" }} />
        <Tabs.Screen name="more" options={{ title: "More" }} />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profile", href: null }}
        />
      </Tabs>
    </>
  );
}
