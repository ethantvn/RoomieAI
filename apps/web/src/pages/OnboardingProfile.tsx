import { useState } from 'react';
import api from '@/lib/api';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(16).max(100),
  major: z.string().min(1),
  yearInSchool: z.enum(['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRAD']),
  sleepSchedule: z.enum(['EARLY', 'NORMAL', 'LATE']),
  cleanliness: z.number().int().min(1).max(5),
  noiseTolerance: z.number().int().min(1).max(5),
  studyHabits: z.enum(['LIBRARY', 'ROOM', 'MIX']),
  guests: z.enum(['RARE', 'SOMETIMES', 'OFTEN']),
  p_introvertExtrovert: z.number().int().min(1).max(5),
  p_structureSpontaneity: z.number().int().min(1).max(5),
  p_morningNight: z.number().int().min(1).max(5),
  smoking: z.boolean(),
  petsOk: z.boolean(),
  petAllergies: z.boolean(),
  specialRequests: z.string().optional()
});

type Form = z.infer<typeof schema>;

export default function OnboardingProfile() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Form>({
    name: '',
    age: 18,
    major: '',
    yearInSchool: 'FRESHMAN',
    sleepSchedule: 'NORMAL',
    cleanliness: 3,
    noiseTolerance: 3,
    studyHabits: 'MIX',
    guests: 'SOMETIMES',
    p_introvertExtrovert: 3,
    p_structureSpontaneity: 3,
    p_morningNight: 3,
    smoking: false,
    petsOk: true,
    petAllergies: false,
    specialRequests: ''
  });

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const save = async () => {
    setError('');
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError('Please complete all fields correctly');
      return;
    }
    try {
      await api.put('/api/v1/me', {
        name: form.name,
        age: form.age,
        major: form.major,
        yearInSchool: form.yearInSchool
      });
      await api.put('/api/v1/me/profile', {
        sleepSchedule: form.sleepSchedule,
        cleanliness: form.cleanliness,
        noiseTolerance: form.noiseTolerance,
        studyHabits: form.studyHabits,
        guests: form.guests,
        p_introvertExtrovert: form.p_introvertExtrovert,
        p_structureSpontaneity: form.p_structureSpontaneity,
        p_morningNight: form.p_morningNight,
        smoking: form.smoking,
        petsOk: form.petsOk,
        petAllergies: form.petAllergies,
        specialRequests: form.specialRequests
      });
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Complete your profile</h1>
        <div className="text-sm text-gray-500">Step {step} of 3</div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input className="input mt-1" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Major</label>
              <input className="input mt-1" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
            </div>
            <div>
              <label className="label">Year in School</label>
              <select className="input mt-1" value={form.yearInSchool} onChange={(e) => setForm({ ...form, yearInSchool: e.target.value as any })}>
                <option>FRESHMAN</option>
                <option>SOPHOMORE</option>
                <option>JUNIOR</option>
                <option>SENIOR</option>
                <option>GRAD</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn" onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Sleep schedule</label>
              <select className="input mt-1" value={form.sleepSchedule} onChange={(e) => setForm({ ...form, sleepSchedule: e.target.value as any })}>
                <option>EARLY</option>
                <option>NORMAL</option>
                <option>LATE</option>
              </select>
            </div>
            <div>
              <label className="label">Cleanliness (1-5)</label>
              <input className="input mt-1" type="number" min={1} max={5} value={form.cleanliness} onChange={(e) => setForm({ ...form, cleanliness: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Noise tolerance (1-5)</label>
              <input className="input mt-1" type="number" min={1} max={5} value={form.noiseTolerance} onChange={(e) => setForm({ ...form, noiseTolerance: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Study habits</label>
              <select className="input mt-1" value={form.studyHabits} onChange={(e) => setForm({ ...form, studyHabits: e.target.value as any })}>
                <option>LIBRARY</option>
                <option>ROOM</option>
                <option>MIX</option>
              </select>
            </div>
            <div>
              <label className="label">Guests</label>
              <select className="input mt-1" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value as any })}>
                <option>RARE</option>
                <option>SOMETIMES</option>
                <option>OFTEN</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn" onClick={prev}>Back</button>
            <button className="btn" onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Introvert / Extrovert (1-5)</label>
              <input className="input mt-1" type="number" min={1} max={5} value={form.p_introvertExtrovert} onChange={(e) => setForm({ ...form, p_introvertExtrovert: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Structure / Spontaneity (1-5)</label>
              <input className="input mt-1" type="number" min={1} max={5} value={form.p_structureSpontaneity} onChange={(e) => setForm({ ...form, p_structureSpontaneity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Morning / Night (1-5)</label>
              <input className="input mt-1" type="number" min={1} max={5} value={form.p_morningNight} onChange={(e) => setForm({ ...form, p_morningNight: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input id="smoking" type="checkbox" checked={form.smoking} onChange={(e) => setForm({ ...form, smoking: e.target.checked })} />
              <label htmlFor="smoking">I smoke</label>
            </div>
            <div className="flex items-center gap-2">
              <input id="petsOk" type="checkbox" checked={form.petsOk} onChange={(e) => setForm({ ...form, petsOk: e.target.checked })} />
              <label htmlFor="petsOk">Pets are OK</label>
            </div>
            <div className="flex items-center gap-2">
              <input id="petAllergies" type="checkbox" checked={form.petAllergies} onChange={(e) => setForm({ ...form, petAllergies: e.target.checked })} />
              <label htmlFor="petAllergies">I have pet allergies</label>
            </div>
          </div>
          <div>
            <label className="label">Special requests</label>
            <textarea className="input mt-1" rows={3} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} />
          </div>
          <div className="flex justify-between">
            <button className="btn" onClick={prev}>Back</button>
            <button className="btn" onClick={save}>Finish</button>
          </div>
        </div>
      )}
    </div>
  );
}

