import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  public data$: BehaviorSubject<EmpireData[] | null> = new BehaviorSubject<EmpireData[] | null>( null );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.fetch_data().subscribe( raw_data => {
      const data = raw_data.map( this.enhance_raw_empire_data )
      this.data$.next( data )
    })
  }

  private enhance_raw_empire_data(empire: RawEmpireData) {
    const result: EmpireData = {
      faction: null,
      color: 'black',
      kills: empire.kills,
      pilots: empire.pilots,
      systems_controlled: empire.systems_controlled,
      victory_points: empire.victory_points
    };

    switch (empire.faction_id) {
      case 500001:
        result.faction = 'Caldari';
        result.color = 'blue';
        break;
      case 500002:
        result.faction = 'Minmatar';
        result.color = 'red';
        break;
      case 500003:
        result.faction = 'Amarr';
        result.color = 'yellow';
        break;
      case 500004:
        result.faction = 'Gallente';
        result.color = 'purple';
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

interface EmpireData {
  faction: 'Minmatar' | 'Caldari' | 'Gallente' | 'Amarr' | null,
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
