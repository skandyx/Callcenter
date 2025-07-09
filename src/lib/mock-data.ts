import { type CallData } from "@/lib/types";

const agents = [
  { id: "agent_001", name: "Alice", number: "101" },
  { id: "agent_002", name: "Bob", number: "102" },
  { id: "agent_003", name: "Charlie", number: "103" },
  { id: "agent_004", name: "Diana", number: "104" },
  { id: "agent_005", name: "Eve", number: "105" },
];
const queues = ["Sales", "Support", "Billing"];
const statuses: CallData["status"][] = [
  "Completed",
  "Abandoned",
  "Redirected",
  "Direct call",
];
const statusDetails = {
  Completed: [
    "Completed by answer",
    "Completed by pickup",
    "Completed by key press",
  ],
  Abandoned: ["Abandoned"],
  Redirected: ["Completed by timeout", "Completed by transfer"],
  "Direct call": ["Incoming", "Outgoing", "Missed - Busy", "Missed - Declined"],
};
const weekdays = [
  "1 Monday",
  "2 Tuesday",
  "3 Wednesday",
  "4 Thursday",
  "5 Friday",
  "6 Saturday",
  "7 Sunday",
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockCall(id: number): CallData {
  const now = new Date();
  now.setHours(now.getHours() - Math.floor(Math.random() * 8));
  now.setMinutes(now.getMinutes() - Math.floor(Math.random() * 60));

  const status = getRandom(statuses);
  const agent =
    status === "Completed" || Math.random() > 0.3 ? getRandom(agents) : null;
  const timeInQueue = Math.floor(Math.random() * 300); // 0-300 seconds

  return {
    enter_datetime: now.toISOString(),
    enter_hour: now.getHours(),
    enter_year: now.getFullYear(),
    enter_month: parseInt(
      `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    ),
    time_in_queue_seconds: timeInQueue,
    processing_time_seconds:
      status === "Completed" ? Math.floor(Math.random() * 600) + 30 : 0,
    less_than_30s_waittime:
      status === "Abandoned" && timeInQueue < 30
        ? null
        : timeInQueue < 30
        ? 1
        : 0,
    less_than_60s_waittime:
      status === "Abandoned" && timeInQueue < 60
        ? null
        : timeInQueue < 60
        ? 1
        : 0,
    less_than_120s_waittime:
      status === "Abandoned" && timeInQueue < 120
        ? null
        : timeInQueue < 120
        ? 1
        : 0,
    version: 4.1,
    call_id: `call_${Date.now()}_${id}`,
    queue_name: getRandom(queues),
    enter_date: now.toISOString().split("T")[0],
    enter_time: now.toTimeString().split(" ")[0],
    enter_weekday: weekdays[now.getDay()],
    calling_number: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,"0")}`,
    calling_forward: null,
    agent: agent?.name ?? null,
    status: status,
    status_detail: getRandom(statusDetails[status]),
    calling_name: Math.random() > 0.5 ? "Acme Corp" : "John Doe",
    enter_week: `${now.getFullYear()}${Math.ceil(
      ((now.getTime() -
        new Date(now.getFullYear(), 0, 1).getTime()) /
        86400000 +
        1) /
        7
    )}`,
    internal_call: Math.random() > 0.9 ? "Yes" : "No",
    agent_id: agent?.id ?? null,
    agent_number: agent?.number ?? null,
    parent_call_id: null,
  };
}

export const mockCallData: CallData[] = Array.from({ length: 150 }, (_, i) =>
  generateMockCall(i)
);
