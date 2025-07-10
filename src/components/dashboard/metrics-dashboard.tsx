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

    const calculateServiceLevel = (seconds: 10 | 30) => {
      const relevantCalls = data.filter(call => call.time_in_queue_seconds != null && call.status !== 'Abandoned');
      const total = relevantCalls.length;
      if (total === 0) return { percentage: 0, count: 0, total: 0 };

      const count = relevantCalls.filter(
        (call) => call.time_in_queue_seconds! <= seconds
      ).length;
      
      const percentage = (count / total) * 100;
      return { percentage, count, total };
    };
    
    const sl10 = calculateServiceLevel(10);
    const sl30 = calculateServiceLevel(30);

    const answeredCount = answeredCalls.length;
    const answeredTotal = data.filter(call => call.status === "Completed" || call.status === "Abandoned").length;

    return {
      totalCalls,
      avgQueueTime,
      serviceLevel10: sl10,
      serviceLevel30: sl30,
      answeredRate: {
        percentage: totalCalls > 0 ? (answeredCount / answeredTotal) * 100 : 0,
        count: answeredCount,
        total: answeredTotal,
      },
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
        value={`${stats.serviceLevel10.percentage.toFixed(1)}%`}
        Icon={Zap}
        description={`${stats.serviceLevel10.count}/${stats.serviceLevel10.total} calls answered in time`}
      />
      <KpiCard
        title="Service Level (<30s)"
        value={`${stats.serviceLevel30.percentage.toFixed(1)}%`}
        Icon={ShieldCheck}
        description={`${stats.serviceLevel30.count}/${stats.serviceLevel30.total} calls answered in time`}
      />
      <KpiCard
        title="Answer Rate"
        value={`${stats.answeredRate.percentage.toFixed(1)}%`}
        Icon={Percent}
        description={`${stats.answeredRate.count}/${stats.answeredRate.total} of calls answered`}
      />
    </div>
  );
}
