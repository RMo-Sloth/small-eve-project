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

    const legend_meta = new LegendaMeta( this.data );

    const enter = d3.select( this.legend.nativeElement )
      .selectAll('text')
      .data( this.data )
      .enter()

    enter.append('text')
      .text( d => d.faction )
      .style('fill', 'white')
      .style( 'cursor', 'pointer' )
      .attr('x', d => legend_meta.x_pos() + 60 )
      .attr('y', d => legend_meta.y_scale( d.faction ) as number )
      .attr('font-size', 50 );

    enter.append( 'rect' )
      .attr( 'height', 30 )
      .attr( 'width', 30 )
      .attr('fill', d => d.color )
      .attr('x', d => legend_meta.x_pos() )
      .attr('y', d => legend_meta.y_scale( d.faction ) as number - 30 )



  }

  private update_chart() {
    if( this.data === null ) return;

    const chart = new BarChartMeta(
      new SystemsControlled( this.data ),
      this.data
    );

    d3.select( this.chart.nativeElement )
    .selectAll('rect')
    .data( this.data )
    .enter()
    .append( 'rect' )
    .attr('width', () => chart.x_scale.bandwidth() as number )
    .attr( 'x', d => chart.x_scale( d.faction ) as number )
    .attr( 'y', d => chart.y_pos( d.systems_controlled ) )
    .attr('height', d => chart.y_scale( d.systems_controlled ) )
    .attr( 'fill', d => d.color )
  }

}

// classes
class BarChartMeta {
  private area = new SvgArea( 0, 250, 500, 750 );
  constructor(
    private data: DataExtractor,
    private all_data: EmpireData[]
  ) {}

  public get y_scale(): d3.ScaleLinear<number, number, never> {
    return d3.scaleLinear().domain([0, this.data.max]).range([ 0, this.area.height ]);
  }

  public y_pos( d: any ): any {
    return this.area.bottom - this.y_scale( d );
  }

  public get x_scale(): d3.ScaleBand<string> {
    return d3.scaleBand()
      .paddingInner( 0.1 )
      .domain( this.all_data.map( d => d.faction ) )
      .range([this.area.left, this.area.right])
  }

}
//
class LegendaMeta {
  private area = new SvgArea( 600, 350, 1000, 650 );

  constructor(
    private data: EmpireData[]
  ) {}

  public get y_scale() {
    return d3.scaleBand(  )
      .paddingInner( 0.1 )
      .domain( this.data.map( d => d.faction ) )
      .range([this.area.top + 25, this.area.bottom + 25])
  }

  public x_pos(): number {
    return this.area.left;
  }

}
//

//
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
    public get right() {
      return this.x2 - this.padding;
    }

}

// Legend

