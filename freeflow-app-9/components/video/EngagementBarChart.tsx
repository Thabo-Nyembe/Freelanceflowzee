'use client';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

interface EngagementBarChartProps {
  data: { type: string; count: number }[];
}

export default function EngagementBarChart({ data }: EngagementBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
} 