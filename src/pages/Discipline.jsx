import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Trash2, Edit2, CheckCircle } from 'lucide-react';

const Discipline = () => {
  const [discipline, setDiscipline] = useState([]);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [disciplineSummary, setDisciplineSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eleves, setEleves] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedSalle, setSelectedSalle] = useState('');

  const [formData, setFormData] = useState({
    matricule: '',
    type: 'infraction',
    libelle: '',
    description: '',
    dateEvenement: new Date().toISOString().split('T')[0],
    gravite: 'moyen',
    nombreAbsences: 0,
    nombreConvocations: 0,
    punishment: ''
  });

  const [showForm, setShowForm] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [elevesRes, sallesRes, yearsRes] = await Promise.all([
        fetch('/api/eleves'),
        fetch('/api/salles'),
        fetch('/api/years')
      ]);
      
      const elevesData = await elevesRes.json();
      const sallesData = await sallesRes.json();
      const yearsData = await yearsRes.json();
      
      setEleves(elevesData);
      setSalles(sallesData);
      setAnnees(yearsData.annees || []);
      if (yearsData.annees && yearsData.annees.length > 0) {
        setSelectedAnnee(yearsData.annees[0].idAnnee);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleLoadSalleDiscipline = async () => {
    if (!selectedSalle || !selectedAnnee) {
      alert('Veuillez sélectionner une classe et une année');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/discipline/summary?idSalle=${selectedSalle}&idAnnee=${selectedAnnee}`
      );
      const data = await response.json();
      setDisciplineSummary(data);
    } catch (error) {
      console.error('Erreur chargement résumé discipline:', error);
    }
    setLoading(false);
  };

  const handleEleveSelect = async (matricule) => {
    setSelectedEleve(matricule);
    setLoading(true);
    try {
      const response = await fetch(`/api/discipline/eleve/${matricule}`);
      const data = await response.json();
      setDiscipline(data);
    } catch (error) {
      console.error('Erreur chargement discipline élève:', error);
    }
    setLoading(false);
  };

  const handleCreateDiscipline = async (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.libelle) {
      alert('Veuillez remplir les champs requis');
      return;
    }

    try {
      const response = await fetch('/api/discipline/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Problème de discipline enregistré');
        handleEleveSelect(formData.matricule);
        setFormData({
          matricule: '',
          type: 'infraction',
          libelle: '',
          description: '',
          dateEvenement: new Date().toISOString().split('T')[0],
          gravite: 'moyen',
          nombreAbsences: 0,
          nombreConvocations: 0,
          punishment: ''
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erreur création discipline:', error);
    }
  };

  const handleDeleteDiscipline = async (idDiscipline) => {
    if (!window.confirm('Confirmer la suppression?')) return;
    try {
      const response = await fetch(`/api/discipline/${idDiscipline}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Problème supprimé');
        if (selectedEleve) {
          handleEleveSelect(selectedEleve);
        }
      }
    } catch (error) {
      console.error('Erreur suppression discipline:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'absence': '📍',
      'retard': '⏰',
      'infraction': '⚠️',
      'convocation': '📋',
      'avertissement': '⛔',
      'renvoi': '🚫',
      'autre': '❓'
    };
    return icons[type] || '❓';
  };

  const getGraviteColor = (gravite) => {
    const colors = {
      'léger': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'moyen': 'bg-orange-100 text-orange-800 border-orange-300',
      'grave': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[gravite] || colors['moyen'];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🎓 Gestion de la Discipline</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Formulaire de création */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Enregistrer</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showForm ? '✕' : '+'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateDiscipline} className="space-y-3 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Élève*</label>
                  <select
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    {eleves.map((eleve) => (
                      <option key={eleve.matricule} value={eleve.matricule}>
                        {eleve.prenom} {eleve.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Type*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="absence">Absence</option>
                    <option value="retard">Retard</option>
                    <option value="infraction">Infraction</option>
                    <option value="convocation">Convocation</option>
                    <option value="avertissement">Avertissement</option>
                    <option value="renvoi">Renvoi</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Libellé*</label>
                  <input
                    type="text"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrire brièvement"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Détails..."
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Date*</label>
                  <input
                    type="date"
                    value={formData.dateEvenement}
                    onChange={(e) => setFormData({ ...formData, dateEvenement: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Gravité</label>
                  <select
                    value={formData.gravite}
                    onChange={(e) => setFormData({ ...formData, gravite: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="léger">Léger</option>
                    <option value="moyen">Moyen</option>
                    <option value="grave">Grave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Absences</label>
                    <input
                      type="number"
                      value={formData.nombreAbsences}
                      onChange={(e) => setFormData({ ...formData, nombreAbsences: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Convocations</label>
                    <input
                      type="number"
                      value={formData.nombreConvocations}
                      onChange={(e) => setFormData({ ...formData, nombreConvocations: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Punition</label>
                  <input
                    type="text"
                    value={formData.punishment}
                    onChange={(e) => setFormData({ ...formData, punishment: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2h retenue"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Enregistrer
                </button>
              </form>
            )}
          </div>

          {/* Résumé par classe */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Résumé Classe</h2>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <select
                  value={selectedSalle}
                  onChange={(e) => setSelectedSalle(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {salles.map((salle) => (
                    <option key={salle.idSalle} value={salle.idSalle}>
                      {salle.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <select
                  value={selectedAnnee}
                  onChange={(e) => setSelectedAnnee(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {annees.map((annee) => (
                    <option key={annee.idAnnee} value={annee.idAnnee}>
                      {annee.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleLoadSalleDiscipline}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Charger
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : disciplineSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune donnée</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {disciplineSummary.map((item) => (
                  <button
                    key={item.matricule}
                    onClick={() => handleEleveSelect(item.matricule)}
                    className={`w-full text-left p-3 rounded border transition ${
                      selectedEleve === item.matricule
                        ? 'bg-red-100 border-red-500'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {item.prenom} {item.nom}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Absences: {item.totalAbsences} | Convocations: {item.totalConvocations}
                    </div>
                    <div className="text-xs text-gray-600">
                      Infractions: {item.totalInfractions} | Graves: {item.gravesCount}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sélection élève */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👤 Sélectionner Élève</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {eleves.slice(0, 40).map((eleve) => (
                <button
                  key={eleve.matricule}
                  onClick={() => handleEleveSelect(eleve.matricule)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selectedEleve === eleve.matricule
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{eleve.prenom} {eleve.nom}</div>
                  <div className="text-xs text-gray-600">{eleve.classe || 'N/A'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Historique discipline élève */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Historique</h2>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : discipline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun enregistrement</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {discipline.map((item) => (
                  <div key={item.idDiscipline} className={`p-3 rounded border-l-4 ${getGraviteColor(item.gravite)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {getTypeIcon(item.type)} {item.libelle}
                        </div>
                        <div className="text-xs text-gray-700 mt-1">{item.description}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          📅 {new Date(item.dateEvenement).toLocaleDateString()}
                        </div>
                        {item.punition && (
                          <div className="text-xs text-red-700 font-semibold mt-1">
                            Punition: {item.punition}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteDiscipline(item.idDiscipline)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistiques élève */}
        {selectedEleve && discipline.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-yellow-50 p-4 rounded shadow border-l-4 border-yellow-400">
              <div className="text-sm text-gray-600">Total Absences</div>
              <div className="text-2xl font-bold text-yellow-600">
                {discipline.filter(d => d.type === 'absence').length}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded shadow border-l-4 border-orange-400">
              <div className="text-sm text-gray-600">Total Convocations</div>
              <div className="text-2xl font-bold text-orange-600">
                {discipline.filter(d => d.type === 'convocation').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded shadow border-l-4 border-red-400">
              <div className="text-sm text-gray-600">Infractions</div>
              <div className="text-2xl font-bold text-red-600">
                {discipline.filter(d => d.type === 'infraction').length}
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded shadow border-l-4 border-pink-400">
              <div className="text-sm text-gray-600">Graves</div>
              <div className="text-2xl font-bold text-pink-600">
                {discipline.filter(d => d.gravite === 'grave').length}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded shadow border-l-4 border-purple-400">
              <div className="text-sm text-gray-600">Total Problèmes</div>
              <div className="text-2xl font-bold text-purple-600">
                {discipline.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discipline;
