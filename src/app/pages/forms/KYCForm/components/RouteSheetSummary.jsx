export function RouteSheetSummary({ formData }) {
    const calculateTotal = (courses) => {
      return courses.reduce((sum, course) => sum + parseFloat(course.sommePercue || 0), 0);
    };
  
    const calculateDistance = (courses) => {
      if (courses.length === 0) return 0;
      return courses[courses.length - 1].indexArrivee - formData.vehicleInfo.taximetre.indexKmDebut;
    };
  
    return (
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 text-lg font-medium">Récapitulatif</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h5 className="font-medium">Véhicule</h5>
            <p>{formData.vehicleInfo.vehicle.plaqueImmatriculation}</p>
            <p>{formData.vehicleInfo.vehicle.numeroIdentification}</p>
          </div>
  
          <div>
            <h5 className="font-medium">Service</h5>
            <p>Date: {new Date(formData.vehicleInfo.service.date).toLocaleDateString()}</p>
            <p>Heure: {formData.vehicleInfo.service.heureDebut} - {formData.vehicleInfo.service.heureFin}</p>
          </div>
        </div>
  
        <div className="mt-6">
          <h5 className="font-medium">Courses</h5>
          <div className="mt-2 space-y-2">
            {formData.coursesList.courses.map((course, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <div>
                  <p>{course.lieuEmbarquement} → {course.lieuDebarquement}</p>
                  <p className="text-sm text-gray-600">{course.heureEmbarquement} - {course.heureDebarquement}</p>
                </div>
                <div className="text-right">
                  <p>{course.sommePercue} €</p>
                  <p className="text-sm capitalize">{course.modePaiement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded bg-gray-50 p-3 dark:bg-dark-700">
            <p className="text-sm">Total courses</p>
            <p className="text-xl font-semibold">
              {calculateTotal(formData.coursesList.courses).toFixed(2)} €
            </p>
          </div>
  
          <div className="rounded bg-gray-50 p-3 dark:bg-dark-700">
            <p className="text-sm">Distance totale</p>
            <p className="text-xl font-semibold">
              {calculateDistance(formData.coursesList.courses)} km
            </p>
          </div>
  
          <div className="rounded bg-gray-50 p-3 dark:bg-dark-700">
            <p className="text-sm">Charges</p>
            <p className="text-xl font-semibold">
              {formData.vehicleInfo.charges.reduce((sum, charge) => sum + parseFloat(charge.montant || 0), 0).toFixed(2)} €
            </p>
          </div>
        </div>
      </div>
    );
  }