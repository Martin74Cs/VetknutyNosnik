// Fix: Implement the main App component, including state management, calculation logic, and Gemini API integration.
import React, { useState, useRef } from 'react';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import FormulasModal from './components/FormulasModal';
import { InputValues, CalculationResults, ChartDataPoint } from './types';
import { STEEL_PROFILES, PROFILE_TYPES, MATERIALS, MATERIAL_NAMES } from './constants';

const App: React.FC = () => {
  const [profileType, setProfileType] = useState<string>(PROFILE_TYPES[0]);
  const [material, setMaterial] = useState<string>(MATERIAL_NAMES[0]);
  const [inputValues, setInputValues] = useState<InputValues>({
    force: '1000',
    length: '1000',
    profile: STEEL_PROFILES[PROFILE_TYPES[0]][0].name,
  });
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formulasModalRef = useRef<HTMLDialogElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaterial(e.target.value);
  };

  const handleProfileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setProfileType(newType);
    // Reset profile selection to the first available for the new type
    setInputValues(prev => ({
      ...prev,
      profile: STEEL_PROFILES[newType][0].name,
    }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const F = parseFloat(inputValues.force);
    const L = parseFloat(inputValues.length);
    const selectedProfile = STEEL_PROFILES[profileType]?.find(p => p.name === inputValues.profile);
    const selectedMaterial = MATERIALS[material];

    if (isNaN(F) || isNaN(L) || !selectedProfile || !selectedMaterial || F < 0 || L < 0) {
      alert("Zadejte prosím platné, nezáporné číselné hodnoty.");
      return;
    }

    const { Wx, Ix, weight } = selectedProfile;
    const { E, yieldStrength, name: materialName } = selectedMaterial;
    
    // Calculations based on formulas from FormulasModal
    const shearForce = F; // V_max = F
    const bendingMoment = F * L; // M_max = F * L [N*mm]
    const bendingStress = bendingMoment / Wx; // sigma_max = M_max / Wx
    const deflection = (F * L ** 3) / (3 * E * Ix); // y_max = (F * L^3) / (3 * E * Ix)
    const beamMass = weight * (L / 1000); // mass [kg] = weight [kg/m] * length [m]

    setResults({
      shearForce,
      bendingMoment,
      bendingStress,
      deflection,
      profileName: selectedProfile.name,
      beamMass,
      force: F,
      length: L,
      materialName,
      yieldStrength,
    });
    
    // Generate data for charts
    const points: ChartDataPoint[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const x = (L / steps) * i;
        points.push({
            x: parseFloat(x.toFixed(2)),
            shear: F,
            moment: F * (L - x),
            deflection: (F * x ** 2 * (3 * L - x)) / (6 * E * Ix),
        });
    }
    setChartData(points);
  };

  const handleExportToHtml = () => {
    if (!results) return;

    const getProfileSketchSvg = (type: string) => {
        const svgWrapper = (viewBox: string, path: string) => `<svg viewBox="${viewBox}" width="96" height="96" stroke="black" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
        switch (type) {
            case 'IPE': return svgWrapper("0 0 100 120", '<path d="M10,10 H90 M10,110 H90 M50,10 V110" />');
            case 'HEA': return svgWrapper("0 0 120 120", '<path d="M10,10 H110 M10,110 H110 M60,10 V110" />');
            case 'L': return svgWrapper("0 0 100 100", '<path d="M10,10 V90 H90" />');
            case 'UPN': return svgWrapper("0 0 100 120", '<path d="M10,10 H80 L90,20 M10,110 H80 L90,100 M10,10 V110" />');
            case 'UPE': return svgWrapper("0 0 100 120", '<path d="M10,10 H90 M10,110 H90 M10,10 V110" />');
            case 'T': return svgWrapper("0 0 120 100", '<path d="M10,10 H110 M60,10 V90" />');
            default: return '';
        }
    };

    const shearChartHtml = document.querySelector('#chart-shear .recharts-wrapper')?.outerHTML || 'Graf smykové síly se nepodařilo načíst.';
    const momentChartHtml = document.querySelector('#chart-moment .recharts-wrapper')?.outerHTML || 'Graf ohybového momentu se nepodařilo načíst.';
    const deflectionChartHtml = document.querySelector('#chart-deflection .recharts-wrapper')?.outerHTML || 'Graf průhybu se nepodařilo načíst.';

    const isCompliant = results.bendingStress <= results.yieldStrength;
    const compliantText = isCompliant ? 'VYHOVUJE' : 'NEVYHOVUJE';
    const compliantColor = isCompliant ? '#16a34a' : '#dc2626';

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="cs">
        <head>
            <meta charset="UTF-8">
            <title>Protokol výpočtu - ${results.profileName}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 2rem; color: #111827; }
                .container { max-width: 800px; margin: auto; }
                h1, h2, h3 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem;}
                h1 { font-size: 2rem; }
                h2 { font-size: 1.5rem; margin-top: 2rem;}
                table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }
                th, td { border: 1px solid #d1d5db; padding: 0.75rem; text-align: left; }
                th { background-color: #f3f4f6; font-weight: 600; }
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .section { break-inside: avoid; }
                .status { font-weight: bold; font-size: 1.1rem; color: ${compliantColor}; border: 2px solid ${compliantColor}; padding: 0.5rem; text-align: center; margin-bottom: 1rem; border-radius: 0.25rem;}
                .sketch, .chart { text-align: center; margin-top: 2rem; break-inside: avoid; }
                .chart .recharts-wrapper { margin: auto; }
                @media print {
                    body { padding: 1rem; }
                    .no-print { display: none; }
                }

                /* Styles for Recharts SVG - These are mainly for text elements */
                .recharts-wrapper .recharts-cartesian-axis-tick-value, 
                .recharts-wrapper .recharts-legend-item-text {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 12px;
                    fill: #4b5563;
                }
                .recharts-wrapper .recharts-text {
                     fill: #4b5563;
                }
                .recharts-wrapper .recharts-label {
                     fill: #111827;
                }
                .recharts-wrapper .recharts-cartesian-axis-line,
                .recharts-wrapper .recharts-cartesian-axis-tick-line {
                    stroke: #9ca3af;
                }
                .recharts-wrapper .recharts-cartesian-grid-horizontal line,
                .recharts-wrapper .recharts-cartesian-grid-vertical line {
                    stroke: #e5e7eb;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Protokol výpočtu - Ohyb konzoly</h1>
                <p>Datum a čas generování: ${new Date().toLocaleString('cs-CZ')}</p>
                
                <div class="summary-grid">
                    <div class="section">
                        <h2>Vstupní parametry</h2>
                        <table>
                            <tr><th>Parametr</th><th>Hodnota</th></tr>
                            <tr><td>Materiál</td><td>${results.materialName}</td></tr>
                            <tr><td>Profil</td><td>${results.profileName}</td></tr>
                            <tr><td>Síla (F)</td><td>${results.force.toLocaleString('cs-CZ')} N</td></tr>
                            <tr><td>Délka (L)</td><td>${results.length.toLocaleString('cs-CZ')} mm</td></tr>
                        </table>
                    </div>
                    <div class="section">
                        <h2>Výsledky</h2>
                        <div class="status">Profil na ohyb ${compliantText}</div>
                        <table>
                            <tr><th>Parametr</th><th>Hodnota</th></tr>
                            <tr><td>Hmotnost nosníku</td><td>${results.beamMass.toFixed(2)} kg</td></tr>
                            <tr><td>Max. smyková síla (V)</td><td>${results.shearForce.toFixed(2)} N</td></tr>
                            <tr><td>Max. ohybový moment (M)</td><td>${(results.bendingMoment / 1000).toLocaleString('cs-CZ', { maximumFractionDigits: 2 })} N·m</td></tr>
                            <tr><td>Max. ohybové napětí (σ)</td><td>${results.bendingStress.toFixed(2)} MPa (Limit: ${results.yieldStrength} MPa)</td></tr>
                            <tr><td>Max. průhyb (y)</td><td>${results.deflection.toFixed(2)} mm</td></tr>
                        </table>
                    </div>
                </div>
                
                <div class="sketch">
                    <h2>Orientační schéma profilu</h2>
                    ${getProfileSketchSvg(profileType)}
                </div>

                <div class="charts-section">
                    <h2>Grafy</h2>
                    <div class="chart">
                        <h3>Průběh smykové síly</h3>
                        ${shearChartHtml}
                    </div>
                    <div class="chart">
                        <h3>Průběh ohybového momentu</h3>
                        ${momentChartHtml}
                    </div>
                    <div class="chart">
                        <h3>Průběh ohybu</h3>
                        ${deflectionChartHtml}
                    </div>
                </div>

                 <button onclick="window.print()" class="no-print" style="width: 100%; padding: 1rem; font-size: 1.2rem; background: #00529B; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 2rem;">Vytisknout</button>
            </div>
        </body>
        </html>
    `;

    const reportWindow = window.open('', '_blank');
    if(reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
        reportWindow.focus();
    }
  };
  
  const openModal = () => {
    formulasModalRef.current?.showModal();
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    // The dialog's onClose event will fire, but we also manage a state for React's benefit.
    setIsModalOpen(false);
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-white font-sans p-4 sm:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 no-print">
            <div className="text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">Kalkulačka ohybu konzoly</h1>
                <p className="text-neutral-400 mt-2">Výpočet napětí a průhybu pro konzolový nosník zatížený na konci.</p>
            </div>
            <button 
                onClick={openModal} 
                className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-400 hover:bg-neutral-700 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Zobrazit použité vzorce"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs mt-1 font-medium">Vzorce</span>
            </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print-grid-break">
            <div className="lg:col-span-1 no-print">
                <InputForm 
                  inputValues={inputValues} 
                  profileType={profileType}
                  material={material}
                  onInputChange={handleInputChange}
                  onProfileTypeChange={handleProfileTypeChange}
                  onMaterialChange={handleMaterialChange}
                  onSubmit={handleCalculate}
                />
            </div>
            <div className="lg:col-span-2 print-full-width">
                <ResultsDisplay 
                  results={results} 
                  chartData={chartData}
                  profileType={profileType}
                  onExportToHtml={handleExportToHtml}
                />
            </div>
        </div>

      </main>
      <FormulasModal ref={formulasModalRef} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default App;