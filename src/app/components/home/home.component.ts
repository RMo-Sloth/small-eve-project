import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { EmpireData, FwEmpiresService } from 'src/app/fw-empires.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('graph') graph !: ElementRef<HTMLElement>;
  @ViewChild('chart') chart !: ElementRef<HTMLElement>;
  @ViewChild('legend') legend !: ElementRef<HTMLElement>;

  private data !: EmpireData[] | null;

  constructor(
    private empire_service: FwEmpiresService
  ) {

  }

  ngAfterViewInit(): void {
    this.empire_service.data$.subscribe( data => {
      this.data = data;
      if( data ) this.update_svg();
    });
  }

  update_svg() {
    this.update_chart();
    this.update_legend();
  }
  private update_legend() {
    if( this.data === null ) return;

    const area = new SvgArea( 621, 379, 1000, 1000 );

    d3.select( this.legend.nativeElement )
      .append('text')
      .text( 'Legend' )
      .style('fill', 'white')
      .attr('x', area.left )
      .attr('y', area.top + 50 )
      .attr('font-size', 50 )

  }

  private update_chart() {
    if( this.data === null ) return;

    const chart = new BarChartMeta( new SystemsControlled( this.data ) );

    d3.select( this.chart.nativeElement )
    .selectAll('rect')
    .data( this.data )
    .enter()
    .append( 'rect' )
    .attr('width', (d, i) => chart.x_scale(d, i) )
    .attr( 'x', (d, i) => i*170 )
    .attr( 'y', d => chart.y_pos( d.systems_controlled ) )
    .attr('height', d => chart.y_scale( d.systems_controlled ) )
    .attr( 'fill', d => d.color )
  }

}

// classes
class BarChartMeta {
  private area = new SvgArea( 0, 379, 621, 1000 );
  constructor(
    private data: DataExtractor
  ) {}

  public get y_scale(): d3.ScaleLinear<number, number, never> {
    return d3.scaleLinear().domain([0, this.data.max]).range([ 0, this.area.height ]);
  }

  public y_pos( d: any ): any {
    return this.area.bottom - this.y_scale( d );
  }

  public x_scale( d: any, index: number ): number {
    return 150;
  }

}


abstract class DataExtractor {
  public abstract max: number;
  public abstract min: number;

  constructor( protected data: any[] ){}
}

class SystemsControlled extends DataExtractor {
  constructor(
    data: EmpireData[]
  ){
    super( data )
  }

  public get max(): number {
    return d3.max( this.data, d => d.systems_controlled ) as number;
  }

  public get min() {
    return d3.min( this.data, d => d.systems_controlled ) as number;
  }

}

class SvgArea {
  private padding: number = 20;

  constructor(
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number
  ) {}

    public get width(): number {
      return this.x2 - this.x1 - 2 * this.padding;
    }
    public get height(): number {
      return this.y2 - this.y1 - 2 * this.padding;
    }
    public get bottom(): number {
      return this.y2 - this.padding;
    }
    public get top(): number {
      return this.y1 + this.padding;
    }
    public get left() {
      return this.x1 + this.padding;
    }

}

// Legend

