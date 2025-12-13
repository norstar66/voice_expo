import stationMap from './StationItemMap.json';
import { StationId } from '../stations/types';

interface StationItemMap {
  stations: string[];
  item_to_stations: Record<string, string[]>;
  station_to_items: Record<string, string[]>;
  item_courses: Record<string, 'appetizer' | 'main' | 'desert'>;
}

export const MENU_ITEMS = Object.entries((stationMap as unknown as StationItemMap).item_to_stations).map(([name, stations]) => ({
  name,
  stations: stations as StationId[],
  course: (stationMap as unknown as StationItemMap).item_courses?.[name] || 'main'
}));
