import { Component, ViewChild, ElementRef, OnInit,Renderer2 } from '@angular/core';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import Feature from 'ol/Feature';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import Projection from 'ol/proj/Projection';
import * as olExtent from 'ol/extent';
import {Style, Circle, Stroke, Text, Fill} from 'ol/style';
import Chart from 'ol-ext/style/Chart';
import Select from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import Polygon from 'ol/geom/Polygon';
import Overlay from 'ol/Overlay';

import { LocationService } from '../../services/location.service';
import { NotificationService } from '../../services/notification.service';
import { catchError} from 'rxjs/operators';
import { Reporte } from '../../models/Reporte';
import { Mapa } from '../../models/Mapa';
import { MapService } from '../../services/map.service';
import { Actividad } from '../../models/Actividad';
import { MonitorDialogModel, MonitorDialogComponent } from '../monitor-dialog/monitor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-activity-monitoring',
  templateUrl: './activity-monitoring.component.html',
  styleUrls: ['./activity-monitoring.component.css']
})
export class ActivityMonitoringComponent implements OnInit {

  mapImageUrl: string =''; 
  loadedImageWidth: number = 0;
  loadedImageHeight: number = 0;
  view: OlView = new OlView();
  vectorSource = new Vector();
  map: OlMap;
  selectedSemester: number;
  pasiveStyle =  new Style(
		{	stroke: new Stroke({ width:3, color:'yellow' }),
			fill: new Fill({ color:'yellow' })
		});
  warningStyle =  new Style(
		{	stroke: new Stroke({ width:3, color:'orange' }),
			fill: new Fill({ color:'orange' })
		});
  dangerousStyle =  new Style(
		{	stroke: new Stroke({ width:3, color:'red' }),
			fill: new Fill({ color:'red' })
		});
  superiorCategories: string[] = ['Alta','Media','Baja'];
  chartColors = ["red","orange","yellow"]

 
  title = 'Notificación';
  locationErrorMessage = 'No se ha podido mostrar los datos estadísticos.';
  mapErrorMessage = 'No se ha podido identificar el mapa.';
 
  constructor( private locationService: LocationService,
		   private notifyService : NotificationService,
		   private mapService: MapService,
		   public dialog: MatDialog,
		   private renderer: Renderer2
		   ) { }

  ngOnInit(): void {
	this.getActiveMap();
  }
  
  getStatisticData(){
	this.locationService.getActivityMonitoringByLocation()
    .subscribe(locations =>{ 
				
			    for (var i = 0; i < locations.length; i++) { 
					var feature = new Feature({
					    type: 'click',
						geometry: new Polygon(JSON.parse(locations[i].coordenada)),
						id: locations[i].id,
						geometry_name: locations[i].nombre,
						centroid : JSON.parse(locations[i].centroide),
					    callMonitorDialog: this.openDialog,
						dialog: this.dialog
					});
					
					var priority= locations[i].data;
					switch(priority) { 
					   case Actividad.PRIORITIES[0].id:{
						  feature.setStyle(this.dangerousStyle)
						  break; 
					   } 
					   case Actividad.PRIORITIES[1].id: { 
						  feature.setStyle(this.warningStyle);
						  break; 
					   }
					   case Actividad.PRIORITIES[2].id: { 
						   feature.setStyle(this.pasiveStyle)
						  break; 
					   } 					   
					   default: { 
						  //statements; 
						  break; 
					   } 
					} 
					this.vectorSource.addFeature(feature);
					this.assignTitleToLocation(locations[i]);
				}
				this.assignFeaturesToMap()
	           },
			   error => {
				  catchError(this.notifyService.handleError<Reporte>('getActivityStadisticByLocation'));
				  this.notifyService.showErrorTimeout(this.locationErrorMessage, this.title);
				  }
			   );
  }
  
  getActiveMap(){
    this.mapService.getActiveMap()
    .subscribe(map =>{ 
				this.mapImageUrl = '../static/media/'+map.imagen;
	           },
			   error => {
				  catchError(this.notifyService.handleError<Mapa>('getActiveMap'));
				  this.notifyService.showErrorTimeout(this.mapErrorMessage, this.title);
				  }
			   );
  } 
  
    /*************** MAP VISUALIZATION ******************* ***/
  
  @ViewChild('img', { static: false }) img: ElementRef;
  onLoad(){
   this.loadedImageWidth = (this.img.nativeElement as HTMLImageElement).naturalWidth;
   this.loadedImageHeight = (this.img.nativeElement as HTMLImageElement).naturalHeight;
   this.createMap();
   this.getStatisticData();
  }
  
   createMap(): void{
     let extent = [0, 0, this.loadedImageWidth, this.loadedImageHeight]; 
	 let projection = new Projection({
		  code: 'map-image',
		  units: 'pixels',
		  extent: extent
		});
		
	 this.view = new OlView({
			projection: projection,
			center: olExtent.getCenter(extent),
			zoom: 2,
			maxZoom: 8
		  });
		  
     let imageLayer = new ImageLayer({
					source: new ImageStatic({
							url: this.mapImageUrl,
							projection: projection,
							imageExtent: extent
						  })
				});

     this.map = new OlMap({
		  target: 'map',
		  layers: [imageLayer],
		  view: this.view
	  });
	  
  this.map.on('click', function(evt) {
	var f = evt.map.forEachFeatureAtPixel(
			evt.pixel,
			function(ft, layer){return ft;}
    );
	if (f && f.get('type') == 'click') {
		var dialog = f.get('dialog');
		f.get('callMonitorDialog')(f.values_.id, f.values_.geometry_name, dialog);
	}
  });
 }
 
  openDialog(id, title, dialog): Observable<any>{
	//this.monitorService.openDialog(id, title, true);
	const dialogData = new MonitorDialogModel(id, title, true);
    const dialogRef = dialog.open(MonitorDialogComponent, {
      maxWidth: "70%",
	  maxHeight: "50%",
      data: dialogData
    });
	
	return dialogRef.afterClosed();
  }
  
  assignTitleToLocation(region){
	// Use Angular's Renderer2 to create the div element
	var newDiv = this.renderer.createElement('div');
	if(region.data == Actividad.PRIORITIES[0].id)
		this.renderer.addClass(newDiv, 'pulsePlaceName');
	else
		this.renderer.addClass(newDiv, 'placeName');
	this.renderer.setProperty(newDiv, 'id', 'region-' + region.id);
	this.renderer.setProperty(newDiv, 'textContent', region.nombre);

	let overlay = new Overlay({
	  position: JSON.parse(region.centroide), 
	  positioning: 'center-center',
	  element: newDiv,
	  stopEvent: false,
	});
	this.map.addOverlay(overlay);
  }
  
  assignFeaturesToMap(){
	// Fit to extent
	var extent = this.vectorSource.getExtent();
	if (!(extent[0] == Number.POSITIVE_INFINITY || extent[0] == Number.NEGATIVE_INFINITY)) {
	  this.view.fit(extent);
	}
	
	var vectorLayer = new VectorLayer({
		source: this.vectorSource
	});
	this.map.addLayer(vectorLayer);
  }

}
