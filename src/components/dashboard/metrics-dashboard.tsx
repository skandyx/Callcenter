import { useMemo } from "react";
import { Phone, Clock, ShieldCheck, Percent, Zap } from "lucide-react";
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
      (acc, call) => acc + (call.time_in_queue_seconds || 0),
      0
    );
    const avgQueueTime =
      totalCalls > 0 ? (totalQueueTime / totalCalls).toFixed(1) : "0";

    const calculateServiceLevel = (seconds: 10 | 30 | 60 | 120) => {
      // A more robust way to check for wait time, works even if `less_than_...` fields are not in the data
      const relevantCalls = data.filter(call => call.time_in_queue_seconds != null && call.status !== 'Abandoned');
      if (relevantCalls.length === 0) return 0;

      const withinThreshold = relevantCalls.filter(
        (call) => call.time_in_queue_seconds! <= seconds
      ).length;
      return (withinThreshold / relevantCalls.length) * 100;
    };
    
    const sl10 = calculateServiceLevel(10);
    const sl30 = calculateServiceLevel(30);

    return {
      totalCalls,
      avgQueueTime,
      serviceLevel10: sl10.toFixed(1),
      serviceLevel30: sl30.toFixed(1),
      answeredPercentage:
        totalCalls > 0
          ? ((answeredCalls.length / totalCalls) * 100).toFixed(1)
          : "0",
    };
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        title="Service Level (<10s)"
        value={`${stats.serviceLevel10}%`}
        Icon={Zap}
        description="Calls answered within 10 seconds"
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
