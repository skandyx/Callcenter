import { type CallData } from "@/lib/types";

// This file is no longer used for in-memory storage.
// The data is now stored in a JSON file to ensure state is shared
// across different serverless function invocations.
export const callDataStore: CallData[] = [];
