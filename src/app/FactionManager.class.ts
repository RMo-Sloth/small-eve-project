import { BehaviorSubject } from "rxjs";
import { AmarrFaction, CaldariFaction, Faction, GallenteFaction, MinmatarFaction } from "./Faction.class";
import { RawEmpireData } from "./RawEmpireData.interface";

export class FactionManager {
  public factions: Faction[];
  public update$: BehaviorSubject<null> = new BehaviorSubject( null );
  private _current_type: 'systems_controlled' | 'pilots' = 'systems_controlled';

  constructor( raw_data: RawEmpireData[] ) {
    this.factions = raw_data.map( raw_data => this.init_faction( raw_data ) as Faction );
    this.update$.next(null);
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

  public toggle( name: 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente' ) {
    const faction = this.find( name );
    faction.enabled = !faction.enabled;
    this.update$.next( null );
  }


  public set current_type( type: 'systems_controlled' | 'pilots') {
    this._current_type = type;
    this.update$.next( null );
  }

  public get current_type(): 'systems_controlled' | 'pilots' {
    return this._current_type;
  }
  private find( name : 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente' ) {
    return this.factions.find( faction => faction.name === name ) as Faction;
  }

}
