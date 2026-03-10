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
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { AttendanceRow } from "@/src/types/attendance";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";
import { MyTabBar } from "./tabBar";

/* ─── Nepal date helper ──────────────────────────────────── */
const NEPAL_OFFSET_MIN = 5 * 60 + 45;

function nepalDateYYYYMMDD(now = new Date()) {
  const nepalNow = new Date(now.getTime() + NEPAL_OFFSET_MIN * 60 * 1000);
  return nepalNow.toISOString().slice(0, 10);
}

/* ─── Location helper ────────────────────────────────────── */
async function getUserLocationOrThrow() {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== "granted") {
    throw new Error("Location permission not granted.");
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
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

  /* ─── Attendance logic ───────────────────────────────────── */
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

    const loc = await getUserLocationOrThrow();
    const date = nepalDateYYYYMMDD();

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

      const loc = await getUserLocationOrThrow();
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
        if (commentMode === "checkin") await checkIn(comment);
        else await checkOut(comment);

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
      {/* ─── Comment Modal ─────────────────────────────────── */}
      <Modal
        transparent
        visible={commentModalOpen}
        animationType="slide"
        onRequestClose={() => {
          if (isLocked) return;
          setCommentModalOpen(false);
          setCommentText("");
          setCommentMode(null);
        }}
      >
        <Pressable
          style={tw`flex-1 bg-black/50 justify-end`}
          onPress={() => {
            if (isLocked) return;
            setCommentModalOpen(false);
            setCommentText("");
            setCommentMode(null);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <Pressable
              style={[
                tw`rounded-t-3xl px-5 pt-4 pb-10`,
                { backgroundColor: TW.bgPrimary },
              ]}
              onPress={() => { }}
            >
              {/* Handle — TW.bgSecondary teal */}
              <View style={tw`items-center mb-5`}>
                <View
                  style={[
                    tw`h-1 w-10 rounded-full`,
                    { backgroundColor: TW.bgPrimary },
                  ]}
                />
              </View>

              <Text
                style={[tw`text-xl font-bold mb-1`, { color: TW.bgSecondary }]}
              >
                {commentMode === "checkin"
                  ? "Late Check-in"
                  : "Early Check-out"}
              </Text>
              <Text style={[tw`text-sm mb-5`, { color: TW.textSecondary }]}>
                Please provide a reason to continue.
              </Text>

              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write your reason here..."
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!isLocked}
                style={[
                  tw`rounded-2xl p-4 text-sm`,
                  {
                    backgroundColor: "#F3F4F6",
                    color: TW.bgSecondary,
                    minHeight: 100,
                    textAlignVertical: "top",
                    borderWidth: 1,
                    borderColor: TW.BORDER,
                  },
                ]}
              />

              <View style={tw`flex-row gap-3 mt-4`}>
                {/* Cancel — neutral */}
                <Pressable
                  disabled={isLocked}
                  onPress={() => {
                    if (isLocked) return;
                    setCommentModalOpen(false);
                    setCommentText("");
                    setCommentMode(null);
                  }}
                  style={({ pressed }) => [
                    tw`flex-1 py-4 rounded-2xl items-center border`,
                    {
                      backgroundColor: "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[tw`font-bold text-sm`, { color: TW.bgSecondary }]}
                  >
                    Cancel
                  </Text>
                </Pressable>

                {/* Submit — TW.textTertiary orange */}
                <Pressable
                  disabled={isLocked || commentText.trim().length === 0}
                  onPress={submitComment}
                  style={({ pressed }) => [
                    tw`flex-1 py-4 rounded-2xl items-center`,
                    {
                      backgroundColor:
                        isLocked || commentText.trim().length === 0
                          ? `${TW.textTertiary}80`
                          : TW.textTertiary,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={[tw`font-bold text-sm`, { color: "#ffffff" }]}>
                    {isLocked ? "..." : "Submit"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* ─── Tabs ─────────────────────────────────────────── */}
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: TW.bgSecondary }, // TW.bgSecondary deep teal
          headerTitleStyle: {
            color: "#ffffff",
            fontWeight: "bold" as const,
            fontSize: 16,
            paddingBottom: 8,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <View
              style={[
                tw`flex-row items-center gap-3`,
                { marginRight: 16, marginBottom: 8 },
              ]}
            >
              {/* ── Check in/out dot ── */}
              <View style={{ position: "relative" }}>
                <Pressable
                  disabled={isLocked}
                  onPress={() => {
                    if (isLocked) return;
                    setMenuOpen(false);
                    setCheckOpen((v) => !v);
                  }}
                  style={({ pressed }) => [
                    tw`h-8 w-8 rounded-full items-center justify-center`,
                    {
                      opacity: pressed || isLocked ? 0.7 : 1,
                    },
                  ]}
                  hitSlop={10}
                >
                  <View
                    style={[
                      tw`h-3 w-3 rounded-full`,
                      { backgroundColor: isCheckedIn ? "#4ADE80" : "#FCA5A5" },
                    ]}
                  />
                </Pressable>

                {checkOpen && (
                  // ── Outer: shadow only, no overflow hidden ──
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 46,
                      width: 180,
                      borderRadius: 16,
                      // iOS shadow
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.12,
                      shadowRadius: 12,
                      // Android shadow
                      elevation: 8,
                      backgroundColor: "#ffffff", // required for elevation to work
                    }}
                  >
                    {/* ── Inner: clips border radius, no shadow ── */}
                    <View
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: TW.BORDER,
                        overflow: "hidden", // safe here — shadow is on parent
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {isCheckedIn ? (
                        <View
                          style={{
                            padding: 16,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "500",
                              color: TW.textPrimary,
                            }}
                          >
                            Since{" "}
                            {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                          </Text>

                          <Text
                            style={{
                              fontSize: 30,
                              fontWeight: "800",
                              color: TW.textPrimary,
                              marginTop: 4,
                              marginBottom: 12,
                              letterSpacing: -0.5,
                            }}
                          >
                            {formatElapsed(elapsedMs)}
                          </Text>

                          <Pressable
                            onPress={onToggleCheck}
                            disabled={isLocked}
                            style={({ pressed }) => ({
                              width: "100%",
                              paddingVertical: 12,
                              borderRadius: 12,
                              alignItems: "center",
                              backgroundColor: TW.DANGER,
                              opacity: isLocked ? 0.6 : pressed ? 0.85 : 1,
                            })}
                          >
                            <Text
                              style={{
                                color: "#ffffff",
                                fontWeight: "700",
                                fontSize: 13,
                              }}
                            >
                              {isLocked ? "..." : "Check Out"}
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable
                          onPress={onToggleCheck}
                          disabled={isLocked}
                          style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            opacity: isLocked ? 0.6 : pressed ? 0.85 : 1,
                          })}
                        >
                          <CircleCheck size={18} color={TW.SUCCESS} />
                          <Text
                            style={{
                              fontWeight: "700",
                              fontSize: 13,
                              color: TW.SUCCESS,
                            }}
                          >
                            {isLocked ? "..." : "Check In"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* ── Profile button ── */}
              <View style={{ position: "relative" }}>
                <Pressable
                  disabled={isLocked}
                  onPress={() => {
                    if (isLocked) return;
                    setCheckOpen(false);
                    setMenuOpen((v) => !v);
                  }}
                  style={({ pressed }) => [
                    tw`h-9 w-9 rounded-full items-center justify-center border-2`,
                    {
                      borderColor: "rgba(255,255,255,0.5)",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      opacity: pressed || isLocked ? 0.75 : 1,
                    },
                  ]}
                  hitSlop={10}
                >
                  <User size={17} color="#ffffff" />
                </Pressable>

                {menuOpen && (
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 48,
                      width: 164,
                      backgroundColor: "#ffffff",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: TW.BORDER,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.1,
                      shadowRadius: 14,
                      elevation: 8,
                      overflow: "hidden",
                    }}
                  >
                    <Pressable
                      disabled={isLocked}
                      onPress={() => {
                        if (isLocked) return;
                        setMenuOpen(false);
                        router.push("/(users)/profile");
                      }}
                      style={({ pressed }) => [
                        tw`flex-row items-center gap-3 px-4 py-3.5`,
                        (pressed || isLocked) && { opacity: 0.7 },
                      ]}
                    >
                      <UserCircle size={17} color={TW.bgSecondary} />
                      <Text
                        style={[
                          tw`font-semibold text-sm`,
                          { color: TW.bgSecondary },
                        ]}
                      >
                        Profile
                      </Text>
                    </Pressable>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: TW.BORDER,
                        marginHorizontal: 12,
                      }}
                    />

                    <Pressable
                      disabled={isLocked}
                      onPress={onLogout}
                      style={({ pressed }) => [
                        tw`flex-row items-center gap-3 px-4 py-3.5`,
                        (pressed || isLocked) && { opacity: 0.7 },
                      ]}
                    >
                      <LogOut size={17} color={TW.DANGER} />
                      <Text
                        style={[
                          tw`font-semibold text-sm`,
                          { color: TW.DANGER },
                        ]}
                      >
                        Logout
                      </Text>
                    </Pressable>
                  </View>
                )}
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
