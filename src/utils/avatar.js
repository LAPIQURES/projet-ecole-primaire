// Fonction pour générer avatar avec initiales
export function getInitials(prenom, nom) {
  const p = (prenom || '').charAt(0).toUpperCase();
  const n = (nom || '').charAt(0).toUpperCase();
  return p + n || '?';
}

// Fonction pour avatar avec fallback
export function getAvatarStyle(photoURL, prenom, nom) {
  if (photoURL && photoURL.trim()) {
    return { backgroundImage: `url(${photoURL})`, backgroundSize: 'cover' };
  }
  return {
    background: 'linear-gradient(135deg, #0062ff, #ffa000)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px'
  };
}
