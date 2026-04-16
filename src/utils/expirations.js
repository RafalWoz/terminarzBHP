export function calculateTrainingExpiration(date, type, subtype) {
  const d = new Date(date);

  if (type === 'wstepne_ogolne' || type === 'wstepne_stanowiskowe') {
    return null;
  }

  if (type === 'okresowe') {
    switch (subtype) {
      case 'robotniczy':
        d.setFullYear(d.getFullYear() + 3);
        break;
      case 'administracyjno_biurowy':
        d.setFullYear(d.getFullYear() + 6);
        break;
      case 'kierujacy':
      case 'pracodawca':
      case 'inzynieryjno_techniczny':
        d.setFullYear(d.getFullYear() + 5);
        break;
      default:
        d.setFullYear(d.getFullYear() + 5);
    }
    return d.toISOString();
  }
  return null;
}

export function calculateMedicalExpiration(date, customExpiration = null) {
  if (customExpiration) return new Date(customExpiration).toISOString();
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export function getExpirationStatus(expiresAt) {
  if (!expiresAt) return 'none';
  const now = new Date();
  const expires = new Date(expiresAt);
  const days = Math.floor((expires - now) / (1000 * 60 * 60 * 24));

  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'ok';
}

export function getDaysUntilExpiration(expiresAt) {
  if (!expiresAt) return null;
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.floor((expires - now) / (1000 * 60 * 60 * 24));
}

export function formatDaysMessage(days) {
  if (days === null) return 'brak terminu';
  if (days < 0) return `${Math.abs(days)} dni temu`;
  if (days === 0) return 'dzisiaj';
  if (days === 1) return 'jutro';
  return `za ${days} dni`;
}
