import { createSafeContext } from "utils/createSafeContext";

export const [KYCFormContextProvider, useKYCFormContext] = createSafeContext(
    "useKYCFormContext must be used within a KYCFormContextProvider",
);