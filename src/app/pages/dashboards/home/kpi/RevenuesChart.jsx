import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "components/ui";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-dark-700 border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-primary-600 dark:text-primary-400">
          <span className="text-gray-600 dark:text-gray-300">Revenus: </span>
          <span className="font-medium">{(payload[0].value || 0).toFixed(2)} €</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenuesChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Revenus Journaliers
        </h3>
        <div className="flex h-72 w-full items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Chargement des données...</div>
        </div>
      </Card>
    );
  }

  // Vérifier si les données existent et sont valides
  const hasData = data && data.length > 0 && data.some(item => item.revenue > 0);

  if (!hasData) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Revenus Journaliers
        </h3>
        <div className="flex h-72 w-full items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        Revenus Journaliers
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-gray-600"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickMargin={10}
              axisLine={{ stroke: '#d1d5db' }}
              className="dark:fill-gray-400"
            />
            <YAxis
              tickFormatter={(value) => `${value}€`}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              className="dark:fill-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Revenus"
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}