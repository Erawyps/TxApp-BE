import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card } from "components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const trips = payload[0]?.value || 0;
    const revenue = payload[1]?.value || 0;
    const avgRevenue = trips > 0 ? revenue / trips : 0;
    
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-dark-700">
        <p className="font-bold">{label}</p>
        <p className="text-primary-600">
          <span className="text-gray-600 dark:text-gray-300">Courses: </span>
          {trips}
        </p>
        <p className="text-emerald-600">
          <span className="text-gray-600 dark:text-gray-300">Revenu total: </span>
          {revenue.toFixed(2)} €
        </p>
        <p>
          <span className="text-gray-600 dark:text-gray-300">Revenu moyen: </span>
          {avgRevenue.toFixed(2)} €
        </p>
      </div>
    );
  }
  return null;
};

export default function DriverPerformanceChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
          Performance des Chauffeurs
        </h3>
        <div className="flex h-72 w-full items-center justify-center">
          <div className="text-gray-500">Chargement des données...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
        Performance des Chauffeurs
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="trips" 
              name="Nombre de courses" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right" 
              dataKey="revenue" 
              name="Revenu total (€)" 
              fill="#82ca9d" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}