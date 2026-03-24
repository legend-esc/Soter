import { Platform } from 'react-native';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export interface AidItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  location: string;
  createdAt: string;
}

/** Fetch aid overview list from the backend */
export const fetchAidList = async (): Promise<AidItem[]> => {
  const response = await fetch(`${API_URL}/aid`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/** Fallback mock data used when the backend is unreachable */
export const getMockAidList = (): AidItem[] => [
  {
    id: '1',
    title: 'Emergency Food Supply',
    description: 'Distribution of emergency food packages to affected families.',
    status: 'active',
    location: 'Sector A, Zone 3',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Medical Aid Convoy',
    description: 'Mobile medical units providing first aid and triage.',
    status: 'active',
    location: 'Northern District',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Shelter Allocation',
    description: 'Temporary shelter setup for displaced residents.',
    status: 'pending',
    location: 'Central Camp',
    createdAt: new Date().toISOString(),
  },
];
