
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Asset } from '../types';

interface AssetChartProps {
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-slate-200 rounded shadow-md">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p className="text-sm">{`จำนวน: ${payload[0].value} ชิ้น`}</p>
      </div>
    );
  }
  return null;
};

const AssetChart: React.FC<AssetChartProps> = ({ assets }) => {
  if (assets.length === 0) {
    return null;
  }

  const chartData = assets.reduce((acc, asset) => {
    const type = asset.type || 'ไม่ระบุประเภท';
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(chartData).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-full">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">สรุปภาพรวมทรัพย์สิน</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetChart;
