import { UnitSystem, SalinityUnit } from "@/types";

export const cToF = (c: number): number => {
  return parseFloat(((c * 9) / 5 + 32).toFixed(1));
};

export const fToC = (f: number): number => {
  return parseFloat((((f - 32) * 5) / 9).toFixed(1));
};

export const lToGal = (l: number): number => {
  return parseFloat((l * 0.264172).toFixed(1));
};

export const galToL = (g: number): number => {
  return parseFloat((g / 0.264172).toFixed(1));
};

export const sgToPpt = (sg: number): number => {
  return parseFloat(((sg - 1.0) * 1333.3).toFixed(1));
};

export const pptToSg = (ppt: number): number => {
  return parseFloat((1.0 + ppt / 1333.3).toFixed(3));
};

export const formatTemp = (celsius: number, unitSystem: UnitSystem): string => {
  if (unitSystem === "imperial") {
    return `${cToF(celsius)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
};

export const formatVolume = (liters: number, unitSystem: UnitSystem): string => {
  if (unitSystem === "imperial") {
    return `${lToGal(liters)} gal`;
  }
  return `${liters} L`;
};

export const formatSalinity = (sg: number, unit: SalinityUnit): string => {
  if (unit === "ppt") {
    return `${sgToPpt(sg)} ppt`;
  }
  return `${sg.toFixed(3)} SG`;
};

export const convertRangeString = (
  rangeStr: string,
  converter: (val: number) => number,
  decimals: number = 1
): string => {
  if (!rangeStr) return "";
  const parts = rangeStr.split("-").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return `${converter(parts[0]).toFixed(decimals)} - ${converter(parts[1]).toFixed(decimals)}`;
  }
  return rangeStr;
};
