import { Card } from "components/ui";
import { kpis } from "./data";
import { FaTaxi, FaEuroSign, FaRoad, FaUserTie, FaCarSide, FaChartLine } from "react-icons/fa6";

export default function KpiCards() {
  const cards = [
    { 
      title: "Courses Effectuées", 
      value: kpis.totalCourses, 
      icon: <FaTaxi size={24} />,
      description: "Nombre total de courses"
    },
    { 
      title: "Revenus Totaux", 
      value: `${kpis.totalRevenue.toFixed(2)} €`, 
      icon: <FaEuroSign size={24} />,
      description: "Chiffre d'affaires total"
    },
    { 
      title: "Revenu Moyen", 
      value: `${kpis.averageEarningsPerTrip.toFixed(2)} €`, 
      icon: <FaChartLine size={24} />,
      description: "Par course"
    },
    { 
      title: "Chauffeurs Actifs", 
      value: kpis.chauffeursActifs, 
      icon: <FaUserTie size={24} />,
      description: "Nombre de chauffeurs ayant effectué des courses"
    },
    { 
      title: "Distance Totale", 
      value: `${kpis.totalDistance.toFixed(1)} km`, 
      icon: <FaRoad size={24} />,
      description: "Kilomètres parcourus"
    },
    { 
      title: "Distance Moyenne", 
      value: `${kpis.averageDistancePerTrip.toFixed(1)} km`, 
      icon: <FaCarSide size={24} />,
      description: "Par course"
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <Card key={index} className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-primary-500/10 p-3 text-primary-600 dark:bg-primary-400/20 dark:text-primary-300">
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-dark-300">{card.title}</p>
              <p className="text-lg font-bold text-gray-800 dark:text-dark-100">{card.value}</p>
              <p className="text-xs text-gray-400 dark:text-dark-400">{card.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}