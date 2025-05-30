'use client'

import { useState, ChangeEvent, FormEvent, useMemo } from 'react';
import makeRequesters from "@/scripts/requests"

interface TripForm {
  leaders: string[];
  tripName: string;
  plannedDate: string;
  maxSize: string;
  class: string;
  priceOverride: string;
  sentenceDesc: string;
  blurb: string;
}

const emptyForm = {
  leaders: [''],
  tripName: '',
  plannedDate: '',
  maxSize: '',
  class: '',
  priceOverride: '',
  sentenceDesc: '',
  blurb: '',
};


export default function CreateTripForm() {
  const [form, setForm] = useState<TripForm>({ ...emptyForm });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { backendPost } = makeRequesters();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaderChange = (index: number, value: string) => {
    const updated = [...form.leaders];
    updated[index] = value;
    setForm((prev) => ({ ...prev, leaders: updated }));
  };

  const addLeader = () => {
    setForm((prev) => ({ ...prev, leaders: [...prev.leaders, ''] }));
  };

  const removeLeader = () => {
    setForm((prev) => {
      if (prev.leaders.length > 1) { return { ...prev, leaders: [...prev.leaders.slice(0,-1)] } }
      else {return prev }
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!(form.class || form.priceOverride)) {
      return setError('You must provide either a class or a price override.');
    }
    if (form.class && form.priceOverride) {
      return setError('Please provide only one: class or price override.');
    }

    const payload = {
      leaders: form.leaders.filter(email => email.trim() !== ''),
      tripName: form.tripName,
      plannedDate: new Date(form.plannedDate),
      maxSize: parseInt(form.maxSize, 10),
      class: form.class || null,
      priceOverride: form.priceOverride ? parseFloat(form.priceOverride) : null,
      sentenceDesc: form.sentenceDesc || null,
      blurb: form.blurb || null,
    };
    console.log(payload)

    try {
      await backendPost("/leader/create-trip", payload)
      setSuccess('Trip created successfully!');
      setForm({ ...emptyForm });
    } catch (err) {
      console.error(err);
      setError('Failed to create trip. Check your input and try again.');
    }
  };

  const labelStyle = "block font-semibold mb-2";
  const iptStyle = "w-full p-2 border border-boc_green rounded";
  //iptFields must at least contain type, name, and value
  function FormField({ label, iptFields }: { label: string, iptFields: React.InputHTMLAttributes<HTMLInputElement> }) {
    return (
      <div>
        <label className={labelStyle}>{label}</label>
        <input
          { ...iptFields }
          className={iptStyle}
        />
      </div>
    )
  }


  const tripNameFields = useMemo(() => ({
    name: "tripName", 
    type: "text", 
    value: form.tripName,
    required: true,
    onChange: handleChange,
  }), [form.tripName])

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 bg-boc_yellow text-[#2c3e1d] rounded-t-[5rem] font-body border-4 border-b-0 border-boc_medbrown">
      <h1 className="text-4xl font-funky mb-6 text-boc_darkgreen text-center">Create a New Trip!</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leader Emails */}
        <div>
          <label className={labelStyle}>Trip Leaders' Emails (Besides your Own!)</label>
          {form.leaders.map((email, idx) => (
            <input
              key={idx}
              type="email"
              placeholder={`leader ${idx + 1}`}
              value={email}
              onChange={(e) => handleLeaderChange(idx, e.target.value)}
              className={iptStyle + " mb-2" }
              required
            />
          ))}
          <div>
            <button type="button" onClick={addLeader} className="text-boc_darkgreen underline inline text-sm mr-4">
              + Add another leader
            </button>
            <button type="button" onClick={removeLeader} className="text-boc_darkgreen underline inline text-sm">
              - Remove a leader
            </button>
          </div>
        </div>

        {/* Trip Name */}
        <div>
          <label className={labelStyle}>Trip Name</label>
          <input
            name="tripName"
            type="text"
            value={form.tripName}
            required
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Date */}
        <div>
          <label className={labelStyle}>Planned Date</label>
          <input
            name="plannedDate"
            type="date"
            value={form.plannedDate}
            required
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Max Size */}
        <div>
          <label className={labelStyle}>Maximum Number of Participants</label>
          <input
            name="maxSize"
            type="number"
            value={form.maxSize}
            min={1}
            required
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Class or Price Override */}
        <div className="flex w-full">
          <div className="flex-grow mr-4">
            <label className={labelStyle}>Trip Class (A–J or Z)</label>
            <input
              name="class"
              type="text"
              value={form.class}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${form.priceOverride ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-boc_green'}`}
              maxLength={1}
              disabled={!!form.priceOverride}
            />
          </div>
          <div className="flex-grow">
            <label className={labelStyle}>Price Override ($)</label>
            <input
              name="priceOverride"
              type="number"
              step="0.01"
              value={form.priceOverride}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${form.class ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-boc_green'}`}
              disabled={!!form.class}
            />
          </div>
        </div>
        {/* Descriptions */}
        <div>
          <label className={labelStyle}>One-Sentence Description</label>
          <input
            name="sentenceDesc"
            type="text"
            value={form.sentenceDesc}
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Trip Blurb</label>
          <textarea
            name="blurb"
            rows={4}
            value={form.blurb}
            onChange={handleChange}
            className="w-full p-2 border border-boc_green rounded"
          />
        </div>

        {/* Feedback */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* Submit */}
        <button
          type="submit"
          className="bg-boc_darkgreen hover:bg-green-800 text-white py-2 px-4 rounded"
        >
          Create Trip
        </button>
      </form>
    </div>
  );
}