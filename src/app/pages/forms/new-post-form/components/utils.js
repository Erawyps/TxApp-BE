export const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  const [hours, minutes] = timeString.split(':');
  return `${hours.padStart(2, '0')}h${minutes}`;
};

export const calculateDuration = (start, end) => {
  if (!start || !end) return '--:--';
  
  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);
  
  const diff = endDate - startDate;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}`;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
};