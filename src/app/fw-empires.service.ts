import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';
import { AmarrFaction, CaldariFaction, Faction, GallenteFaction, MinmatarFaction } from './Faction.class';
import { ChartData } from './interfaces/ChartData.interface';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  private manager !: FactionManager;
  public chart_data$: BehaviorSubject<ChartData[]> = new BehaviorSubject<ChartData[]>( [] );
  public title_data$: BehaviorSubject<string> = new BehaviorSubject<string>( '' );
  public legend_data$: BehaviorSubject<Faction[]> = new BehaviorSubject<Faction[]>( [] );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.fetch_data().subscribe( raw_data => {
      this.manager = new FactionManager( raw_data );
      this.chart_data$.next( this.chart_data );
      this.legend_data$.next( this.manager.factions );
      this.title_data$.next( this.title );
    });
  }

  // this._current_type should be handled in Faction???
  public _current_type: 'systems_controlled' | 'pilots' = 'systems_controlled';
  public title: string = 'Systems Controlled';
  // private period ( default to week )

  public set current_type( type: 'systems_controlled' | 'pilots' ) {
    if( type === 'systems_controlled') {
      this.title ='Systems Controlled';
      this._current_type = type;
    } else if( type === 'pilots' ) {
      this.title ='Pilots';
      this._current_type = type;
    } else console.error( `${type} is not a valid type` )

    this.chart_data$.next( this.chart_data );
    this.title_data$.next( this.title );
  }

  public get current_type(): 'systems_controlled' | 'pilots' {
    return this._current_type;
  }

  // detect factions
  public toggle_faction( name: "Minmatar" | "Amarr" | "Caldari" | "Gallente"): void {
    this.manager.toggle( name );
    this.chart_data$.next( this.chart_data );
    this.legend_data$.next( this.manager.factions );
    this.title_data$.next( this.title );
  }
  //

  private get chart_data(): ChartData[] {
    return this.manager.factions
    .filter( faction => faction.enabled )
    .map( faction => ({
        faction: {
          name: faction.name,
          color: faction.color
        },
        value: faction.statistics.get( this.current_type )
    }) )
    ;
  }

  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }

}








class FactionManager {
  public factions: Faction[];

  constructor( raw_data: RawEmpireData[] ) {
    this.factions = raw_data.map( raw_data => this.init_faction( raw_data ) as Faction );
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
  }

  private find( name : 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente' ) {
    return this.factions.find( faction => faction.name === name ) as Faction;
  }
}




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
