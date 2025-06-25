import { createSafeContext } from "utils/createSafeContext";

export const [FeuilleRouteContextProvider, useFeuilleRouteContext] = createSafeContext(
  "useFeuilleRouteContext must be used within a FeuilleRouteContextProvider",
);