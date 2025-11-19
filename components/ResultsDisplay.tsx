// Fix: Implement the ResultsDisplay component to show calculation outputs and AI analysis.
import React from 'react';
import { CalculationResults, ChartDataPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProfileSketch from './ProfileSketch';


interface ResultsDisplayProps {
  results: CalculationResults | null;
  chartData: ChartDataPoint[];
  profileType: string;
  onExportToHtml: () => void;
}

const SummaryItem: React.FC<{ label: string, value: string, unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-2 border-b border-neutral-700 text-sm">
        <span className="text-neutral-400">{label}</span>
        <span className="font-semibold text-white">{value} <span className="text-neutral-500">{unit}</span></span>
    </div>
);

const StressSummaryItem: React.FC<{ label: string, value: string, unit: string, limit: number }> = ({ label, value, unit, limit }) => {
    const numericValue = parseFloat(value);
    const isOverLimit = numericValue > limit;
    return (
        <div className="flex justify-between items-start py-2 border-b border-neutral-700 text-sm">
            <span className="text-neutral-400">{label}</span>
            <div className="text-right">
                <span className={`font-semibold ${isOverLimit ? 'text-red-400' : 'text-white'}`}>
                    {value} {unit}
                </span>
                <div className="text-xs text-neutral-500">Limit: {limit} {unit}</div>
            </div>
        </div>
    );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, chartData, profileType, onExportToHtml }) => {
  if (!results) {
    return (
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg text-center text-neutral-400 mt-6 lg:mt-0">
        Zadejte hodnoty a klikněte na "Vypočítat" pro zobrazení výsledků.
      </div>
    );
  }
  
  const formatNumber = (num: number) => {
    if (Math.abs(num) > 1e5) return num.toExponential(2);
    return num.toLocaleString('cs-CZ', { maximumFractionDigits: 2 });
  }

  const isCompliant = results.bendingStress <= results.yieldStrength;

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg mt-6 lg:mt-0 space-y-8">
      <div id="pdf-export-area">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Souhrn výpočtu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2 border-b border-neutral-600 pb-1">Vstupní parametry</h3>
                  <div className="space-y-1">
                      <SummaryItem label="Materiál" value={results.materialName} unit="" />
                      <SummaryItem label="Profil" value={results.profileName} unit="" />
                      <SummaryItem label="Síla (F)" value={results.force.toLocaleString('cs-CZ')} unit="N" />
                      <SummaryItem label="Délka (L)" value={results.length.toLocaleString('cs-CZ')} unit="mm" />
                  </div>
              </div>
               <div>
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2 border-b border-neutral-600 pb-1">Výsledky</h3>
                  <div className={`text-sm font-semibold mb-2 p-2 rounded text-center ${isCompliant ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      Profil na ohyb {isCompliant ? 'VYHOVUJE' : 'NEVYHOVUJE'}
                  </div>
                   <div className="space-y-1">
                      <SummaryItem label="Hmotnost nosníku" value={results.beamMass.toFixed(2)} unit="kg" />
                      <SummaryItem label="Max. smyková síla (V)" value={results.shearForce.toFixed(2)} unit="N" />
                      <SummaryItem label="Max. ohybový moment (M)" value={formatNumber(results.bendingMoment / 1000)} unit="N·m" />
                      <StressSummaryItem label="Max. ohybové napětí (σ)" value={results.bendingStress.toFixed(2)} unit="MPa" limit={results.yieldStrength} />
                      <SummaryItem label="Max. průhyb (y)" value={results.deflection.toFixed(2)} unit="mm" />
                  </div>
              </div>
          </div>
          <ProfileSketch profileType={profileType} />
        </div>
        
        <div className="pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Průběhy vnitřních sil a deformace</h2>
          <div className="space-y-8">
              <div id="chart-shear">
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2 text-left">Průběh smykové síly</h3>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                          <XAxis dataKey="x" stroke="#9CA3AF" unit="mm" />
                          <YAxis stroke="#9CA3AF" unit="N" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                          <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                          <Line type="monotone" dataKey="shear" name="Smyková síla (V)" stroke="#00A4E4" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
               <div id="chart-moment">
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2 text-left">Průběh ohybového momentu</h3>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                          <XAxis dataKey="x" stroke="#9CA3AF" unit="mm" />
                          <YAxis stroke="#9CA3AF" unit="N·m" domain={[0, 'dataMax']} tickFormatter={val => formatNumber(val / 1000)} />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value: number) => `${formatNumber(value / 1000)} N·m`}/>
                          <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                          <Line type="monotone" dataKey="moment" name="Ohybový moment (M)" stroke="#FFC425" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
              <div id="chart-deflection">
                  <h3 className="text-lg font-semibold text-neutral-300 mb-2 text-left">Průběh ohybu</h3>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                          <XAxis dataKey="x" stroke="#9CA3AF" unit="mm" />
                          <YAxis stroke="#9CA3AF" unit="mm" reversed={true} />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value: number) => `${value.toFixed(3)} mm`}/>
                          <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                          <Line type="monotone" dataKey="deflection" name="Průhyb (y)" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>
      </div>


      <div className="pt-6 border-t border-neutral-700 no-print">
        <button
          onClick={onExportToHtml}
          className="w-full bg-secondary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Tisk protokolu
        </button>
      </div>

    </div>
  );
};

export default ResultsDisplay;