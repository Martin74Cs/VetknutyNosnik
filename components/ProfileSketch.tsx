import React from 'react';

const SvgWrapper: React.FC<{ children: React.ReactNode, viewBox: string }> = ({ children, viewBox }) => (
    <svg 
        viewBox={viewBox} 
        className="w-24 h-24 text-neutral-400" 
        stroke="currentColor" 
        fill="none" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

const IpeSketch = () => <SvgWrapper viewBox="0 0 100 120"><path d="M10,10 H90 M10,110 H90 M50,10 V110" /></SvgWrapper>;
const HeaSketch = () => <SvgWrapper viewBox="0 0 120 120"><path d="M10,10 H110 M10,110 H110 M60,10 V110" /></SvgWrapper>;
const LSketch = () => <SvgWrapper viewBox="0 0 100 100"><path d="M10,10 V90 H90" /></SvgWrapper>;
const UpnSketch = () => <SvgWrapper viewBox="0 0 100 120"><path d="M10,10 H80 L90,20 M10,110 H80 L90,100 M10,10 V110" /></SvgWrapper>;
const UpeSketch = () => <SvgWrapper viewBox="0 0 100 120"><path d="M10,10 H90 M10,110 H90 M10,10 V110" /></SvgWrapper>;
const TSketch = () => <SvgWrapper viewBox="0 0 120 100"><path d="M10,10 H110 M60,10 V90" /></SvgWrapper>;


const sketches: { [key: string]: React.FC } = {
  'IPE': IpeSketch,
  'L': LSketch,
  'HEA': HeaSketch,
  'UPN': UpnSketch,
  'UPE': UpeSketch,
  'T': TSketch,
};

interface ProfileSketchProps {
  profileType: string;
}

const ProfileSketch: React.FC<ProfileSketchProps> = ({ profileType }) => {
  const SketchComponent = sketches[profileType];
  if (!SketchComponent) return null;

  return (
    <div className="mt-6 pt-6 border-t border-neutral-700 text-center">
      <h3 className="text-lg font-semibold text-neutral-300 mb-4">Orientační schéma profilu</h3>
      <div className="bg-neutral-900 p-4 rounded-lg inline-block shadow-inner">
        <SketchComponent />
      </div>
    </div>
  );
};

export default ProfileSketch;
