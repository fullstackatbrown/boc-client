"use client"

import { TripParticipant, TripWithSignup } from '@/models/models';
import { Requesters } from '@/scripts/requests';
import React, { useState } from 'react';

interface AttendanceFormProps {
  trip: TripWithSignup;
  reqs: Requesters
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ trip, reqs }) => {
  const participants: TripParticipant[] = [{
    firstName: "william",
    lastName: "Stone",
    email: "william_l_stone@brown.edu",
    status: "Selected",
    confirmed: true,
    paid: true,
  }]
  const emailOptions = ["William_l_stone@brown.edu"]
  const [selectedParticipants, setSelectedParticipants] = useState<Record<string, boolean>>({});
  const [emailInputs, setEmailInputs] = useState<string[]>(['']);
  const [filteredOptions, setFilteredOptions] = useState<string[][]>([emailOptions]);

  const handleParticipantChange = (email: string) => {
    setSelectedParticipants(prev => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  const handleEmailInputChange = (index: number, value: string) => {
    const newInputs = [...emailInputs];
    newInputs[index] = value;
    setEmailInputs(newInputs);

    const newFilteredOptions = [...filteredOptions];
    newFilteredOptions[index] = emailOptions.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(newFilteredOptions);
  };

  const handleAddEmailInput = () => {
    setEmailInputs([...emailInputs, '']);
    setFilteredOptions([...filteredOptions, emailOptions]);
  };

  const handleRemoveEmailInput = () => {
    if (emailInputs.length > 1) {
      setEmailInputs(emailInputs.slice(0, -1));
      setFilteredOptions(filteredOptions.slice(0, -1));
    }
  };

  const handleSelectEmail = (index: number, email: string) => {
    const newInputs = [...emailInputs];
    newInputs[index] = email;
    setEmailInputs(newInputs);

    const newFilteredOptions = [...filteredOptions];
    newFilteredOptions[index] = [];
    setFilteredOptions(newFilteredOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selected = participants.filter(p => selectedParticipants[p.email]);
    const emails = emailInputs.filter(e => e);

    // TODO: Implement actual submission logic
    console.log('Selected participants:', selected);
    console.log('Selected emails:', emails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Trip Participants</h3>
        <ul className="space-y-2">
          {participants.map(p => (
            <li key={p.email} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selectedParticipants[p.email]}
                onChange={() => handleParticipantChange(p.email)}
              />
              <label className="text-sm">
                {p.firstName} {p.lastName} <span className="text-gray-500">({p.email})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Emails</h3>
        {emailInputs.map((value, index) => (
          <div key={index} className="relative mb-4">
            <input
              type="text"
              value={value}
              onChange={e => handleEmailInputChange(index, e.target.value)}
              placeholder="Type to search email"
              className="w-full border rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filteredOptions[index].length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow mt-1 max-h-48 overflow-y-auto">
                {filteredOptions[index].map(option => (
                  <li
                    key={option}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                    onClick={() => handleSelectEmail(index, option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddEmailInput}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Add Email
          </button>
          <button
            type="button"
            onClick={handleRemoveEmailInput}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Remove Email
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;