import stationMap from './StationItemMap.json';
import { StationId } from '../stations/types';

interface StationItemMap {
  stations: string[];
  item_to_stations: Record<string, string[]>;
  station_to_items: Record<string, string[]>;
}

const mapStationId = (station: string): StationId => {
  if (station === 'GRILL_S1') return 'GRILL/SAUTE1';
  return station as StationId;
};

export const MENU_ITEMS = Object.entries((stationMap as StationItemMap).item_to_stations).map(([name, stations]) => ({
  name,
  stations: stations.map(mapStationId)
}));
