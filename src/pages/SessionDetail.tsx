import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import type { SessionType } from '../types/training';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Slider from '../components/ui/Slider';
import Button from '../components/ui/Button';
import { ArrowLeft, Edit2, Save, Trash2, X } from 'lucide-react';

const SESSION_TYPES: SessionType[] = [
  'EF',
  'VMA',
  'Tempo',
  'Sortie longue',
  'Renfo général',
  'Renfo prévention genou',
  'Côtes/Descente',
  'Récup',
];

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSession, updateSession, deleteSession, shoes } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const session = id ? getSession(id) : null;

  const [formData, setFormData] = useState({
    date: '',
    type: 'EF' as SessionType,
    distance: '',
    denivele_positif: '',
    denivele_negatif: '',
    duree: '00:00',
    sensation_rotule: 5,
    moment_gene: '',
    temps_recup: '',
    notes: '',
    chaussures: '',
  });

  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date,
        type: session.type,
        distance: session.distance.toString(),
        denivele_positif: session.denivele_positif.toString(),
        denivele_negatif: session.denivele_negatif.toString(),
        duree: session.duree,
        sensation_rotule: session.sensation_rotule,
        moment_gene: session.moment_gene || '',
        temps_recup: session.temps_recup || '',
        notes: session.notes || '',
        chaussures: session.chaussures,
      });
    }
  }, [session]);

  if (!session || !id) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Séance introuvable</p>
          <Button onClick={() => navigate('/history')}>Retour à l'historique</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const success = await updateSession(id, {
      date: formData.date,
      type: formData.type,
      distance: Number(formData.distance) || 0,
      denivele_positif: Number(formData.denivele_positif) || 0,
      denivele_negatif: Number(formData.denivele_negatif) || 0,
      duree: formData.duree,
      sensation_rotule: formData.sensation_rotule,
      moment_gene: formData.moment_gene || undefined,
      temps_recup: formData.temps_recup || undefined,
      notes: formData.notes || undefined,
      chaussures: formData.chaussures,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteSession(id);
    if (success) {
      navigate('/history');
    }
  };

  const shoeOptions = shoes
    .filter((shoe) => shoe.active)
    .map((shoe) => ({
      value: shoe.name,
      label: `${shoe.name} (${shoe.totalKm.toFixed(1)} km)`,
    }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-3">
              Êtes-vous sûr de vouloir supprimer cette séance ?
            </p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleDelete}>
                Oui, supprimer
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Modifier la séance' : 'Détail de la séance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              <Select
                label="Type de séance"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
                options={SESSION_TYPES.map((type) => ({ value: type, label: type }))}
                required
              />

              <Input
                type="number"
                label="Distance (km)"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                step="0.1"
                min="0"
                required
              />

              <Input
                type="number"
                label="Dénivelé positif D+ (m)"
                value={formData.denivele_positif}
                onChange={(e) => setFormData({ ...formData, denivele_positif: e.target.value })}
                step="1"
                min="0"
              />

              <Input
                type="number"
                label="Dénivelé négatif D- (m)"
                value={formData.denivele_negatif}
                onChange={(e) => setFormData({ ...formData, denivele_negatif: e.target.value })}
                step="1"
                min="0"
              />

              <Input
                type="time"
                label="Durée"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                required
              />

              <Slider
                label="Sensation rotule"
                value={formData.sensation_rotule}
                onChange={(e) => setFormData({ ...formData, sensation_rotule: Number(e.target.value) })}
                min={0}
                max={10}
                showValue
                required
              />

              {shoeOptions.length > 0 ? (
                <Select
                  label="Chaussures utilisées"
                  value={formData.chaussures}
                  onChange={(e) => setFormData({ ...formData, chaussures: e.target.value })}
                  options={shoeOptions}
                  required
                />
              ) : (
                <Input
                  type="text"
                  label="Chaussures utilisées"
                  value={formData.chaussures}
                  onChange={(e) => setFormData({ ...formData, chaussures: e.target.value })}
                  required
                />
              )}

              <Input
                type="text"
                label="Moment apparition gêne (optionnel)"
                value={formData.moment_gene}
                onChange={(e) => setFormData({ ...formData, moment_gene: e.target.value })}
              />

              <Input
                type="text"
                label="Temps récupération inflammation (optionnel)"
                value={formData.temps_recup}
                onChange={(e) => setFormData({ ...formData, temps_recup: e.target.value })}
              />

              <Textarea
                label="Notes générales (optionnel)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(session.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.distance} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.duree}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dénivelé positif (D+)</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.denivele_positif} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dénivelé négatif (D-)</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.denivele_negatif} m</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sensation rotule</p>
                <p className="font-medium text-red-600 dark:text-red-400 text-lg">
                  {session.sensation_rotule}/10
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chaussures</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{session.chaussures}</p>
              </div>

              {session.moment_gene && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moment apparition gêne</p>
                  <p className="font-medium text-orange-600 dark:text-orange-400">{session.moment_gene}</p>
                </div>
              )}

              {session.temps_recup && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temps récupération</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{session.temps_recup}</p>
                </div>
              )}

              {session.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{session.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
