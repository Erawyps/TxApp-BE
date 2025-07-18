import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { dailyRevenues } from "./data";
import { Card } from "components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-dark-700">
        <p className="font-bold">{label}</p>
        <p className="text-primary-600">
          <span className="text-gray-600 dark:text-gray-300">Revenus: </span>
          {payload[0].value.toFixed(2)} €
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenuesChart() {
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
        Revenus Journaliers
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyRevenues}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tickFormatter={(value) => `${value} €`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="earnings" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              name="Revenus"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}