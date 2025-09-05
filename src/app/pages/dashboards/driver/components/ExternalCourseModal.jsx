import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, TruckIcon } from '@heroicons/react/24/outline';

export function ExternalCourseModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    provider: "",
    course_details: "",
    departure_location: "",
    arrival_location: "",
    total_amount: "",
    payment_method: "",
    billing_type: "direct", // 'direct' or 'company'
    client_name: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const externalProviders = [
    { id: "uber", label: "Uber" },
    { id: "g7", label: "G7" },
    { id: "bolt", label: "Bolt" },
    { id: "heetch", label: "Heetch" },
    { id: "other", label: "Autre" },
  ];

  const paymentMethods = [
    { id: "app", label: "Application (client)" },
    { id: "cash", label: "Espèces" },
    { id: "card", label: "Carte bancaire" },
    { id: "company", label: "Facturation entreprise" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.provider) {
      newErrors.provider = "Fournisseur requis";
    }

    if (!formData.departure_location) {
      newErrors.departure_location = "Lieu de départ requis";
    }

    if (!formData.arrival_location) {
      newErrors.arrival_location = "Lieu d'arrivée requis";
    }

    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = "Montant requis et doit être positif";
    }

    if (formData.billing_type === "company" && !formData.client_name) {
      newErrors.client_name =
        "Nom du client requis pour facturation entreprise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert external course to expense format for database storage
      const expenseData = {
        type_charge: "course_externe",
        description: `Course ${formData.provider}: ${formData.departure_location} → ${formData.arrival_location}`,
        montant: parseFloat(formData.total_amount),
        date: new Date().toISOString().split("T")[0],
        mode_paiement_id: null, // External courses don't follow normal payment methods
        justificatif: `${formData.provider} - ${formData.course_details}`,
        notes: JSON.stringify({
          provider: formData.provider,
          departure: formData.departure_location,
          arrival: formData.arrival_location,
          billing_type: formData.billing_type,
          client_name: formData.client_name,
          payment_method: formData.payment_method,
          notes: formData.notes,
        }),
      };

      await onSubmit(expenseData);
      handleClose();
    } catch (err) {
      console.error("Error creating external course:", err);
      setErrors({ submit: "Erreur lors de la création de la course externe" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      provider: "",
      course_details: "",
      departure_location: "",
      arrival_location: "",
      total_amount: "",
      payment_method: "",
      billing_type: "direct",
      client_name: "",
      notes: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center">
              <TruckIcon className="mr-2 h-6 w-6 text-indigo-500" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Course externe
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Provider Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fournisseur *
              </label>
              <select
                value={formData.provider}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, provider: e.target.value }))
                }
                className={`w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                  errors.provider ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionner un fournisseur</option>
                {externalProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
              {errors.provider && (
                <p className="mt-1 text-sm text-red-500">{errors.provider}</p>
              )}
            </div>

            {/* Course Details */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Détails de la course
              </label>
              <input
                type="text"
                value={formData.course_details}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    course_details: e.target.value,
                  }))
                }
                placeholder="Ex: Référence course, numéro de commande..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Lieu de départ *
                </label>
                <input
                  type="text"
                  value={formData.departure_location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      departure_location: e.target.value,
                    }))
                  }
                  placeholder="Ex: Wavre"
                  className={`w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                    errors.departure_location
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.departure_location && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.departure_location}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Lieu d&#39;arrivée *
                </label>
                <input
                  type="text"
                  value={formData.arrival_location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      arrival_location: e.target.value,
                    }))
                  }
                  placeholder="Ex: Chaumont"
                  className={`w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                    errors.arrival_location
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.arrival_location && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.arrival_location}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Details */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="text-md mb-4 font-medium text-blue-800">
                Détails financiers
              </h3>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Montant total (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_amount: e.target.value,
                      }))
                    }
                    placeholder="45.00"
                    className={`w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                      errors.total_amount ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.total_amount && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.total_amount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mode de paiement
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un mode</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Type de facturation
                </label>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="billing_direct"
                      name="billing_type"
                      value="direct"
                      checked={formData.billing_type === "direct"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          billing_type: e.target.value,
                        }))
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="billing_direct"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Client a payé directement le fournisseur externe
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="billing_company"
                      name="billing_type"
                      value="company"
                      checked={formData.billing_type === "company"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          billing_type: e.target.value,
                        }))
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="billing_company"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      L&#39;entreprise facturera son client et sera facturée par
                      le fournisseur externe
                    </label>
                  </div>
                </div>

                {formData.billing_type === "company" && (
                  <div className="mt-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nom du client (ex: SNCB) *
                    </label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          client_name: e.target.value,
                        }))
                      }
                      placeholder="Ex: SNCB, Brussels Airlines..."
                      className={`w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                        errors.client_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.client_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.client_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows="3"
                placeholder="Notes supplémentaires sur cette course externe..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Information:</strong> Les courses externes ne sont
                    pas affichées sur votre feuille de route personnelle, mais
                    sont importantes pour la vue administrative et la
                    facturation.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-lg bg-indigo-500 px-6 py-2 text-white transition-colors hover:bg-indigo-600 ${
                  isSubmitting ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer la course"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
