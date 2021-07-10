import { RawEmpireData } from "./RawEmpireData.interface";
import { FactionNames } from "./types/types";

export class Faction {
  public name !: FactionNames;
  public color !: string;
  public enabled: boolean = true;
  public statistics: FactionDataAdapter;

  constructor( raw_data: RawEmpireData ) {
    this.statistics = new FactionDataAdapter( raw_data );
  }
}


export class MinmatarFaction extends Faction {
  public color = '#653834';
  public name: FactionNames = 'Minmatar';
}

export class CaldariFaction extends Faction {
  public color = '#4a6c7f';
  public name: FactionNames = 'Caldari';
}

export class AmarrFaction extends Faction {
  public color = '#7f6c50';
  public name: FactionNames = 'Amarr';
}

export class GallenteFaction extends Faction {
  public color = '#366565';
  public name: FactionNames = 'Gallente';
}



// Faction data select
class FactionDataAdapter {
  private _systems_controlled: number;
  private _pilots: number;
  private _vicory_points: { yesterday: number; last_week: number; total: number; }
  private _kills: { yesterday: number; last_week: number; total: number; }

  constructor( data: RawEmpireData ) {
    this._systems_controlled = data.systems_controlled;
    this._pilots = data.pilots;
    this._vicory_points = data.victory_points;
    this._kills = data.kills;
  }

  get( type: 'systems_controlled' | 'pilots' | 'victory_points' | 'kills', period: 'last_week' | 'total' | 'yesterday' ): number {
    if( type === 'systems_controlled' )
      return this._systems_controlled;

    if( type === 'pilots' )
      return this._pilots;

    if( type === 'kills' )
      return this._kills[period];

    if( type === 'victory_points' )
      return this._vicory_points[period];

    return 1000;
  }
}
