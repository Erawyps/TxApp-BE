// Import Dependencies
import { ClockIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { forwardRef, useEffect } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, Card } from "components/ui";

// ----------------------------------------------------------------------

const ServiceHours = forwardRef(({ register, errors, watch, setValue, className = "" }, ref) => {
  const heureDebut = watch("service.heure_debut");
  const heureFin = watch("service.heure_fin");
  const interruptions = watch("service.interruptions");

  // Calculate total hours
  useEffect(() => {
    if (heureDebut && heureFin) {
      const start = new Date(`2000-01-01T${heureDebut}`);
      const end = new Date(`2000-01-01T${heureFin}`);
      let diff = end - start;
      
      // Handle interruptions
      if (interruptions) {
        const [hours, minutes] = interruptions.split(':').map(Number);
        const interruptionMs = (hours * 60 + minutes) * 60 * 1000;
        diff -= interruptionMs;
      }
      
      if (diff > 0) {
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const totalMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setValue("service.total_heures", `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`);
      } else {
        setValue("service.total_heures", "00:00");
      }
    }
  }, [heureDebut, heureFin, interruptions, setValue]);

  return (
    <Card className={`p-4 sm:px-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="size-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
          Heures de Service
        </h3>
      </div>
      
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          {...register("date")}
          error={errors?.date?.message}
          icon={<CalendarIcon className="h-4 w-4" />}
          ref={ref}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Heure de début"
            type="time"
            {...register("service.heure_debut")}
            error={errors?.service?.heure_debut?.message}
            icon={<ClockIcon className="h-4 w-4" />}
          />
          
          <Input
            label="Heure de fin"
            type="time"
            {...register("service.heure_fin")}
            error={errors?.service?.heure_fin?.message}
            icon={<ClockIcon className="h-4 w-4" />}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Interruptions"
            type="time"
            {...register("service.interruptions")}
            error={errors?.service?.interruptions?.message}
            icon={<ClockIcon className="h-4 w-4" />}
          />
          
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <span className="text-gray-900 dark:text-white font-medium">
                {watch("service.total_heures") || "00:00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

ServiceHours.displayName = "ServiceHours";

ServiceHours.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export { ServiceHours };