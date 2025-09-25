import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "components/ui";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-dark-700">
        <p className="font-bold">{payload[0].name}</p>
        <p>
          <span className="text-gray-600 dark:text-gray-300">Courses: </span>
          {payload[0].value}
        </p>
        <p>
          <span className="text-gray-600 dark:text-gray-300">Part: </span>
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function PaymentMethodChart({ data = [], loading = false }) {

  if (loading) {
    return (
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
          Répartition des Modes de Paiement
        </h3>
        <div className="flex h-72 w-full items-center justify-center">
          <div className="text-gray-500">Chargement des données...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
          Répartition des Modes de Paiement
        </h3>
        <div className="flex h-72 w-full items-center justify-center">
          <div className="text-red-500">Aucune donnée disponible</div>
        </div>
      </Card>
    );
  }

  // Calculer le total pour les pourcentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-dark-100">
        Répartition des Modes de Paiement
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="method"
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}