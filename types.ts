// Fix: Provide concrete type definitions for the application.
export interface SteelProfile {
  name: string;
  Wx: number; // Průřezový modul v ohybu [mm³]
  Ix: number; // Moment setvačnosti průřezu [mm⁴]
  area: number; // Plocha průřezu [mm²]
  height: number; // Výška [mm]
  weight: number; // Hmotnost [kg/m]
}

export interface Material {
  name: string;
  E: number; // Modul pružnosti v tahu [MPa]
  yieldStrength: number; // Mez kluzu [MPa]
}

export interface InputValues {
  force: string;
  length: string;
  profile: string; // The name of the selected profile
}

export interface CalculationResults {
  shearForce: number;
  bendingMoment: number;
  bendingStress: number;
  deflection: number;
  profileName: string;
  beamMass: number;
  force: number;
  length: number;
  materialName: string;
  yieldStrength: number;
}

export interface ChartDataPoint {
  x: number; // Vzdálenost od vetknutí
  shear: number; // Smyková síla
  moment: number; // Ohybový moment
  deflection: number; // Průhyb
}