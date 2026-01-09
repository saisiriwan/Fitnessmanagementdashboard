import { BodyMetrics } from '../types/goals';

const STORAGE_KEY = 'trainer-app-body-metrics';

export function getAllBodyMetrics(): BodyMetrics[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading body metrics:', error);
    return [];
  }
}

export function getBodyMetricsByClient(clientId: string): BodyMetrics[] {
  const allMetrics = getAllBodyMetrics();
  return allMetrics
    .filter(m => m.clientId === clientId)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
}

export function addBodyMetrics(metrics: Omit<BodyMetrics, 'id'>): string {
  const id = crypto.randomUUID();
  const newMetrics: BodyMetrics = { ...metrics, id };
  
  const allMetrics = getAllBodyMetrics();
  allMetrics.push(newMetrics);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allMetrics));
  return id;
}

export function updateBodyMetrics(id: string, updates: Partial<BodyMetrics>): void {
  const allMetrics = getAllBodyMetrics();
  const updated = allMetrics.map(m => m.id === id ? { ...m, ...updates } : m);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteBodyMetrics(id: string): void {
  const allMetrics = getAllBodyMetrics();
  const filtered = allMetrics.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getLatestBodyMetrics(clientId: string): BodyMetrics | undefined {
  const clientMetrics = getBodyMetricsByClient(clientId);
  return clientMetrics[clientMetrics.length - 1];
}
