import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface SalesChartProps {
  data: Array<{ date: string; revenue: number; orders?: number; profit?: number }>;
  type?: 'bar' | 'line';
  dataKeys?: Array<{ key: string; color: string; name: string }>;
}

const defaultKeys = [
  { key: 'revenue', color: '#2563eb', name: 'Revenue' },
];

export function SalesChart({ data, type = 'bar', dataKeys = defaultKeys }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available for the selected period
      </div>
    );
  }

  const formatNaira = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tickFormatter={formatNaira} tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip
              formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <Legend />
            {dataKeys.map((k) => (
              <Bar key={k.key} dataKey={k.key} fill={k.color} name={k.name} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tickFormatter={formatNaira} tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip
              formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend />
            {dataKeys.map((k) => (
              <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} name={k.name} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
