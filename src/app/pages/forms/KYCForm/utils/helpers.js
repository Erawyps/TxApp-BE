export function calcChargesTotal(charges = []) {
  return charges.reduce((sum, ch) => sum + (Number(ch?.montant) || 0), 0);
}

export function buildShift(data, courses = [], chargesTotal = 0) {
  const recettes = courses.reduce((sum, c) => sum + (Number(c?.sommes_percues) || 0), 0);
  const chargesAmount = data?.skipCharges ? 0 : chargesTotal;
  return {
    id: Date.now(),
    date: data?.date,
    chauffeur_id: Number(data?.chauffeur_id) || data?.chauffeur_id,
    vehicule_id: Number(data?.vehicule_id) || data?.vehicule_id,
    heure_debut: data?.heure_debut,
    heure_fin: data?.heure_fin || '',
    nb_courses: courses.length,
    recettes: Number(recettes),
    charges: Number(chargesAmount),
    statut: 'Planifiée'
  };
}

export function computeStats(drivers = [], vehicles = [], shifts = []) {
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d?.statut === 'Actif').length;
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v?.statut === 'En service').length;
  const todayRevenue = shifts.reduce((sum, s) => sum + (Number(s?.recettes) || 0), 0);
  return { totalDrivers, activeDrivers, totalVehicles, activeVehicles, todayRevenue };
}
