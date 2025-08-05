// Import Dependencies
import { UserIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, Card } from "components/ui";

// ----------------------------------------------------------------------

const DriverInfo = forwardRef(({ register, errors, className = "" }, ref) => {
  return (
    <Card className={`p-4 sm:px-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <UserIcon className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
          Informations Chauffeur
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom"
            placeholder="Nom du chauffeur"
            {...register("chauffeur.nom")}
            error={errors?.chauffeur?.nom?.message}
            icon={<UserIcon className="h-4 w-4" />}
            ref={ref}
          />
          
          <Input
            label="Prénom"
            placeholder="Prénom du chauffeur"
            {...register("chauffeur.prenom")}
            error={errors?.chauffeur?.prenom?.message}
            icon={<UserIcon className="h-4 w-4" />}
          />
        </div>
        
        <Input
          label="Numéro de badge"
          placeholder="TX-2023-001"
          {...register("chauffeur.numero_badge")}
          error={errors?.chauffeur?.numero_badge?.message}
          icon={<IdentificationIcon className="h-4 w-4" />}
        />
      </div>
    </Card>
  );
});

DriverInfo.displayName = "DriverInfo";

DriverInfo.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  className: PropTypes.string,
};

export { DriverInfo };