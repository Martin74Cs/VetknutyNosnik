import React, { useEffect, forwardRef, useRef } from 'react';

declare global {
    interface Window {
      MathJax: {
        typeset: (elements?: HTMLElement[]) => void;
      };
    }
}

interface FormulasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormulaItem: React.FC<{ title: string; formula: string; description: string }> = ({ title, formula, description }) => (
    <div className="py-4 border-b border-neutral-700 last:border-b-0">
        <h4 className="font-semibold text-lg text-primary">{title}</h4>
        <div className="my-3 p-3 bg-neutral-900 rounded-md text-neutral-200 flex items-center justify-center min-h-[60px] text-lg overflow-x-auto">
          {formula}
        </div>
        <p className="text-sm text-neutral-400" dangerouslySetInnerHTML={{ __html: description }}></p>
    </div>
);


const FormulasModal = forwardRef<HTMLDialogElement, FormulasModalProps>(({ isOpen, onClose }, ref) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasBeenTypeset = useRef(false); // Track if typesetting has occurred

  useEffect(() => {
    // Typeset only if the modal is open AND it hasn't been typeset before.
    if (isOpen && !hasBeenTypeset.current && window.MathJax && contentRef.current) {
      // Delay typesetting to ensure content is visible and rendered before MathJax runs
      setTimeout(() => {
        window.MathJax.typeset([contentRef.current]);
        hasBeenTypeset.current = true; // Mark as typeset to prevent re-running
      }, 50);
    }
  }, [isOpen]);

  const handleCloseButtonClick = () => {
    const dialog = (ref as React.RefObject<HTMLDialogElement>)?.current;
    if (dialog) {
      dialog.close();
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="bg-neutral-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full relative text-neutral-200 backdrop:bg-black backdrop:bg-opacity-70 open:animate-fade-in-scale"
    >
      <button 
        onClick={handleCloseButtonClick} 
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Zavřít"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <div ref={contentRef}>
        <h2 className="text-2xl font-bold text-neutral-100 mb-6 border-b pb-3 border-neutral-700">Použité vzorce</h2>
        
        <div className="space-y-4">
            <FormulaItem 
                title="Maximální smyková síla"
                formula={`$$V_{max} = F$$`}
                description="<b>F</b>: Působící síla [N]"
            />
            <FormulaItem 
                title="Maximální ohybový moment"
                formula={`$$M_{max} = F \\cdot L$$`}
                description="<b>F</b>: Působící síla [N], <b>L</b>: Délka nosníku [mm]"
            />
            <FormulaItem 
                title="Maximální ohybové napětí"
                formula={`$$\\sigma_{max} = \\frac{M_{max}}{W_x} = \\frac{F \\cdot L}{W_x}$$`}
                description="<b>F</b>: Působící síla [N], <b>L</b>: Délka nosníku [mm], <b>W<sub>x</sub></b>: Průřezový modul v ohybu [mm³]"
            />
            <FormulaItem 
                title="Maximální průhyb"
                formula={`$$y_{max} = \\frac{F \\cdot L^3}{3 \\cdot E \\cdot I_x}$$`}
                description="<b>F</b>: Působící síla [N], <b>L</b>: Délka nosníku [mm], <b>E</b>: Modul pružnosti v tahu [MPa], <b>I<sub>x</sub></b>: Moment setrvačnosti průřezu [mm⁴]"
            />
        </div>
      </div>
    </dialog>
  );
});

export default FormulasModal;