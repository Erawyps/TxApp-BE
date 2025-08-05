// Import Dependencies
import { ChartBarIcon, CurrencyEuroIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, Card } from "components/ui";

// ----------------------------------------------------------------------

const IndexReadings = forwardRef(({ register, errors, className = "" }, ref) => {
  return (
    <Card className={`p-4 sm:px-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
          Index & Taximètre
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* Tableau de bord */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-3">
            Tableau de Bord
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Km début"
              type="number"
              min="0"
              step="1"
              {...register("index.km_tableau_bord_debut")}
              error={errors?.index?.km_tableau_bord_debut?.message}
              ref={ref}
            />
            
            <Input
              label="Km fin"
              type="number"
              min="0"
              step="1"
              {...register("index.km_tableau_bord_fin")}
              error={errors?.index?.km_tableau_bord_fin?.message}
            />
          </div>
        </div>

        {/* Taximètre */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="text-green-800 dark:text-green-200 font-medium mb-3">
            Taximètre
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prise en charge début"
              type="number"
              min="0"
              step="0.01"
              {...register("index.taximetre_debut")}
              error={errors?.index?.taximetre_debut?.message}
              icon={<CurrencyEuroIcon className="h-4 w-4" />}
            />
            
            <Input
              label="Prise en charge fin"
              type="number"
              min="0"
              step="0.01"
              {...register("index.taximetre_fin")}
              error={errors?.index?.taximetre_fin?.message}
              icon={<CurrencyEuroIcon className="h-4 w-4" />}
            />
            
            <Input
              label="Km en charge"
              type="number"
              min="0"
              step="1"
              {...register("index.km_en_charge")}
              error={errors?.index?.km_en_charge?.message}
            />
            
            <Input
              label="Chutes (€)"
              type="number"
              min="0"
              step="0.01"
              {...register("index.chutes")}
              error={errors?.index?.chutes?.message}
              icon={<CurrencyEuroIcon className="h-4 w-4" />}
            />
          </div>
          
          <div className="mt-4">
            <Input
              label="Recettes totales (€)"
              type="number"
              min="0"
              step="0.01"
              {...register("index.recettes")}
              error={errors?.index?.recettes?.message}
              icon={<CurrencyEuroIcon className="h-4 w-4" />}
              className="sm:w-1/2"
            />
          </div>
        </div>
      </div>
    </Card>
  );
});

IndexReadings.displayName = "IndexReadings";

IndexReadings.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  className: PropTypes.string,
};

export { IndexReadings };