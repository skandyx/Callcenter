import { useMemo } from "react";
import { Phone, Clock, ShieldCheck, Percent } from "lucide-react";
import KpiCard from "@/components/dashboard/kpi-card";
import { type CallData } from "@/lib/types";

interface MetricsDashboardProps {
  data: CallData[];
}

export default function MetricsDashboard({ data }: MetricsDashboardProps) {
  const stats = useMemo(() => {
    const totalCalls = data.length;
    const answeredCalls = data.filter((call) => call.status === "Completed");

    const totalQueueTime = data.reduce(
      (acc, call) => acc + call.time_in_queue_seconds,
      0
    );
    const avgQueueTime =
      totalCalls > 0 ? (totalQueueTime / totalCalls).toFixed(1) : "0";

    const calculateServiceLevel = (seconds: 30 | 60 | 120) => {
      const key = `less_than_${seconds}s_waittime` as const;
      const relevantCalls = data.filter((call) => call[key] !== null);
      if (relevantCalls.length === 0) return 0;
      const withinThreshold = relevantCalls.filter(
        (call) => call[key] === 1
      ).length;
      return (withinThreshold / relevantCalls.length) * 100;
    };

    const sl30 = calculateServiceLevel(30);
    const sl60 = calculateServiceLevel(60);

    return {
      totalCalls,
      avgQueueTime,
      serviceLevel30: sl30.toFixed(1),
      answeredPercentage:
        totalCalls > 0
          ? ((answeredCalls.length / totalCalls) * 100).toFixed(1)
          : "0",
    };
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Total Calls Today"
        value={stats.totalCalls.toLocaleString()}
        Icon={Phone}
        description="All incoming call events"
      />
      <KpiCard
        title="Avg. Wait Time"
        value={`${stats.avgQueueTime}s`}
        Icon={Clock}
        description="Average time in queue for all calls"
      />
      <KpiCard
        title="Service Level (<30s)"
        value={`${stats.serviceLevel30}%`}
        Icon={ShieldCheck}
        description="Calls answered within 30 seconds"
      />
      <KpiCard
        title="Answer Rate"
        value={`${stats.answeredPercentage}%`}
        Icon={Percent}
        description="Percentage of calls answered"
      />
    </div>
  );
}
