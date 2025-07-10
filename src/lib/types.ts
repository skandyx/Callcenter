
export type CallData = {
  enter_datetime: string;
  enter_hour: number;
  enter_year: number;
  enter_month: number | string;
  time_in_queue_seconds?: number | null;
  processing_time_seconds?: number | null;
  less_than_10s_waittime?: number | null;
  less_than_30s_waittime?: number | null;
  less_than_60s_waittime?: number | null;
  less_than_120s_waittime?: number | null;
  version: number;
  call_id: string;
  queue_name?: string | null;
  enter_date: string;
  enter_time: string;
  enter_weekday: string;
  calling_number: string;
  calling_forward?: string | null;
  agent: string | null;
  status: "Completed" | "Abandoned" | "Redirected" | "Direct call";
  status_detail: string;
  calling_name: string | null;
  enter_week: string;
  internal_call: "Yes" | "No";
  agent_id: string | null;
  agent_number: string | null;
  parent_call_id?: string | null;
};

export type AdvancedCallData = CallData & {
  // Add any fields specific to advanced call data here
  // For example:
  transfer_history?: {
    timestamp: string;
    from_agent: string;
    to_agent: string;
    reason: string;
  }[];
  failed_attempts?: number;
};


export type AgentStatusData = {
  hour: number;
  loggedIn: number;
  loggedOut: number;
  idle: number;
  date: string;
  queuename: string;
  user_id: string;
  user: string;
  email: string;
  queue_id: string;
};

export type ProfileAvailabilityData = {
  hour: number;
  Available: number;
  Lunch: number;
  Meeting: number;
  "Left for the day": number;
  P4: number;
  P5: number;
  P6: number;
  P7: number;
  P8: number;
  P9: number;
  P10: number;
  P11: number;
  P12: number;
  P13: number;
  P14: number;
  P15: number;
  P16: number;
  P17: number;
  P18: number;
  P19: number;
  P20: number;
  P21: number;
  P22: number;
  P23: number;
  P24: number;
  OTHER: number;
  date: string;
  user: string;
  user_id: string;
  email: string;
};

export type QueueIvrData = {
  datetime: string;
  call_id: string;
  queue_name: string | null;
  calling_number: string;
  ivr_path: string;
  event_type: "EnterIVR" | "KeyPress" | "EnterQueue" | "ExitIVR" | "Timeout" | "Hangup";
  event_detail: string;
};
