'use client'

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { makeRequesters }from "@/scripts/requests"
import { startAfter } from 'firebase/firestore';

interface TripForm {
  leaders: string[];
  tripName: string;
  category: string;
  plannedDate: string;
  plannedEndDate: string;
  maxSize: string;
  class: string;
  priceOverride: string;
  sentenceDesc: string;
  blurb: string;
  image: string;
}

interface Leader {
  firstName: string,
  lastName: string, 
  email: string
}

const emptyForm = {
  leaders: [''],
  tripName: '',
  category: '',
  plannedDate: '',
  plannedEndDate: '',
  maxSize: '',
  class: '',
  priceOverride: '',
  sentenceDesc: '',
  blurb: '',
  image: '',
};

const categories = ['Hiking', 'Camping', 'Backpacking', 'Biking', 'Climbing', 'Skiing', 'Water', 'Event', 'Running', 'Exploration', 'Local', 'Special']

interface Success {
  desc: string, 
  link: string,
}

export default function CreateTripForm() {
  const [form, setForm] = useState<TripForm>({ ...emptyForm });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<Success|null>(null);
  const [availableLeaders, setAvailableLeaders] = useState<string[]>([])
  const [userEmail, setUserEmail] = useState<string|null>(null)

  const { backendGet, backendPost } = makeRequesters();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    setSuccess(null);

    if (!(form.class || form.priceOverride)) {
      return setError('You must provide either a class or a price override.');
    }
    if (form.class && form.priceOverride) {
      return setError('Please provide only one: class or price override.');
    }
    // const startDate = new Date(form.plannedDate) //MONITOR DATE USAGE!!!
    // const endDate = (form.plannedEndDate && form.plannedEndDate !== form.plannedDate ? new Date(form.plannedEndDate) : null)
    const endDate = (form.plannedEndDate && form.plannedEndDate !== form.plannedDate ? form.plannedEndDate : null)
    if (endDate && new Date(form.plannedDate) > new Date(endDate)) {
      return setError('End date must not be before start date.')
    }

    const payload = {
      leaders: form.leaders.filter(email => email.trim() !== ''),
      tripName: form.tripName,
      category: form.category,
      plannedDate: form.plannedDate,//startDate,
      plannedEndDate: endDate,
      maxSize: parseInt(form.maxSize, 10),
      class: form.class || null,
      priceOverride: form.priceOverride ? parseFloat(form.priceOverride) : null,
      sentenceDesc: form.sentenceDesc || null,
      blurb: form.blurb || null,
      image: form.image || null,
    };

    backendPost("/leader/create-trip", payload)
    .then((resp)=>{
      console.log(resp.data.id);
      setSuccess({
        desc: 'Trip created successfully!', 
        link: `/trips/view?id=${resp.data.id}`
      });
      setForm({ ...emptyForm });
    }).catch((err)=>{
      let msg;
      if (err.code == "ERR_BAD_REQUEST") {
        switch (err.response.status) {
          case 401:
            msg = 'Action unauthorized. Make sure you are logged into a leader account.'
            break;
          case 422:
            msg = 'Server-side validation failed. Check input fields for proper format.'
            break;
          default:
            msg = `Trip creation failed with error code ${err.response.status}. Alert an admin if issue persists.`
        }
      } else {
        msg = 'Request failed. Check connectivity and try again. Alert an admin if issue persists.'
      }
      console.log(err);
      setError(msg);
    })
  };

  useEffect(() => {
    if (!userEmail) {
      backendGet("/user/")
        .then((res): void => {
          setUserEmail(res.data.email)
        })
        .catch((err): void => {
          console.error(err)
          alert(`You shouldn't be seeing this! Please alert a website admin to this error. ERROR: ${err}`)
        })
    }
  }, [])

  useEffect(() => {
    if (userEmail) {
      backendGet("/leaders")
        .then((res): void => {
          setAvailableLeaders(res.data.map((obj: Leader) => obj.email).filter((email: string) => email !== userEmail))
        })
        .catch((err): void => {
          console.error(err)
        })
    }
  }, [userEmail])

  const labelStyle = "block font-semibold mb-2";
  const iptStyle = "w-full p-2 border border-boc_green rounded";

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 bg-boc_yellow text-[#2c3e1d] rounded-t-[5rem] font-body border-4 border-b-0 border-boc_medbrown">
      <h1 className="text-4xl font-funky mb-6 text-boc_darkgreen text-center">Create a New Trip!</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leader Emails */}
        <div>
          <label className={labelStyle}>Trip Leaders' Emails (Besides your Own!)</label>
          {form.leaders.map((email, idx) => {
            const usedEmails = form.leaders.filter((_, i) => i !== idx);
            const options = availableLeaders.filter(
              (e) => !usedEmails.includes(e) || e === email //Disclude your own email
            );

            return (
              <select
                key={idx}
                value={email}
                onChange={(e) => handleLeaderChange(idx, e.target.value)}
                className={`${iptStyle} mb-2`}
                required
              >
                <option value="" disabled>Select leader {idx + 1}</option>
                {options.map((leaderEmail) => (
                  <option key={leaderEmail} value={leaderEmail}>
                    {leaderEmail}
                  </option>
                ))}
              </select>
            );
          })}
          <div>
            <button type="button" onClick={addLeader} className="text-boc_darkgreen underline inline text-sm mr-4">
              + Add another leader
            </button>
            <button type="button" onClick={removeLeader} className="text-boc_darkgreen underline inline text-sm">
              - Remove a leader
            </button>
          </div>
        </div>
        {/* Category */}
        <div>
          <label className={labelStyle}>Category</label>
          <select 
            name="category"
            value={form.category}
            onChange={handleChange}
            className={iptStyle}
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {/* Trip Name */}
        <div>
          <label className={labelStyle}>Trip Name</label>
          <input
            name="tripName"
            type="text"
            value={form.tripName}
            maxLength={50}
            required
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Date */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div>
            <label className={labelStyle}>Start Date</label>
            <input
              name="plannedDate"
              type="date"
              value={form.plannedDate}
              required
              onChange={handleChange}
              className={iptStyle}
            />
          </div>
          <div>
            <label className={labelStyle}>End Date (change if multi-day)</label>
              <input
                name="plannedEndDate"
                type="date"
                value={form.plannedEndDate || form.plannedDate}
                required
                onChange={handleChange}
                className={iptStyle}
              />
          </div>
        </div>
        {/* Max Size */}
        <div>
          <label className={labelStyle}>Maximum Number of Participants</label>
          <input
            name="maxSize"
            type="number"
            value={form.maxSize}
            min={1}
            max={1000}
            required
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Class or Price Override */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div>
            <label className={labelStyle}>Trip Class (A-J or Z for free)</label>
            <input
              name="class"
              type="text"
              value={form.class}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${form.priceOverride ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-boc_green'}`}
              maxLength={1}
              pattern="[A-J, Z]{1}"
              disabled={!!form.priceOverride}
            />
          </div>
          <div>
            <label className={labelStyle}>Price Override ($)</label>
            <input
              name="priceOverride"
              type="number"
              step="0.1"
              min={0}
              max={1000}
              value={form.priceOverride}
              onChange={handleChange}
              className={`w-full border p-2 rounded ${form.class ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-boc_green'}`}
              disabled={!!form.class}
            />
          </div>
        </div>
        {/* Display Image */}
        <div>
          <label className={labelStyle}>Display Image</label>
          <input
            name="image"
            type="text"
            value={form.image}
            maxLength={512}
            onChange={handleChange}
            className={iptStyle}
          />
        </div>
        {/* Descriptions */}
        <div>
          <label className={labelStyle}>One-Sentence Description</label>
          <input
            name="sentenceDesc"
            type="text"
            value={form.sentenceDesc}
            maxLength={150}
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
        {success && <p className="text-green-600">{success.desc} View trip page <a href={success.link} className="underline">here</a>.</p>}

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