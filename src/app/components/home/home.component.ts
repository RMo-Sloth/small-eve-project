import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { FwEmpiresService } from 'src/app/fw-empires.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('graph') graph !: ElementRef<HTMLElement>;
  data: Array<{x:number, y: number}> = [
    {x: 100, y: 200},
    {x: 200, y: 300},
    {x: 300, y: 200},
    {x: 150, y: 125},
    {x: 400, y: 500},
  ]

  constructor(
    private empire_service: FwEmpiresService
  ) {

  }

  ngOnInit() {
    this.empire_service.data$.subscribe( console.log );
  }

  ngAfterViewInit(): void {
    const height = this.graph.nativeElement.clientHeight;
    const width = this.graph.nativeElement.clientWidth;
    const scale_x = d3.scaleLinear()
      .domain( [0, 500] )
      .range( [0, width] )
    const scale_y = d3.scaleLinear()
      .domain( [0, 500] )
      .range( [height, 0] )

    d3.select( this.graph.nativeElement )
      .selectAll( "circle" )
      .data( this.data )
      .enter()
      .append( "circle" )
      .attr( "r", 5 ).attr( "fill", "red" )
      .attr( "cx", d => scale_x( d.x ) )
      .attr( "cy", d => scale_y( d.y ) );
  }

}
