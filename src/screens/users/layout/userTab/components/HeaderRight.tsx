import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
import { CircleCheck, LogOut, User } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { TW } from "@/theme/twStyles";
import React from "react";

interface Props {
  isLocked: boolean;
  onCheckInAndOut: () => void;
  isCheckedIn: boolean;
  isCheckOpen: boolean;
  checkedInAt: Date | null;
  onProfileClick: () => void;
  elapsedMs: number;
  onToggleCheck: () => void;
  onLogout: () => void;
  onProfileMenuClick: () => void;
  isProfileMenuOpen: boolean;
}

const HeaderRight: React.FC<Props> = ({
  isLocked,
  onCheckInAndOut,
  isCheckedIn,
  isCheckOpen,
  checkedInAt,
  onProfileClick,
  onProfileMenuClick,
  elapsedMs,
  onToggleCheck,
  onLogout,
  isProfileMenuOpen,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginRight: 16,
        marginBottom: 8,
        zIndex: 100,
      }}>
      {/* ── Check In / Out ── */}
      <View style={{ position: "relative", zIndex: 100 }}>
        <Pressable
          disabled={isLocked}
          onPress={onCheckInAndOut}
          hitSlop={10}
          style={({ pressed }) => ({
            height: 36,
            width: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            // opacity: pressed || isLocked ? 0.9 : 1,
          })}>
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: isCheckedIn ? "#4ADE80" : "#FCA5A5",
            }}
          />
        </Pressable>

        {isCheckOpen && (
          <>
            <Pressable
              onPress={onCheckInAndOut}
              style={{
                position: "absolute",
                top: -1000,
                left: -1000,
                right: -1000,
                bottom: -1000,
              }}
            />
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 170,
                zIndex: 9999,
                elevation: 20,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                padding: 12,
              }}>
              {isCheckedIn ? (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: TW.textSecondary ?? "#002354",
                      marginBottom: 4,
                    }}>
                    Since {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: TW.textPrimary,
                      marginBottom: 10,
                      letterSpacing: -0.5,
                    }}>
                    {formatElapsed(elapsedMs)}
                  </Text>
                  <Pressable
                    onPress={onToggleCheck}
                    disabled={isLocked}
                    style={({ pressed }) => ({
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: "#FFB300",
                      opacity: isLocked ? 0.5 : pressed ? 0.85 : 1,
                    })}>
                    <LogOut size={14} color="#1F2937" />
                    {isLocked ? (
                      <ActivityIndicator size="small" color="#1F2937" />
                    ) : (
                      <Text
                        style={{
                          color: "#1F2937",
                          fontWeight: "700",
                          fontSize: 13,
                        }}>
                        Check Out
                      </Text>
                    )}
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
                    gap: 8,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "#FFB300",
                    opacity: isLocked ? 0.5 : pressed ? 0.85 : 1,
                  })}>
                  <CircleCheck size={16} color="#1F2937" />
                  {isLocked ? (
                    <ActivityIndicator size="small" color="#1F2937" />
                  ) : (
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 13,
                        color: "#1F2937",
                      }}>
                      Check In
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      {/* ── Profile button + menu ── */}
      <View style={{ position: "relative", zIndex: 200 }}>
        <Pressable
          disabled={isLocked}
          onPress={onProfileClick}
          hitSlop={10}
          style={({ pressed }) => ({
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.5)",
            alignItems: "center",
            justifyContent: "center",
            // opacity: pressed || isLocked ? 0.75 : 1,
          })}>
          <User size={17} color="#ffffff" />
        </Pressable>

        {isProfileMenuOpen && (
          <>
            <Pressable
              onPress={onProfileClick}
              style={{
                position: "absolute",
                top: -1000,
                left: -1000,
                right: -1000,
                bottom: -1000,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: 9999,
                elevation: 20,
                minWidth: 160,
              }}>
              <ProfileMenu
                open={isProfileMenuOpen}
                onProfile={onProfileMenuClick}
                onLogout={onLogout}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default HeaderRight;
