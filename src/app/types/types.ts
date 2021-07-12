export type FactionNames = 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente';
export type FactionDataPeriod =  'last_week' | 'total' | 'yesterday';
export type FactionDataType = 'systems_controlled' | 'pilots' | 'victory_points' | 'kills';
export type ChartData = { faction: { name: string, color: string }, value: number };
