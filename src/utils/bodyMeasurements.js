import { readAppData, writeAppData } from "./storage.js";
import { generateId } from "./workouts.js";

export function getBodyMeasurements() {
  return readAppData().bodyMeasurements;
}

export function saveBodyMeasurements(records) {
  const currentData = readAppData();
  const nextRecords = Array.isArray(records) ? records.map(normalizeBodyMeasurement) : [];
  writeAppData({ ...currentData, bodyMeasurements: nextRecords });
  return nextRecords;
}

export function sortBodyMeasurementsByDate(records) {
  return [...(Array.isArray(records) ? records : [])].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
}

export function getLatestBodyMeasurement(records) {
  return sortBodyMeasurementsByDate(records).at(-1);
}

export function upsertBodyMeasurement(records, newRecord) {
  const normalized = normalizeBodyMeasurement(newRecord);
  const nextRecords = (Array.isArray(records) ? records : []).filter((record) => record.id !== normalized.id && record.date !== normalized.date);
  return sortBodyMeasurementsByDate([...nextRecords, normalized]);
}

export function deleteBodyMeasurement(records, id) {
  return (Array.isArray(records) ? records : []).filter((record) => record.id !== id);
}

export function createEmptyBodyMeasurement(date) {
  return {
    id: generateId(),
    date,
    waistCm: "",
    hipCm: "",
    chestCm: "",
    thighCm: ""
  };
}

export function normalizeBodyMeasurement(record = {}) {
  return {
    id: record.id || generateId(),
    date: record.date || "",
    waistCm: record.waistCm ?? record.waist ?? "",
    hipCm: record.hipCm ?? record.hip ?? "",
    chestCm: record.chestCm ?? record.chest ?? "",
    thighCm: record.thighCm ?? record.thigh ?? ""
  };
}
