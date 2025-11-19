// Fix: Implement the InputForm component to gather user inputs.
import React from 'react';
import { STEEL_PROFILES, PROFILE_TYPES, MATERIAL_NAMES } from '../constants';
import { InputValues } from '../types';

interface InputFormProps {
  inputValues: InputValues;
  profileType: string;
  material: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onProfileTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMaterialChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const InputForm: React.FC<InputFormProps> = ({ inputValues, profileType, material, onInputChange, onProfileTypeChange, onMaterialChange, onSubmit }) => {
  const availableProfiles = STEEL_PROFILES[profileType] || [];
  
  return (
    <form onSubmit={onSubmit} className="bg-neutral-800 p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Vstupní parametry</h2>
      <div>
        <label htmlFor="force" className="block text-sm font-medium text-neutral-300">Síla (F) [N]</label>
        <input
          type="number"
          name="force"
          id="force"
          value={inputValues.force}
          onChange={onInputChange}
          className="mt-1 block w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="např. 1000"
          required
          min="0"
        />
      </div>
      <div>
        <label htmlFor="length" className="block text-sm font-medium text-neutral-300">Délka (L) [mm]</label>
        <input
          type="number"
          name="length"
          id="length"
          value={inputValues.length}
          onChange={onInputChange}
          className="mt-1 block w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          placeholder="např. 2000"
          required
          min="0"
        />
      </div>
       <div>
        <label htmlFor="material" className="block text-sm font-medium text-neutral-300">Materiál</label>
        <select
          name="material"
          id="material"
          value={material}
          onChange={onMaterialChange}
          className="mt-1 block w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          required
        >
          {MATERIAL_NAMES.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profileType" className="block text-sm font-medium text-neutral-300">Typ profilu</label>
          <select
            name="profileType"
            id="profileType"
            value={profileType}
            onChange={onProfileTypeChange}
            className="mt-1 block w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          >
            {PROFILE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="profile" className="block text-sm font-medium text-neutral-300">Dimenze</label>
          <select
            name="profile"
            id="profile"
            value={inputValues.profile}
            onChange={onInputChange}
            className="mt-1 block w-full bg-neutral-700 border border-neutral-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          >
            {availableProfiles.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition duration-300">
        Vypočítat
      </button>
    </form>
  );
};

export default InputForm;