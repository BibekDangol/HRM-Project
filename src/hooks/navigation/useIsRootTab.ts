import { useMemo } from "react";

type Params = {
  pathname: string;
  rootPaths: string[];
};

export function useIsRootTab({ pathname, rootPaths }: Params) {
  return useMemo(() => {
    return rootPaths.some(
      (path) => pathname === path || pathname === `${path}/index`,
    );
  }, [pathname, rootPaths]);
}