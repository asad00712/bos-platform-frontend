/**
 * Unit conversion helpers — UCUM-aligned.
 *
 * Hard rule: never overwrite stored values. Tenants may flip preferences;
 * we display-convert at render. Conversion is pure-fn and reversible.
 *
 * Anchor all conversions on the SI / metric form so we don't compose
 * lossy round-trips. `mg/dL → mmol/L` and `mmol/L → mg/dL` both go
 * through their analyte's molar mass.
 */

import type { UnitSystem } from '@/types/tenant'

/* ==================== weight ==================== */

export const KG_PER_LB = 0.45359237

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB
}
export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

/** Format kg as `X lb Y oz` (peds preference in US). */
export function kgToLbOz(kg: number): { lb: number; oz: number } {
  const totalOz = kg / KG_PER_LB * 16
  const lb = Math.floor(totalOz / 16)
  const oz = +(totalOz - lb * 16).toFixed(1)
  return { lb, oz }
}

/* ==================== length ==================== */

export const CM_PER_IN = 2.54

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN
}
export function inToCm(inches: number): number {
  return inches * CM_PER_IN
}

/** Format cm as `X' Y"`. */
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalIn = cm / CM_PER_IN
  const ft = Math.floor(totalIn / 12)
  const inches = +(totalIn - ft * 12).toFixed(1)
  return { ft, in: inches }
}

/* ==================== temperature ==================== */

export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}
export function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

/* ==================== blood glucose ==================== */
// 1 mmol/L glucose = 18.0182 mg/dL (mol mass 180.156)
export const GLUCOSE_FACTOR = 18.0182

export function glucoseMgDlToMmolL(mgdl: number): number {
  return mgdl / GLUCOSE_FACTOR
}
export function glucoseMmolLToMgDl(mmoll: number): number {
  return mmoll * GLUCOSE_FACTOR
}

/* ==================== cholesterol ==================== */
// total / LDL / HDL: 1 mmol/L = 38.67 mg/dL
// triglycerides:    1 mmol/L = 88.57 mg/dL
export const CHOL_FACTOR = 38.67
export const TG_FACTOR = 88.57

export function cholMgDlToMmolL(mgdl: number): number {
  return mgdl / CHOL_FACTOR
}
export function cholMmolLToMgDl(mmoll: number): number {
  return mmoll * CHOL_FACTOR
}
export function tgMgDlToMmolL(mgdl: number): number {
  return mgdl / TG_FACTOR
}
export function tgMmolLToMgDl(mmoll: number): number {
  return mmoll * TG_FACTOR
}

/* ==================== creatinine ==================== */
// 1 mg/dL = 88.4 µmol/L
export const CREATININE_FACTOR = 88.4

export function creatMgDlToUmolL(mgdl: number): number {
  return mgdl * CREATININE_FACTOR
}
export function creatUmolLToMgDl(umoll: number): number {
  return umoll / CREATININE_FACTOR
}

/* ==================== HbA1c ==================== */
// IFCC mmol/mol ↔ NGSP %: NGSP = (IFCC * 0.09148) + 2.152
export function a1cIfccToNgsp(ifcc: number): number {
  return ifcc * 0.09148 + 2.152
}
export function a1cNgspToIfcc(ngsp: number): number {
  return (ngsp - 2.152) / 0.09148
}

/* ==================== BMI ==================== */
// Always computed, never stored. Source = kg + cm or lb + in.
export function computeBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0
  const m = heightCm / 100
  return weightKg / (m * m)
}

/* ==================== preferred units per tenant ==================== */

export type ClinicalQuantityKind =
  | 'weight'
  | 'height'
  | 'temperature'
  | 'glucose'
  | 'cholesterol'
  | 'creatinine'
  | 'hemoglobin'

const US_UNIT_MAP: Record<ClinicalQuantityKind, string> = {
  weight: 'lb',
  height: 'in',
  temperature: '°F',
  glucose: 'mg/dL',
  cholesterol: 'mg/dL',
  creatinine: 'mg/dL',
  hemoglobin: 'g/dL',
}

const METRIC_UNIT_MAP: Record<ClinicalQuantityKind, string> = {
  weight: 'kg',
  height: 'cm',
  temperature: '°C',
  glucose: 'mmol/L',
  cholesterol: 'mmol/L',
  creatinine: 'µmol/L',
  hemoglobin: 'g/L',
}

export function preferredUnit(
  kind: ClinicalQuantityKind,
  system: UnitSystem,
): string {
  return system === 'us' ? US_UNIT_MAP[kind] : METRIC_UNIT_MAP[kind]
}

/**
 * Convert a stored value (with its source unit) into the tenant's
 * preferred display unit. Lossless: the source value is never mutated.
 */
export function convertForDisplay(
  kind: ClinicalQuantityKind,
  value: number,
  sourceUnit: string,
  targetSystem: UnitSystem,
): { value: number; unit: string } {
  const target = preferredUnit(kind, targetSystem)
  if (target === sourceUnit) return { value, unit: sourceUnit }

  const route = `${kind}:${sourceUnit}->${target}`
  switch (route) {
    case 'weight:kg->lb':
      return { value: kgToLb(value), unit: 'lb' }
    case 'weight:lb->kg':
      return { value: lbToKg(value), unit: 'kg' }
    case 'height:cm->in':
      return { value: cmToIn(value), unit: 'in' }
    case 'height:in->cm':
      return { value: inToCm(value), unit: 'cm' }
    case 'temperature:°C->°F':
      return { value: cToF(value), unit: '°F' }
    case 'temperature:°F->°C':
      return { value: fToC(value), unit: '°C' }
    case 'glucose:mg/dL->mmol/L':
      return { value: glucoseMgDlToMmolL(value), unit: 'mmol/L' }
    case 'glucose:mmol/L->mg/dL':
      return { value: glucoseMmolLToMgDl(value), unit: 'mg/dL' }
    case 'cholesterol:mg/dL->mmol/L':
      return { value: cholMgDlToMmolL(value), unit: 'mmol/L' }
    case 'cholesterol:mmol/L->mg/dL':
      return { value: cholMmolLToMgDl(value), unit: 'mg/dL' }
    case 'creatinine:mg/dL->µmol/L':
      return { value: creatMgDlToUmolL(value), unit: 'µmol/L' }
    case 'creatinine:µmol/L->mg/dL':
      return { value: creatUmolLToMgDl(value), unit: 'mg/dL' }
    case 'hemoglobin:g/dL->g/L':
      return { value: value * 10, unit: 'g/L' }
    case 'hemoglobin:g/L->g/dL':
      return { value: value / 10, unit: 'g/dL' }
    default:
      return { value, unit: sourceUnit }
  }
}
