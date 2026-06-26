import { useState } from 'react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import evenementService from '@/services/evenementService';

const schema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  prenom: z.string().min(2, 'Prénom requis (min. 2 caractères)'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  etablissement: z.string().optional(),
  filiere: z.string().optional(),
  niveau: z.string().optional(),
});

const initial = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  etablissement: '',
  filiere: '',
  niveau: '',
};

export default function InscriptionForm({ evenementId, onSuccess }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0];
        if (key) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await evenementService.inscrire(evenementId, {
        evenementId,
        ...result.data,
        source: 'WEB',
      });
      toast.success('Inscription enregistrée avec succès !');
      setForm(initial);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible d'enregistrer l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nom" name="nom" value={form.nom} onChange={handleChange} error={errors.nom} required />
        <Input label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} error={errors.prenom} required />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          containerClassName="sm:col-span-2"
        />
        <Input label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} error={errors.telephone} />
        <Input label="Établissement" name="etablissement" value={form.etablissement} onChange={handleChange} />
        <Input label="Filière" name="filiere" value={form.filiere} onChange={handleChange} />
        <Input label="Niveau" name="niveau" value={form.niveau} onChange={handleChange} containerClassName="sm:col-span-2" />
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full sm:w-auto bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white border-transparent"
      >
        Confirmer l&apos;inscription
      </Button>
    </form>
  );
}
