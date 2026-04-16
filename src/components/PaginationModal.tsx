import { Pressable, Text, View } from "react-native";

interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  setPage: (page: number) => void;
  TW: any;
  tw: any;

}

export const Pagination = ({
  page,
  totalPages,
  pageNumbers,
  setPage,
  TW,
  tw,
}: PaginationProps) => {
  return (
    <View style={tw`pt-4 pb-2`}>
      <View style={tw`flex-row items-center gap-2 mb-2`}>
        <Pressable
          onPress={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={[
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
            page === 1 && tw`opacity-30`,
          ]}
        >
          <Text style={tw`${TW.textPrimary} font-bold text-base`}>‹ Prev</Text>
        </Pressable>

        {pageNumbers.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPage(p)}
            style={[
              tw`h-10 w-10 rounded-xl items-center justify-center`,
              p === page ? tw`${TW.bgAction}` : tw`border ${TW.BORDER}`,
            ]}
          >
            <Text
              style={[
                tw`text-sm font-semibold`,
                p === page ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
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
            tw`flex-1 h-10 rounded-xl items-center justify-center border ${TW.BORDER}`,
            page === totalPages && tw`opacity-30`,
          ]}
        >
          <Text style={tw`${TW.textPrimary} font-bold text-base`}>Next ›</Text>
        </Pressable>
      </View>
    </View>
  );
};