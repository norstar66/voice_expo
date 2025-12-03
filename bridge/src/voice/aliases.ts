import { StationId } from '../stations/types';

const normalize = (value: string): string => value.trim().toLowerCase();

const resolveAlias = <T extends { phrases: string[] }>(
  phrase: string,
  collection: T[]
): T | undefined => {
  const target = normalize(phrase);

  return collection.find((entry) =>
    entry.phrases.some((candidate) => normalize(candidate) === target)
  );
};

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
  return resolveAlias(phrase, registry.items);
}

export function resolveStationAlias(phrase: string, registry: AliasRegistry): StationAlias | undefined {
  return resolveAlias(phrase, registry.stations);
}

export function resolveVoiceActionAlias(
  phrase: string,
  registry: AliasRegistry
): VoiceActionAlias | undefined {
  return resolveAlias(phrase, registry.actions);
}
