import { Pressable, Text, View } from "react-native";

import React from "react";

// Props type
interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  setPage: (page: number | ((prev: number) => number)) => void;
  shouldShowPagination: boolean;
  TW: any; // your theme object
  tw: any; // tailwind function
}

export const Pagination = ({
  page,
  totalPages,
  pageNumbers,
  setPage,
  shouldShowPagination,
  TW,
  tw,
}: PaginationProps) => {
  if (!shouldShowPagination) return null;

  return (
    <View style={tw`pt-4 pb-2`}>
      <View style={tw`flex-row items-center gap-2 mb-2`}>
        {/* Prev Button */}
        <Pressable
          onPress={() => setPage((p: number) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={[
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
            page === 1 && tw`opacity-30`,
          ]}>
          <Text style={tw`${TW.textPrimary} font-bold text-base`}>‹ Prev</Text>
        </Pressable>

        {/* Page Numbers */}
        {pageNumbers.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPage(p)}
            style={[
              tw`h-10 w-10 rounded-xl items-center justify-center`,
              p === page ? tw`${TW.bgAction}` : tw`border ${TW.BORDER}`,
            ]}>
            <Text
              style={[
                tw`text-sm font-semibold`,
                p === page ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
              ]}>
              {p}
            </Text>
          </Pressable>
        ))}

        {/* Next Button */}
        <Pressable
          onPress={() => setPage((p: number) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={[
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
            page === totalPages && tw`opacity-30`,
          ]}>
          <Text style={tw`${TW.textPrimary} font-bold text-base`}>Next ›</Text>
        </Pressable>
      </View>
    </View>
  );
};
