'use client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ViewsOverTimeChartProps {
  data: { date: string; views: number }[];
}

export default function ViewsOverTimeChart({ data }: ViewsOverTimeChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#2563eb"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 