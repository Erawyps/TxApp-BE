import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export function SummaryAccordion({ recettes, charges, salaire }) {
  return (
    <div className="space-y-3">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex justify-between w-full p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">Recettes</span>
              <div className="flex items-center">
                <span className="mr-2 font-bold">{recettes.toFixed(2)} €</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'transform rotate-180' : ''}`} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="p-3 bg-gray-50 rounded-b-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Courses</span>
                  <span>{recettes.toFixed(2)} €</span>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex justify-between w-full p-3 bg-gray-100 rounded-lg">
              <span className="font-medium">Charges</span>
              <div className="flex items-center">
                <span className="mr-2 font-bold">{charges.toFixed(2)} €</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'transform rotate-180' : ''}`} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="p-3 bg-gray-50 rounded-b-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Carburant</span>
                  <span>0.00 €</span>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex justify-between w-full p-3 bg-primary-100 rounded-lg">
              <span className="font-medium text-primary-800">Salaire Chauffeur</span>
              <div className="flex items-center">
                <span className="mr-2 font-bold text-primary-900">{salaire.toFixed(2)} €</span>
                <ChevronDownIcon className={`h-5 w-5 text-primary-600 transition-transform ${open ? 'transform rotate-180' : ''}`} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="p-3 bg-primary-50 rounded-b-lg">
              <div className="text-sm space-y-2 text-primary-700">
                <div className="flex justify-between">
                  <span>Base (≤ 180€)</span>
                  <span>{(Math.min(recettes, 180) * 0.4).toFixed(2)} €</span>
                </div>
                {recettes > 180 && (
                  <div className="flex justify-between">
                    <span>Surplus (&gt; 180€)</span>
                    <span>{((recettes - 180) * 0.3).toFixed(2)} €</span>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}