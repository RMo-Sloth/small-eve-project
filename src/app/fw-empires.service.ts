import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';
import { ChartData } from './interfaces/ChartData.interface';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  private data !: EmpireData[];
  // handle faction logic separately???
  private selected_factions: string[] = [ 'Minmatar', 'Amarr', 'Caldari', 'Gallente' ];
  // handle data logic separately???
  public _current_type: 'systems_controlled' | 'pilots' = 'systems_controlled';
  public title: string = 'Systems Controlled';
  // private period ( default to week )
  //
  public chart_data$: BehaviorSubject<ChartData[]> = new BehaviorSubject<ChartData[]>( [] );
  public legend_data$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>( [] );
  public title_data$: BehaviorSubject<string> = new BehaviorSubject<string>( '' );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.fetch_data().subscribe( raw_data => {
      this.data = raw_data.map( this.enhance_raw_empire_data )
      this.chart_data$.next( this.chart_data );
      this.legend_data$.next( [
        { faction: { name: 'Minmatar', color: '#653834' }, active: true },
        { faction: { name: 'Amarr', color: '#7f6c50' }, active: true },
        { faction: { name: 'Caldari', color: '#4a6c7f' }, active: true },
        { faction: { name: 'Gallente', color: '#366565' }, active: true },
      ] );
      this.title_data$.next( this.title );
    });
  }

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

  public toggle_faction( faction: string): void {
    if( this.selected_factions.includes( faction ) )
      this.selected_factions = this.selected_factions.filter( value => value !== faction );
    else
      this.selected_factions.push( faction )

    this.chart_data$.next( this.chart_data );
    this.legend_data$.next( this.legend_data );
    this.title_data$.next( this.title );
  }

  private get legend_data() {
    return [
      { faction: { name: 'Minmatar', color: '#653834' }, active: this.selected_factions.includes( 'Minmatar' ) },
      { faction: { name: 'Amarr', color: '#7f6c50' }, active:  this.selected_factions.includes( 'Amarr' ) },
      { faction: { name: 'Caldari', color: '#4a6c7f' }, active: this.selected_factions.includes( 'Caldari' ) },
      { faction: { name: 'Gallente', color: '#366565' }, active: this.selected_factions.includes( 'Gallente' ) },
    ]
  }

  private get chart_data(): ChartData[] {
    return this.data.map( empire => {
      return {
        faction: {
          name: empire.faction,
          color: empire.color
        },
        value: empire[this.current_type]
      }
    })
    .filter( empire => this.selected_factions.includes( empire.faction.name ) );
  }

  private enhance_raw_empire_data(empire: RawEmpireData) {
    const result: EmpireData = {
      faction: 'Amarr',
      color: 'black',
      kills: empire.kills,
      pilots: empire.pilots,
      systems_controlled: empire.systems_controlled,
      victory_points: empire.victory_points
    };

    switch (empire.faction_id) {
      case 500001:
        result.faction = 'Caldari';
        result.color = '#4a6c7f';
        break;
      case 500002:
        result.faction = 'Minmatar';
        result.color = '#653834';
        break;
      case 500003:
        result.faction = 'Amarr';
        result.color = '#7f6c50';
        break;
      case 500004:
        result.faction = 'Gallente';
        result.color = '#366565';
        break;
      default:
        console.error(`Faction with faction_id of ${empire.faction_id} is not recognised`);
    }

    return result;
  }

  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }

}

interface RawEmpireData {
  faction_id: number;
  kills: {
    last_week: number;
    total: number,
    yesterday: number
  },
  pilots: number,
  systems_controlled: number,
  victory_points: {
    last_week: number;
    total: number,
    yesterday: number
  }
}

export interface EmpireData {
  faction: 'Minmatar' | 'Caldari' | 'Gallente' | 'Amarr',
  color: string;
  kills: {
    last_week: number;
    total: number,
    yesterday: number
  },
  pilots: number,
  systems_controlled: number,
  victory_points: {
    last_week: number;
    total: number,
    yesterday: number
  }
}
