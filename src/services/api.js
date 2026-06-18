import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginAPI = (email, password) => API.post('/auth/login', { email, password });
export const signupAPI = (data) => API.post('/auth/signup', data);
export const getMeAPI = () => API.get('/auth/me');

// Stats
export const getStatsAPI = () => API.get('/stats/dashboard');
export const getPaiementsMensuelAPI = () => API.get('/stats/paiements-mensuel');
export const getInscriptionsMensuelAPI = () => API.get('/stats/inscriptions-mensuel');

// Messages
export const getMessageContactsAPI = () => API.get('/messages/contacts');
export const getMessagesAPI = () => API.get('/messages');
export const sendMessageAPI = (data) => API.post('/messages', data);
export const markConversationReadAPI = (data) => API.patch('/messages/read', data);
// Groups
export const getGroupsAPI = () => API.get('/messages/groups');
export const createGroupAPI = (data) => API.post('/messages/groups', data);
export const getGroupMessagesAPI = (id) => API.get(`/messages/groups/${id}/messages`);
export const sendGroupMessageAPI = (id, data) => API.post(`/messages/groups/${id}/messages`, data);

// Élèves
export const getElevesAPI = () => API.get('/eleves');
export const getEleveByIdAPI = (id) => API.get(`/eleves/${id}`);
export const createEleveAPI = (data) => API.post('/eleves', data);
export const updateEleveAPI = (id, data) => API.put(`/eleves/${id}`, data);
export const deleteEleveAPI = (id) => API.delete(`/eleves/${id}`);
export const reactivateEleveAPI = (id) => API.post(`/eleves/${id}/reactivate`);

// Classes
export const getClassesAPI = () => API.get('/classes');
export const getClassByIdAPI = (id) => API.get(`/classes/${id}`);
export const createClassAPI = (data) => API.post('/classes', data);
export const updateClassAPI = (id, data) => API.put(`/classes/${id}`, data);
export const deleteClassAPI = (id) => API.delete(`/classes/${id}`);

// Cours
export const getCoursAPI = (params) => API.get('/cours', params ? { params } : undefined);
export const createCoursAPI = (data) => API.post('/cours', data);
export const updateCoursAPI = (id, data) => API.put(`/cours/${id}`, data);
export const deleteCoursAPI = (id) => API.delete(`/cours/${id}`);

// Enseignants
export const getEnseignantsAPI = () => API.get('/enseignants');
export const getEnseignantByIdAPI = (id) => API.get(`/enseignants/${id}`);
export const createEnseignantAPI = (data) => API.post('/enseignants', data);
export const updateEnseignantAPI = (id, data) => API.put(`/enseignants/${id}`, data);
export const deleteEnseignantAPI = (id) => API.delete(`/enseignants/${id}`);
export const affecterEnseignantAPI = (id, data) => API.post(`/enseignants/${id}/affecter`, data);
export const createRapportEnseignantAPI = (id, data) => API.post(`/enseignants/${id}/rapport`, data);
export const reactivateEnseignantAPI = (id) => API.post(`/enseignants/${id}/reactiver`);

// Salles
export const getSallesAPI = () => API.get('/salles');
export const getSalleByIdAPI = (id) => API.get(`/salles/${id}`);
export const createSalleAPI = (data) => API.post('/salles', data);
export const updateSalleAPI = (id, data) => API.put(`/salles/${id}`, data);
export const deleteSalleAPI = (id) => API.delete(`/salles/${id}`);

// Parents
export const getParentsAPI = () => API.get('/parents');
export const getParentByIdAPI = (id) => API.get(`/parents/${id}`);
export const createParentAPI = (data) => API.post('/parents', data);
export const updateParentAPI = (id, data) => API.put(`/parents/${id}`, data);
export const deactivateParentAPI = (id) => API.put(`/parents/${id}/deactivate`);
export const reactivateParentAPI = (id) => API.put(`/parents/${id}/reactivate`);
export const deleteParentAPI = (id) => API.delete(`/parents/${id}`);

// Inscriptions
export const getInscriptionsAPI = () => API.get('/inscriptions');
export const getInscriptionByIdAPI = (id) => API.get(`/inscriptions/${id}`);
export const getInscriptionsByEleveAPI = (matricule) => API.get(`/inscriptions/eleve/${matricule}`);
export const createInscriptionAPI = (data) => API.post('/inscriptions', data);
export const updateInscriptionAPI = (id, data) => API.put(`/inscriptions/${id}`, data);
export const deleteInscriptionAPI = (id) => API.delete(`/inscriptions/${id}`);

// Bus & Abonnements
export const getBusAPI = () => API.get('/bus/bus');
export const createBusAPI = (data) => API.post('/bus/bus', data);
export const updateBusAPI = (id, data) => API.put(`/bus/bus/${id}`, data);
export const getAbonnementsBusAPI = () => API.get('/bus/abonnements');
export const createAbonnementBusAPI = (data) => API.post('/bus/abonnements', data);
export const updateAbonnementBusAPI = (id, data) => API.put(`/bus/abonnements/${id}`, data);
export const deleteAbonnementBusAPI = (id) => API.delete(`/bus/abonnements/${id}`);

// Années & Trimestres
export const getAnneesAPI = () => API.get('/years/annees');
export const getAnneeByIdAPI = (id) => API.get(`/years/annees/${id}`);
export const createAnneeAPI = (data) => API.post('/years/annees', data);
export const updateAnneeAPI = (id, data) => API.put(`/years/annees/${id}`, data);
export const deleteAnneeAPI = (id) => API.delete(`/years/annees/${id}`);

export const getTrimestresAPI = () => API.get('/years/trimestres');
export const getTrimestresById = (id) => API.get(`/years/trimestres/${id}`);
export const createTrimestresAPI = (data) => API.post('/years/trimestres', data);
export const updateTrimestresAPI = (id, data) => API.put(`/years/trimestres/${id}`, data);
export const deleteTrimestresAPI = (id) => API.delete(`/years/trimestres/${id}`);

// Tranches
export const getTranchesAPI = () => API.get('/tranches');
export const createTrancheAPI = (data) => API.post('/tranches', data);
export const updateTrancheAPI = (id, data) => API.put(`/tranches/${id}`, data);
export const deleteTrancheAPI = (id) => API.delete(`/tranches/${id}`);
export const getTranchesParCycleAPI = () => API.get('/tranches/par-cycle');

// Parametres: profile & password
export const getProfileAPI = () => API.get('/parametres/profile');
export const updateProfileAPI = (data) => API.put('/parametres/profile', data);
export const changePasswordAPI = (data) => API.post('/parametres/password', data);

// Payment modes
export const getPaymentModesAPI = () => API.get('/parametres/payment-modes');
export const createPaymentModeAPI = (data) => API.post('/parametres/payment-modes', data);
export const updatePaymentModeAPI = (id, data) => API.put(`/parametres/payment-modes/${id}`, data);
export const deletePaymentModeAPI = (id) => API.delete(`/parametres/payment-modes/${id}`);

// Paiements
export const getPaiementsAPI = () => API.get('/paiements');
export const getPaiementByIdAPI = (id) => API.get(`/paiements/${id}`);
export const createPaiementAPI = (data) => API.post('/paiements', data);

// Evaluations (historique notes - legacy)
export const getEvaluationsAPI = () => API.get('/evaluations');
export const createEvaluationAPI = (data) => API.post('/evaluations', data);

// Evaluations programmées (planning)
export const getEvaluationsProgrammesAPI = (params) => API.get('/evaluations-programmes', params ? { params } : undefined);
export const getEvaluationProgrammeByIdAPI = (id) => API.get(`/evaluations-programmes/${id}`);
export const createEvaluationProgrammeAPI = (data) => API.post('/evaluations-programmes', data);
export const updateEvaluationProgrammeAPI = (id, data) => API.put(`/evaluations-programmes/${id}`, data);
export const deleteEvaluationProgrammeAPI = (id) => API.delete(`/evaluations-programmes/${id}`);

// Recherche élèves pour parents
export const searchElevesAPI = (q) => API.get(`/parents/search?q=${q}`);
// Audit
export const getAuditAPI = (params) => API.get('/audit', { params });

// Emploi du temps
// Backend: route historique /api/emploi, alias /api/emploi-temps (préféré)
export const getEmploiAPI = async () => {
  try { return await API.get('/emploi-temps'); }
  catch (e) {
    if (e?.response?.status === 404) return API.get('/emploi');
    throw e;
  }
};

export const createEmploiAPI = async (data) => {
  try { return await API.post('/emploi-temps', data); }
  catch (e) {
    if (e?.response?.status === 404) return API.post('/emploi', data);
    throw e;
  }
};

export const updateEmploiAPI = async (id, data) => {
  try { return await API.put(`/emploi-temps/${id}`, data); }
  catch (e) {
    if (e?.response?.status === 404) return API.put(`/emploi/${id}`, data);
    throw e;
  }
};

export const deleteEmploiAPI = async (id) => {
  try { return await API.delete(`/emploi-temps/${id}`); }
  catch (e) {
    if (e?.response?.status === 404) return API.delete(`/emploi/${id}`);
    throw e;
  }
};

// Activate eleve
export const activateEleveAPI = (id) => API.put(`/eleves/${id}/activate`);

// Get cycles
export const getCyclesAPI = () => API.get('/classes/cycles');

// Add salle to classe
export const addSalleToClasseAPI = (idClasse, data) => API.post(`/classes/${idClasse}/salles`, data);

// Rapports
export const getRapportsElevesAPI = () => API.get('/rapports/eleves');
export const deleteRapportEleveAPI = (id) => API.delete(`/rapports/eleves/${id}`);
export const getRapportsEnseignantsAPI = () => API.get('/rapports/enseignants');
export const deleteRapportEnseignantAPI = (id) => API.delete(`/rapports/enseignants/${id}`);

export default API;
