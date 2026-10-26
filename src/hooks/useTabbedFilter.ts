import { useMemo, useState } from "react";

export type TabDefinition<K extends string> = {
  key: K;
  label: string;
};

export type UseTabbedFilterOptions<T, K extends string> = {
  items: T[];
  initialTab?: K;
  tabDefs: readonly TabDefinition<K>[];
  getFilterKey: (item: T) => K | string | null | undefined;
  /** If provided, selecting this tab returns all items without filtering. Defaults to 'all'. */
  allKey?: K | "all";
};

export function useTabbedFilter<T, K extends string>({
  items,
  initialTab,
  tabDefs,
  getFilterKey,
  allKey = "all",
}: UseTabbedFilterOptions<T, K>) {
  const [activeTab, setActiveTab] = useState<K>(initialTab ?? tabDefs[0].key);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const def of tabDefs) {
      acc[def.key] = 0;
    }

    for (const item of items) {
      const key = getFilterKey(item);
      if (key && acc[key] !== undefined) {
        acc[key] += 1;
      }
    }

    if (acc[allKey] !== undefined) {
      acc[allKey] = items.length;
    }

    return acc as Record<K, number>;
  }, [items, tabDefs, getFilterKey, allKey]);

  const filteredItems = useMemo(() => {
    if (activeTab === allKey) {
      return items;
    }
    return items.filter((item) => {
      const key = getFilterKey(item);
      return key === activeTab;
    });
  }, [items, activeTab, allKey, getFilterKey]);

  const tabs = useMemo(() => {
    return tabDefs.map((def) => ({
      key: def.key,
      label: def.label,
      count: counts[def.key] ?? 0,
    }));
  }, [tabDefs, counts]);

  return {
    activeTab,
    setActiveTab,
    filteredItems,
    counts,
    tabs,
  };
}

export default useTabbedFilter;
