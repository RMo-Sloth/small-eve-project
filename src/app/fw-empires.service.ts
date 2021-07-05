import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';
import { ChartData } from './interfaces/ChartData.interface';

//  TODO: Encapsulate record

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  private data !: EmpireData[];
  // handle data logic separately???
  public _current_type: 'systems_controlled' | 'pilots' = 'systems_controlled';
  public title: string = 'Systems Controlled';
  // private period ( default to week )
  public chart_data$: BehaviorSubject<ChartData[]> = new BehaviorSubject<ChartData[]>( [] );
  public title_data$: BehaviorSubject<string> = new BehaviorSubject<string>( '' );
  public legend_data$: BehaviorSubject<Faction[]> = new BehaviorSubject<Faction[]>( [] );

  constructor(
    private eve_http: EveHttpService
    ) {
        this.fetch_data().subscribe( raw_data => {
        this.data = raw_data.map( this.enhance_raw_empire_data.bind(this) )
        this.chart_data$.next( this.chart_data );
        this.legend_data$.next( this.selected_factions );
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

    // detect factions
    private selected_factions: Faction[] = [];
    public toggle_faction( name: string): void {
      const faction = this.selected_factions.find( faction => faction.name === name ) as Faction;
      faction.enabled = !faction.enabled;

      this.chart_data$.next( this.chart_data );
      this.legend_data$.next( this.selected_factions );
      this.title_data$.next( this.title );
    }
    //

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
      .filter( empire => this.selected_factions.some( faction => {
        return faction.enabled && faction.name === empire.faction.name;
      }) );


  }
  // init factions
  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }
  private enhance_raw_empire_data(empire: RawEmpireData) {
    const faction = this.init_faction( empire );
    if( faction === undefined )
      throw Error('Failed to find faction')

    this.selected_factions.push( faction );

    return {
      faction: faction.name,
      color: faction.color,
      kills: empire.kills,
      pilots: empire.pilots,
      systems_controlled: empire.systems_controlled,
      victory_points: empire.victory_points
    };
  }

  private init_faction( empire: RawEmpireData ): Faction | undefined { // need somekind of Building pattern
    switch (empire.faction_id) {
      case 500001:
        return new CaldariFaction();
      case 500002:
        return new MinmatarFaction();
      case 500003:
        return new AmarrFaction();
      case 500004:
        return new GallenteFaction();
      default:
        return undefined;
    }
  }
  //

}


// Faction
class Faction {
  public name !: 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente';
  public color !: string;
  public enabled: boolean = true;

  constructor() {}
}

class MinmatarFaction extends Faction {
  public color = '#653834';

  constructor() {
    super();
    this.name = 'Minmatar';
  }
}

class CaldariFaction extends Faction {
  public color = '#4a6c7f';

  constructor() {
    super();
    this.name = 'Caldari';
  }
}

class AmarrFaction extends Faction {
  public color = '#7f6c50';

  constructor() {
    super();
    this.name = 'Amarr';
  }
}

class GallenteFaction extends Faction {
  public color = '#366565';

  constructor() {
    super();
    this.name = 'Gallente';
  }
}
//












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
