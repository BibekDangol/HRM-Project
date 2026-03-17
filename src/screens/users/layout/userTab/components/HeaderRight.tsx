import { CircleCheck, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";

import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import React from "react";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";

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
      style={[
        tw`flex-row items-center gap-3`,
        { marginRight: 16, marginBottom: 8 },
      ]}>
      {/* Check in/out */}
      <View style={{ position: "relative" }}>
        <Pressable
          disabled={isLocked}
          onPress={onCheckInAndOut}
          style={({ pressed }) => [
            tw`h-8 w-8 rounded-full items-center justify-center`,
            { opacity: pressed || isLocked ? 0.7 : 1 },
          ]}
          hitSlop={10}>
          <View
            style={[
              tw`h-3 w-3 rounded-full`,
              { backgroundColor: isCheckedIn ? "#4ADE80" : "#FCA5A5" },
            ]}
          />
        </Pressable>

        {isCheckOpen && (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 46,
              width: 180,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              backgroundColor: "#ffffff",
            }}>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: TW.BORDER,
                overflow: "hidden",
                backgroundColor: "#ffffff",
              }}>
              {isCheckedIn ? (
                <View
                  style={{
                    padding: 16,
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "500",
                      color: TW.textPrimary,
                    }}>
                    Since {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                  </Text>

                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "800",
                      color: TW.textPrimary,
                      marginTop: 4,
                      marginBottom: 12,
                      letterSpacing: -0.5,
                    }}>
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
                    })}>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: 13,
                      }}>
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
                  })}>
                  <CircleCheck size={18} color={TW.SUCCESS_COLOR} />
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      color: TW.SUCCESS,
                    }}>
                    {isLocked ? "..." : "Check In"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Profile button + ProfileMenu */}
      <View style={{ marginRight: 0, position: "relative" }}>
        <Pressable
          disabled={isLocked}
          onPress={onProfileClick}
          style={({ pressed }) => ({
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.5)",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed || isLocked ? 0.75 : 1,
          })}
          hitSlop={10}>
          <User size={17} color="#ffffff" />
        </Pressable>

        <ProfileMenu
          open={isProfileMenuOpen}
          onProfile={onProfileMenuClick}
          onLogout={onLogout}
        />
      </View>
    </View>
  );
};

export default HeaderRight;
