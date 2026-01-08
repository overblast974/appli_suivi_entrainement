import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../hooks/useAppData';
import type { SessionType, TrainingSession } from '../types/training';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Slider from '../components/ui/Slider';
import Button from '../components/ui/Button';
import { Check } from 'lucide-react';

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

export default function NewSession() {
  const navigate = useNavigate();
  const { addSession, shoes } = useAppData();
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: today,
    type: 'EF' as SessionType,
    distance: '',
    denivele_positif: '',
    denivele_negatif: '',
    duree: '00:00',
    sensation_rotule: 5,
    moment_gene: '',
    temps_recup: '',
    notes: '',
    chaussures: shoes[0]?.name || 'Chaussures par défaut',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const session: TrainingSession = {
      id: uuidv4(),
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
    };

    const success = await addSession(session);

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  const shoeOptions = shoes
    .filter((shoe) => shoe.active)
    .map((shoe) => ({
      value: shoe.name,
      label: `${shoe.name} (${shoe.totalKm.toFixed(1)} km)`,
    }));

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle séance</CardTitle>
        </CardHeader>
        <CardContent>
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg flex items-center gap-3">
              <Check className="text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Séance enregistrée avec succès !
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <Input
              type="date"
              label="Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            {/* Type de séance */}
            <Select
              label="Type de séance"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SessionType })}
              options={SESSION_TYPES.map((type) => ({ value: type, label: type }))}
              required
            />

            {/* Distance */}
            <Input
              type="number"
              label="Distance (km)"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              step="0.1"
              min="0"
              placeholder="18.5"
              required
            />

            {/* Dénivelé positif */}
            <Input
              type="number"
              label="Dénivelé positif D+ (m)"
              value={formData.denivele_positif}
              onChange={(e) => setFormData({ ...formData, denivele_positif: e.target.value })}
              step="1"
              min="0"
              placeholder="800"
            />

            {/* Dénivelé négatif */}
            <Input
              type="number"
              label="Dénivelé négatif D- (m)"
              value={formData.denivele_negatif}
              onChange={(e) => setFormData({ ...formData, denivele_negatif: e.target.value })}
              step="1"
              min="0"
              placeholder="750"
            />

            {/* Durée */}
            <Input
              type="time"
              label="Durée"
              value={formData.duree}
              onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
              required
            />

            {/* Sensation rotule */}
            <Slider
              label="Sensation rotule"
              value={formData.sensation_rotule}
              onChange={(e) => setFormData({ ...formData, sensation_rotule: Number(e.target.value) })}
              min={0}
              max={10}
              showValue
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3">
              0 = Aucune douleur, 10 = Douleur maximale
            </p>

            {/* Chaussures */}
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
                placeholder="Speedgoat 6"
                required
              />
            )}

            {/* Moment apparition gêne */}
            <Input
              type="text"
              label="Moment apparition gêne (optionnel)"
              value={formData.moment_gene}
              onChange={(e) => setFormData({ ...formData, moment_gene: e.target.value })}
              placeholder="Après 1h30 descente"
            />

            {/* Temps récupération */}
            <Input
              type="text"
              label="Temps récupération inflammation (optionnel)"
              value={formData.temps_recup}
              onChange={(e) => setFormData({ ...formData, temps_recup: e.target.value })}
              placeholder="24h"
            />

            {/* Notes */}
            <Textarea
              label="Notes générales (optionnel)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Bonne sortie, genou tenu..."
              rows={4}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Enregistrer la séance
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
