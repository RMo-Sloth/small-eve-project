import { BehaviorSubject } from "rxjs";
import { RawEmpireData } from "../RawEmpireData.interface";
import { FactionDataPeriod, FactionDataType, FactionNames } from "../types/types";
import { Faction } from "./Faction.class";
import { FactionFactory } from "./FactionFactory";

export class FactionManager {
  public factions: Faction[];
  public update$: BehaviorSubject<null> = new BehaviorSubject( null );
  private _type: FactionDataType = 'systems_controlled';
  private _period: FactionDataPeriod = 'last_week';

  public set period( period: FactionDataPeriod ) {
    this._period = period;
    this.update$.next(null);
  }

  public get period(): FactionDataPeriod {
    return this._period;
  }

  constructor( raw_data: RawEmpireData[] ) {
    this.factions = raw_data.map( raw_data => FactionFactory.create( raw_data ) as Faction );
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


  public set type( type: FactionDataType ) {
      this._type = type;
      this.update$.next( null );
  }


  public get type(): FactionDataType {
    return this._type;
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
