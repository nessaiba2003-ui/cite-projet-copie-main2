import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import evenementService from '@/services/evenementService';
import { cn } from '@/utils/helpers';

const step1Schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(8, 'Téléphone requis').optional().or(z.literal('')),
});

const step2Schema = z.object({
  etablissement: z.string().min(2, 'Établissement requis'),
  filiere: z.string().optional(),
  niveau: z.string().optional(),
});

const STEPS = ['Identité', 'Parcours', 'Confirmation'];

export default function InscriptionPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    etablissement: '',
    filiere: '',
    niveau: '',
  });

  useEffect(() => {
    evenementService
      .getById(id)
      .then(setEvent)
      .catch(() => toast.error('Événement introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validateStep = () => {
    const schema = step === 0 ? step1Schema : step2Schema;
    const data =
      step === 0
        ? { nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone }
        : { etablissement: form.etablissement, filiere: form.filiere, niveau: form.niveau };
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      await evenementService.inscrire(Number(id), {
        evenementId: Number(id),
        ...form,
        source: 'WEB',
      });
      toast.success('Inscription confirmée !');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Chargement…" />;
  if (!event) {
    return (
      <div className="relative w-full min-h-screen bg-[#F5F7FA]">
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <p className="text-sm text-stone-600">Événement introuvable.</p>
          <Link to="/evenements" className="mt-3 inline-block">
            <Button variant="outline">Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#F5F7FA] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-16 -left-24 h-72 w-72 rounded-full bg-[#5BBFA0]/10 blur-3xl animate-aurora-slow" />
        <div className="absolute bottom-16 -right-24 h-72 w-72 rounded-full bg-[#E07A5F]/10 blur-3xl animate-aurora" />
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-8 sm:px-6">
        <Link
          to={`/evenements/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#E07A5F] hover:text-[#C96A50] hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à l&apos;événement
        </Link>

        <div className="mb-1.5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E07A5F] to-[#F2CC8F] shadow-md shadow-[#E07A5F]/30">
            <UserPlus className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-display text-lg sm:text-xl font-extrabold text-stone-900">
            Inscription
          </h1>
        </div>
        <p className="text-xs text-stone-600 mb-6">{event.titre}</p>

        {/* Stepper */}
        <div className="relative mb-7">
          <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-stone-200 rounded-full" />
          <div
            className="absolute top-4 left-[10%] h-[2px] rounded-full transition-all duration-500"
            style={{
              width: `${(step / (STEPS.length - 1)) * 80}%`,
              background: 'linear-gradient(90deg, #E07A5F, #5BBFA0)',
            }}
          />
          <ol className="relative flex justify-between">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={cn(
                  'flex flex-1 flex-col items-center text-[10px] font-semibold sm:text-xs transition-colors',
                  i === step ? 'text-[#C96A50]' : i < step ? 'text-[#4AA88D]' : 'text-stone-400',
                )}
              >
                <span
                  className={cn(
                    'mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-all',
                    i < step && 'border-[#5BBFA0] bg-gradient-to-br from-[#5BBFA0] to-[#7DD4B8] text-white shadow-md shadow-[#5BBFA0]/30',
                    i === step && 'border-[#E07A5F] bg-gradient-to-br from-[#E07A5F] to-[#E8956F] text-white shadow-md shadow-[#E07A5F]/30',
                    i > step && 'border-stone-300 text-stone-400',
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white transition-all duration-300"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(224, 122, 95, 0.20)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="h-1 bg-gradient-to-r from-[#E07A5F] via-[#F2CC8F] to-[#5BBFA0]" />
          <div className="px-4 py-3 border-b border-stone-200">
            <h2 className="font-display text-sm font-bold text-stone-900">{STEPS[step]}</h2>
          </div>
          <div className="p-4">
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Nom" name="nom" value={form.nom} onChange={handleChange} error={errors.nom} required />
                <Input label="Prénom" name="prenom" value={form.prenom} onChange={handleChange} error={errors.prenom} required />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required containerClassName="sm:col-span-2" />
                <Input label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} error={errors.telephone} containerClassName="sm:col-span-2" />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <Input label="Établissement" name="etablissement" value={form.etablissement} onChange={handleChange} error={errors.etablissement} required />
                <Input label="Filière" name="filiere" value={form.filiere} onChange={handleChange} />
                <Input label="Niveau" name="niveau" value={form.niveau} onChange={handleChange} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="rounded-xl bg-gradient-to-br from-[#E8F5EF] to-[#F0FAF5] border border-[#5BBFA0]/30 p-4 text-xs text-stone-700 space-y-1.5">
                  <p><strong>Nom :</strong> {form.prenom} {form.nom}</p>
                  <p><strong>Email :</strong> {form.email}</p>
                  <p><strong>Établissement :</strong> {form.etablissement}</p>
                </div>
                <div className="flex items-start gap-2.5 rounded-xl bg-[#E8F5EF] border border-[#5BBFA0]/40 p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5BBFA0] text-white shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs font-semibold text-[#3D8B74]">
                    Votre inscription a été enregistrée. Un email de confirmation vous sera envoyé.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between gap-2">
              {step > 0 && step < 2 && (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 hover:border-stone-400 hover:shadow-md transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Précédent
                </button>
              )}
              <div className="ml-auto flex gap-2">
                {step < 1 && (
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#E07A5F]/30 hover:shadow-lg hover:shadow-[#E07A5F]/45 hover:-translate-y-0.5 transition-all"
                  >
                    Suivant
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                {step === 1 && (
                  <Button
                    onClick={() => validateStep() && submit()}
                    loading={submitting}
                    className="bg-gradient-to-r from-[#5BBFA0] to-[#7DD4B8] hover:from-[#4AA88D] hover:to-[#5BBFA0] text-white border-transparent shadow-md shadow-[#5BBFA0]/30 rounded-full"
                  >
                    Confirmer
                  </Button>
                )}
                {step === 2 && (
                  <Link to="/evenements">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#E8956F] px-5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#E07A5F]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Voir les événements
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}