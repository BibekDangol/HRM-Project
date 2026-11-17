import { Pressable, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

export type PaginationVariant = "brand" | "muted";

export interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  setPage: (page: number) => void;
  variant?: PaginationVariant;
}

const VARIANTS: Record<
  PaginationVariant,
  { border: string; text: string; activeText: string; activeBg: string }
> = {
  brand: {
    border: TW.BORDER,
    text: TW.textPrimary,
    activeText: TW.textButton,
    activeBg: TW.bgAction,
  },
  muted: {
    border: "border-slate-200",
    text: "text-slate-700",
    activeText: "text-white",
    activeBg: "bg-primary",
  },
};

export const Pagination = ({
  page,
  totalPages,
  pageNumbers,
  setPage,
  variant = "brand",
}: PaginationProps) => {
  const theme = VARIANTS[variant];

  return (
    <View style={tw`pt-4 pb-2`}>
      <View style={tw`flex-row items-center gap-2 mb-2`}>
        <Pressable
          onPress={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={[
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${theme.border}`,
            page === 1 && tw`opacity-30`,
          ]}
        >
          <Text style={tw`${theme.text} font-bold text-body`}>‹ Prev</Text>
        </Pressable>

        {pageNumbers.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPage(p)}
            style={[
              tw`h-10 w-10 rounded-xl items-center justify-center`,
              p === page ? tw`${theme.activeBg}` : tw`border ${theme.border}`,
            ]}
          >
            <Text
              style={[
                tw`text-description font-semibold`,
                p === page ? tw`${theme.activeText}` : tw`${theme.text}`,
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={[
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${theme.border}`,
            page === totalPages && tw`opacity-30`,
          ]}
        >
          <Text style={tw`${theme.text} font-bold text-body`}>Next ›</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Pagination;
