import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../hooks/useAppData';
import type { Shoe } from '../types/training';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { exportToExcel, exportToCSV, exportToJSON } from '../services/export';
import { importFromFile, importFromJSON, validateSessions } from '../services/import';
import { Download, Upload, Moon, Sun, Trash2, Plus, X, Check } from 'lucide-react';

export default function Settings() {
  const { sessions, shoes, addShoe, updateShoe, deleteShoe, settings, updateSettings, importData, clearAllData } = useAppData();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showShoeForm, setShowShoeForm] = useState(false);
  const [newShoeName, setNewShoeName] = useState('');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    try {
      exportToExcel(sessions);
      showMessage('success', 'Export Excel réussi !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'export Excel');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(sessions);
      showMessage('success', 'Export CSV réussi !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'export CSV');
    }
  };

  const handleExportJSON = () => {
    try {
      const data = {
        sessions,
        shoes,
        goals: [],
        settings,
      };
      exportToJSON(data);
      showMessage('success', 'Sauvegarde JSON réussie !');
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'export JSON');
    }
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
        const data = await importFromJSON(file);
        await importData(data);
        showMessage('success', `Import réussi ! ${data.sessions.length} séances importées`);
      } else {
        const importedSessions = await importFromFile(file);
        const { valid, errors } = validateSessions(importedSessions);

        if (errors.length > 0) {
          showMessage('error', `Erreurs d'import : ${errors.join(', ')}`);
          return;
        }

        // Add all valid sessions
        for (const session of valid) {
          await importData({ sessions: [session], shoes, goals: [], settings });
        }

        showMessage('success', `Import réussi ! ${valid.length} séances importées`);
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Erreur lors de l\'import');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllData = async () => {
    const success = await clearAllData();
    if (success) {
      setShowClearConfirm(false);
      showMessage('success', 'Toutes les données ont été effacées');
    }
  };

  const handleAddShoe = async () => {
    if (!newShoeName.trim()) return;

    const shoe: Shoe = {
      id: uuidv4(),
      name: newShoeName.trim(),
      totalKm: 0,
      active: true,
    };

    const success = await addShoe(shoe);
    if (success) {
      setNewShoeName('');
      setShowShoeForm(false);
      showMessage('success', 'Chaussure ajoutée');
    }
  };

  const handleToggleShoeActive = async (id: string, active: boolean) => {
    await updateShoe(id, { active: !active });
  };

  const handleDeleteShoe = async (id: string) => {
    if (confirm('Supprimer cette paire de chaussures ?')) {
      await deleteShoe(id);
      showMessage('success', 'Chaussure supprimée');
    }
  };

  const handleToggleDarkMode = async () => {
    await updateSettings({ darkMode: !settings.darkMode });
  };

  const handleToggleVolumeAlert = async () => {
    await updateSettings({ weeklyVolumeIncreaseAlert: !settings.weeklyVolumeIncreaseAlert });
  };

  const showMessage = (type: 'success' | 'error', message: string) => {
    setImportMessage({ type, message });
    setTimeout(() => setImportMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos données et préférences</p>
      </div>

      {/* Messages */}
      {importMessage && (
        <Card className={importMessage.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {importMessage.type === 'success' ? (
                <Check className="text-green-600 dark:text-green-400 w-5 h-5" />
              ) : (
                <X className="text-red-600 dark:text-red-400 w-5 h-5" />
              )}
              <span className={importMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {importMessage.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Mode sombre</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Basculer entre le thème clair et sombre</p>
            </div>
            <Button
              variant={settings.darkMode ? 'primary' : 'outline'}
              onClick={handleToggleDarkMode}
            >
              {settings.darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
              {settings.darkMode ? 'Sombre' : 'Clair'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Alerte augmentation volume</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avertissement si le volume hebdomadaire augmente de plus de 10%
              </p>
            </div>
            <Button
              variant={settings.weeklyVolumeIncreaseAlert ? 'primary' : 'outline'}
              onClick={handleToggleVolumeAlert}
            >
              {settings.weeklyVolumeIncreaseAlert ? 'Activé' : 'Désactivé'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle>Exporter les données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Exportez vos {sessions.length} séances d'entraînement dans différents formats
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={handleExportExcel} fullWidth>
              <Download className="w-4 h-4 mr-2" />
              Excel (.xlsx)
            </Button>
            <Button variant="outline" onClick={handleExportCSV} fullWidth>
              <Download className="w-4 h-4 mr-2" />
              CSV (.csv)
            </Button>
            <Button variant="outline" onClick={handleExportJSON} fullWidth>
              <Download className="w-4 h-4 mr-2" />
              Sauvegarde complète (.json)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle>Importer des données</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Importez des séances depuis un fichier Excel, CSV ou JSON
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} fullWidth>
            <Upload className="w-4 h-4 mr-2" />
            Choisir un fichier
          </Button>
        </CardContent>
      </Card>

      {/* Shoes Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des chaussures</CardTitle>
            {!showShoeForm && (
              <Button variant="primary" size="sm" onClick={() => setShowShoeForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showShoeForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Input
                label="Nom de la chaussure"
                value={newShoeName}
                onChange={(e) => setNewShoeName(e.target.value)}
                placeholder="Speedgoat 6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddShoe();
                  }
                }}
              />
              <div className="flex gap-2 mt-3">
                <Button variant="primary" size="sm" onClick={handleAddShoe}>
                  Enregistrer
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setShowShoeForm(false);
                  setNewShoeName('');
                }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {shoes.map((shoe) => (
              <div
                key={shoe.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className={`font-medium ${shoe.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>
                    {shoe.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {shoe.totalKm.toFixed(1)} km parcourus
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={shoe.active ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleShoeActive(shoe.id, shoe.active)}
                  >
                    {shoe.active ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteShoe(shoe.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clear All Data */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Zone de danger</CardTitle>
        </CardHeader>
        <CardContent>
          {showClearConfirm ? (
            <div className="space-y-3">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                ⚠️ Êtes-vous absolument sûr ?
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Cette action supprimera définitivement toutes vos séances, chaussures et paramètres.
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleClearAllData}>
                  Oui, tout supprimer
                </Button>
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Supprimer définitivement toutes les données de l'application
              </p>
              <Button variant="destructive" onClick={() => setShowClearConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Effacer toutes les données
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
