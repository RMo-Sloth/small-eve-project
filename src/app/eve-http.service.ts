import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EveHttpService {

  constructor(
    private http: HttpClient
  ) {}

  public get( url: string ): Observable<Object> {
    return this.http.get( url, {
      params: {
        datasource: 'tranquility'
      }
    } )
  }


}
