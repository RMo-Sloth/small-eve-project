import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FactionManagerService } from './faction-manager.service';
import { FactionManager } from './FactionManager.class';
import { FactionDataPeriod, FactionDataType, FactionNames } from './types/types';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  public data$: Observable<any> = new BehaviorSubject<any>( { title: '', factions: [], chart_data: [], selected_type: 'systems_controlled' } );
  public manager!: FactionManager;

  constructor(
    private faction_manager: FactionManagerService
  ) {
    this.data$ = this.faction_manager.manager();
  }


  public set current_type( type: FactionDataType ) {
    this.faction_manager.type = type;
  }

  public set period( period: FactionDataPeriod ) {
    this.faction_manager.period = period;
  }

  public toggle_faction( name: FactionNames ): void {
    this.faction_manager.toggle( name );
  }

}
