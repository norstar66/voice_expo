import { StationId } from '../stations/types';

const normalize = (value: string): string => value.trim().toLowerCase();

export interface ActionAlias {
  phrases: string[]; // "calimari", "cali", "fried squid"
  canonicalItemId: string; // maps to your menu / StationItemMap
}

export interface StationAlias {
  phrases: string[]; // "grill", "saute", "on the line"
  stationId: StationId;
}

export interface VoiceActionAlias {
  phrases: string[]; // "finish ticket", "close ticket", "send it"
  actionId: 'COMPLETE_TICKET' | 'START_TIMER' | 'MARK_DONE' | string;
}

export interface AliasRegistry {
  items: ActionAlias[];
  stations: StationAlias[];
  actions: VoiceActionAlias[];
}

export function resolveItemAlias(phrase: string, registry: AliasRegistry): ActionAlias | undefined {
  const target = normalize(phrase);

  return registry.items.find((item) =>
    item.phrases.some((candidate) => normalize(candidate) === target)
  );
}

export function resolveStationAlias(phrase: string, registry: AliasRegistry): StationAlias | undefined {
  const target = normalize(phrase);

  return registry.stations.find((station) =>
    station.phrases.some((candidate) => normalize(candidate) === target)
  );
}

export function resolveVoiceActionAlias(
  phrase: string,
  registry: AliasRegistry
): VoiceActionAlias | undefined {
  const target = normalize(phrase);

  return registry.actions.find((action) =>
    action.phrases.some((candidate) => normalize(candidate) === target)
  );
}
