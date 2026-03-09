import * as Location from "expo-location";

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
import React, { useEffect } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";

import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { AttendanceRow } from "@/src/types/attendance";
import tw from "twrnc";
import { MyTabBar } from "./tabBar";

/* ---------------- Nepal date helper ---------------- */
const NEPAL_OFFSET_MIN = 5 * 60 + 45;

function nepalDateYYYYMMDD(now = new Date()) {
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MIN * 60 * 1000);
  return nepalNow.toISOString().slice(0, 10);
}

/* ---------------- Location helper ---------------- */
async function getUserLocationOrThrow() {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== "granted") {
    throw new Error("Location permission not granted.");
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };
}

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

  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [commentMode, setCommentMode] = React.useState<
    "checkin" | "checkout" | null
  >(null);

  // Prevent double-tap / slow network double action
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

  const { setUserProfile } = useUsersStore();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const profile = await fetchCurrentUserProfleService(user.id);

      setUserProfile(profile);
    };

    loadCurrentUser();
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
          "id,user_id,date,check_in_time,check_out_time,status,check_in_comment,check_out_comment,check_in_lat,check_in_lng,check_out_lat,check_out_lng",
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

  const getAnyOpenAttendanceRow = React.useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        "id,user_id,date,check_in_time,check_out_time,status,check_in_comment,check_out_comment,check_in_lat,check_in_lng,check_out_lat,check_out_lng",
      )
      .eq("user_id", userId)
      .is("check_out_time", null)
      .order("check_in_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as AttendanceRow | null) ?? null;
  }, []);

  const checkIn = React.useCallback(async (comment?: string) => {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user) throw new Error("Not authenticated.");

    //Get user's current GPS location (check-in)
    const loc = await getUserLocationOrThrow();

    const date = nepalDateYYYYMMDD();

    // If already completed today, block
    const { data: today, error: todayErr } = await supabase
      .from("attendance")
      .select("id,status")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();

    if (todayErr) throw todayErr;

    if (today?.status === "present") {
      Alert.alert("Already completed", "You already checked in & out today.");
      return;
    }

    if (today?.status === "incomplete") {
      Alert.alert("Already checked in", "You can't check in twice today.");
      return;
    }

    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          user_id: user.id,
          date,
          check_in_time: new Date().toISOString(),
          status: "incomplete",
          check_in_comment: comment?.trim() || null,

          check_in_lat: loc.lat,
          check_in_lng: loc.lng,

          // ensure open session
          check_out_time: null,
          check_out_comment: null,
          check_out_lat: null,
          check_out_lng: null,
        },
        { onConflict: "user_id,date" },
      )
      .select(
        "id,user_id,date,check_in_time,check_out_time,status,check_in_comment,check_out_comment,check_in_lat,check_in_lng,check_out_lat,check_out_lng",
      )
      .single();

    if (error) throw error;

    const row = data as AttendanceRow;
    setAttendance(row);
    setCheckedInAt(parseDate(row.check_in_time));
  }, []);

  const checkOut = React.useCallback(
    async (comment?: string) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated.");

      // Get user's current GPS location (check-out)
      const loc = await getUserLocationOrThrow();

      // ✅ Find the open row (could be yesterday)
      const openRow = await getAnyOpenAttendanceRow(user.id);

      if (!openRow) {
        Alert.alert(
          "No open session",
          "You haven't checked in yet (or already checked out).",
        );
        return;
      }

      const { data, error } = await supabase
        .from("attendance")
        .update({
          check_out_time: new Date().toISOString(),
          status: "present",
          check_out_comment: comment?.trim() || null,
          check_out_lat: loc.lat,
          check_out_lng: loc.lng,
        })
        // ✅ update by id, not by date
        .eq("id", openRow.id)
        .select(
          "id,user_id,date,check_in_time,check_out_time,status,check_out_comment,check_in_comment,check_in_lat,check_in_lng,check_out_lat,check_out_lng",
        )
        .single();

      if (error) throw error;

      const row = data as AttendanceRow;
      setAttendance(row);
      setCheckedInAt(null);
    },
    [getAnyOpenAttendanceRow],
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

  // Called from modal submit (protected by runOnce)
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
          await checkOut(comment);
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
    fetchLatestAttendance,
  ]);

  const onToggleCheck = React.useCallback(() => {
    return runOnce(async () => {
      try {
        if (loadingAttendance) return;

        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) throw userErr;
        if (!user) throw new Error("Not authenticated.");

        const nowDate = new Date();

        if (!isCheckedIn) {
          const anyOpen = await getAnyOpenAttendanceRow(user.id);
          if (anyOpen?.status === "incomplete") {
            Alert.alert(
              "Already checked in",
              `You still have an open session from ${anyOpen.date}. Please check out first.`,
            );
            setCheckOpen(false);
            return;
          }

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

        if (needsCheckOutCommentNepal(nowDate)) {
          setCommentMode("checkout");
          setCommentText("");
          setCommentModalOpen(true);
          return;
        }

        setLoadingAttendance(true);
        await checkOut();
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
    checkIn,
    checkOut,
    fetchLatestAttendance,
    getAnyOpenAttendanceRow,
  ]);

  const isLocked = loadingAttendance || checkActionLockRef.current;

  return (
    <>
      {/* Comment Modal */}
      <Modal
        transparent
        visible={commentModalOpen}
        animationType="fade"
        onRequestClose={() => {
          if (isLocked) return;
          setCommentModalOpen(false);
          setCommentText("");
          setCommentMode(null);
        }}
      >
        <Pressable
          style={tw`flex-1 bg-black/40 items-center justify-center px-6`}
          onPress={() => {
            if (isLocked) return;
            setCommentModalOpen(false);
            setCommentText("");
            setCommentMode(null);
          }}
        >
          <Pressable
            style={tw`w-full bg-white rounded-2xl p-4`}
            onPress={() => {}}
          >
            <Text style={tw`text-lg font-bold text-black`}>
              {commentMode === "checkin" ? "Late check-in" : "Early check-out"}
            </Text>
            <Text style={tw`text-gray-600 mt-1`}>Please write a reason.</Text>

            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Reason..."
              placeholderTextColor="#9CA3AF"
              multiline
              editable={!isLocked}
              style={tw`mt-3 border border-gray-300 rounded-xl p-3 m text-black`}
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
                disabled={isLocked || commentText.trim().length === 0}
                onPress={submitComment}
                style={({ pressed }) => [
                  tw`px-4 py-2 rounded-xl`,
                  isLocked || commentText.trim().length === 0
                    ? tw`bg-green-700/50`
                    : tw`bg-green-700`,
                  (pressed || isLocked) && tw`opacity-70`,
                ]}
              >
                <Text style={tw`text-white font-bold`}>
                  {isLocked ? "..." : "Submit"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
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
                        tw`absolute right-0 top-9 bg-white border p-2 rounded-xl items-center justify-center border-[#E5E5E5] w-40`,
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
        <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
        <Tabs.Screen name="more" options={{ title: "Settings" }} />
      </Tabs>
    </>
  );
}
