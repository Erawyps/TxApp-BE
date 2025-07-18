import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dailyTripsCount } from "./data";
import { Card } from "components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-dark-700">
        <p className="font-bold">{label}</p>
        <p className="text-emerald-600">
          <span className="text-gray-600 dark:text-gray-300">Courses: </span>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function TripsCountChart() {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
        Nombre de Courses Journalières
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyTripsCount}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
              name="Nombre de courses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}