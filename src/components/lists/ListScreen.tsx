import { Plus, Search } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";

import EmptyState from "@/src/components/states/EmptyState";
import ErrorState from "@/src/components/states/ErrorState";
import HeaderWithSearch from "@/src/components/SearchBar";
import LoadingState from "@/src/components/states/LoadingState";
import { Pagination, PaginationVariant } from "./Pagination";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export type ListScreenTab<K extends string = string> = {
  key: K;
  label: string;
  count?: number;
};

export type ListScreenProps<T, K extends string = string> = {
  // Search / Header
  search?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onBack?: () => void;
  showHeaderSearch?: boolean;

  // Tabs
  tabs?: readonly ListScreenTab<K>[];
  activeTab?: K;
  onTabChange?: (tab: K) => void;

  // Primary Action Button
  primaryActionLabel?: string;
  primaryActionIcon?: React.ReactNode;
  onPrimaryAction?: () => void;

  // Data & FlatList
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  flatListRef?: React.RefObject<FlatList<T> | null>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ItemSeparatorComponent?: React.ComponentType<any> | null;

  // Loading, Refreshing, Error
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  error?: any;
  onRetry?: () => void;
  loadingMessage?: string;

  // Empty State Customization
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  ListEmptyComponent?: React.ReactElement | null;

  // Pagination
  page?: number;
  totalPages?: number;
  pageNumbers?: number[];
  setPage?: (page: number) => void;
  shouldShowPagination?: boolean;
  isChangingPage?: boolean;
  paginationVariant?: PaginationVariant;

  // Additional elements
  children?: React.ReactNode;
  headerBottom?: React.ReactNode;
  ListHeaderComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
};

export function ListScreen<T, K extends string = string>({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onBack,
  showHeaderSearch,
  tabs,
  activeTab,
  onTabChange,
  primaryActionLabel,
  primaryActionIcon,
  onPrimaryAction,
  data,
  renderItem,
  keyExtractor,
  flatListRef,
  contentContainerStyle,
  ItemSeparatorComponent = () => <View style={tw`h-3`} />,
  loading = false,
  refreshing = false,
  onRefresh,
  error,
  onRetry,
  loadingMessage = "Loading...",
  emptyIcon,
  emptyTitle = "No items found",
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  ListEmptyComponent,
  page,
  totalPages,
  pageNumbers,
  setPage,
  shouldShowPagination = false,
  isChangingPage = false,
  paginationVariant = "brand",
  children,
  headerBottom,
  ListHeaderComponent,
  ListFooterComponent,
}: ListScreenProps<T, K>) {
  const shouldShowSearch = showHeaderSearch ?? (onSearchChange !== undefined || onBack !== undefined);

  const defaultEmptyComponent = error ? (
    <ErrorState
      message={typeof error === "string" ? error : error?.message ?? "An error occurred"}
      onRetry={onRetry}
      style={tw`py-16`}
    />
  ) : loading ? (
    <LoadingState message={loadingMessage} style={tw`py-20`} />
  ) : (
    <EmptyState
      icon={emptyIcon ?? <Search size={32} color="#94A3B8" />}
      title={emptyTitle}
      message={emptyMessage}
      actionLabel={emptyActionLabel}
      onAction={onEmptyAction}
    />
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      {shouldShowSearch && onSearchChange ? (
        <HeaderWithSearch
          search={search ?? ""}
          onSearchChange={onSearchChange}
          onBack={onBack}
          loading={loading}
          placeholder={searchPlaceholder}
        />
      ) : null}

      {tabs && tabs.length > 0 ? (
        <View style={tw`flex-row items-center gap-2 px-4 pt-3 pb-2`}>
          <View style={tw`flex-1 flex-row rounded-2xl p-1 bg-slate-100`}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => onTabChange?.(tab.key)}
                  style={({ pressed }) => [
                    tw`flex-1 py-3 rounded-xl items-center`,
                    isActive ? tw`${TW.bgAction}` : null,
                    pressed && !isActive && tw`opacity-70`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-bold`,
                      isActive ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
                    ]}
                  >
                    {tab.label.toUpperCase()}{" "}
                    {tab.count !== undefined && (
                      <Text
                        style={[
                          isActive ? tw`${TW.textButton}` : tw`${TW.textPrimary}`,
                        ]}
                      >
                        ({tab.count})
                      </Text>
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {onPrimaryAction ? (
            <Pressable
              onPress={onPrimaryAction}
              style={({ pressed }) => [
                tw`h-12 w-12 rounded-full ${TW.bgAction}/90 items-center justify-center`,
                pressed && tw`opacity-85`,
              ]}
              accessibilityRole="button"
              accessibilityLabel={primaryActionLabel ?? "Add"}
            >
              {primaryActionIcon ?? <Plus size={22} color="white" strokeWidth={2.5} />}
            </Pressable>
          ) : null}
        </View>
      ) : headerBottom ? (
        headerBottom
      ) : null}

      <FlatList
        ref={flatListRef as any}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={[tw`px-4 pb-6`, contentContainerStyle]}
        style={{ opacity: isChangingPage ? 0.4 : 1 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent ?? defaultEmptyComponent}
        ListFooterComponent={
          <>
            {ListFooterComponent}
            {shouldShowPagination && page && totalPages && pageNumbers && setPage ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                setPage={setPage}
                variant={paginationVariant}
              />
            ) : null}
          </>
        }
      />

      {children}
    </View>
  );
}

export default ListScreen;
