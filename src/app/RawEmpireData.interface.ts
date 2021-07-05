export interface RawEmpireData {
  faction_id: number;
  kills: {
    last_week: number;
    total: number;
    yesterday: number;
  },
  pilots: number,
  systems_controlled: number;
  victory_points: {
    last_week: number;
    total: number;
    yesterday: number;
  }
}
