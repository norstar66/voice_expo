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
  // normalize & match; later we can add fuzzy matching
}

export function resolveStationAlias(phrase: string, registry: AliasRegistry): StationAlias | undefined {
  // ...
}
