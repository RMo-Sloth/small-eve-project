import { BehaviorSubject } from "rxjs";
import { AmarrFaction, CaldariFaction, Faction, GallenteFaction, MinmatarFaction } from "./Faction.class";
import { RawEmpireData } from "./RawEmpireData.interface";
import { FactionDataPeriod, FactionNames } from "./types/types";

export class FactionManager {
  public factions: Faction[];
  public update$: BehaviorSubject<null> = new BehaviorSubject( null );
  private _type: 'systems_controlled' | 'pilots' | 'kills' | 'victory_points' = 'systems_controlled';
  private _period: FactionDataPeriod = 'last_week';

  public set period( period: FactionDataPeriod ) {
    this._period = period;
    this.update$.next(null);
  }

  public get period(): FactionDataPeriod {
    return this._period;
  }

  constructor( raw_data: RawEmpireData[] ) {
    this.factions = raw_data.map( raw_data => this.init_faction( raw_data ) as Faction );
    this.update$.next(null);
  }

  public get title(): string {
    let period: string;
    if( this.period === 'last_week' )
      period = 'Last weeks';
    else if( this.period === 'total' )
      period = 'Total';
    else if( this.period === 'yesterday' )
      period = 'Yesterdays';
    else
      period = ''

    if( this.type === 'systems_controlled')
      return 'Systems Controlled';
    else if( this.type === 'pilots' )
      return 'Pilots';
    else if( this.type === 'kills' )
      return `${period} kills`;

    else if( this.type === 'victory_points' )
      return `${period} victory points`;

    else return 'No valid title found'
  }


  public set type( type: 'systems_controlled' | 'pilots' | 'kills' | 'victory_points') {
    if( type !== 'systems_controlled' && type !== 'pilots' && type !== 'kills' && type !== 'victory_points' )
      console.error( `${type} is not a valid type` );
    else {
      this._type = type;
      this.update$.next( null );
    }
  }


  public get type(): 'systems_controlled' | 'pilots' | 'kills' | 'victory_points' {
    return this._type;
  }


  private init_faction( raw_data: RawEmpireData ): Faction | undefined {
    switch (raw_data.faction_id) {
      case 500001:
        return new CaldariFaction( raw_data );
      case 500002:
        return new MinmatarFaction( raw_data );
      case 500003:
        return new AmarrFaction( raw_data );
      case 500004:
        return new GallenteFaction( raw_data );
      default:
        return undefined;
    }
  }


  public toggle( name: FactionNames ) {
    const faction = this.find( name );
    faction.enabled = !faction.enabled;
    this.update$.next( null );
  }


  private find( name : FactionNames ) {
    return this.factions.find( faction => faction.name === name ) as Faction;
  }

}
