'use client';
import ViewsOverTimeChart from '@/components/video/ViewsOverTimeChart';
import EngagementBarChart from '@/components/video/EngagementBarChart';

interface Props {
  viewsByDay: { date: string; views: number }[];
  engagementByType: Record<string, number>;
}

export default function ClientCharts({ viewsByDay, engagementByType }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-[300px]">
        <ViewsOverTimeChart data={viewsByDay} />
      </div>
      <div className="h-[300px]">
        <EngagementBarChart
          data={Object.entries(engagementByType).map(([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
          }))}
        />
      </div>
    </div>
  );
} 