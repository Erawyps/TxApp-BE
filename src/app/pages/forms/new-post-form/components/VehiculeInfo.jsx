// Import Dependencies
import { TruckIcon, HashtagIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, Card } from "components/ui";

// ----------------------------------------------------------------------

const VehicleInfo = forwardRef(({ register, errors, className = "" }, ref) => {
  return (
    <Card className={`p-4 sm:px-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
          Informations Véhicule
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plaque d'immatriculation"
            placeholder="TX-AA-171"
            {...register("vehicule.plaque_immatriculation")}
            error={errors?.vehicule?.plaque_immatriculation?.message}
            icon={<TruckIcon className="h-4 w-4" />}
            ref={ref}
          />
          
          <Input
            label="Numéro d'identification"
            placeholder="10"
            {...register("vehicule.numero_identification")}
            error={errors?.vehicule?.numero_identification?.message}
            icon={<HashtagIcon className="h-4 w-4" />}
          />
        </div>
      </div>
    </Card>
  );
});

VehicleInfo.displayName = "VehicleInfo";

VehicleInfo.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  className: PropTypes.string,
};

export { VehicleInfo };