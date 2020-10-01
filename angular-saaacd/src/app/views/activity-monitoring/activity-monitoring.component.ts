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
import Popup from 'ol-ext/Overlay/Popup';

import { LocationService } from '../../services/location.service';
import { NotificationService } from '../../services/notification.service';
import { catchError} from 'rxjs/operators';
import { Reporte } from '../../models/Reporte';
import { Semestre } from '../../models/Semestre';
import { SemesterService } from '../../services/semester.service';
import { Mapa } from '../../models/Mapa';
import { MapService } from '../../services/map.service';
import { Actividad } from '../../models/Actividad';

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
  semester: Semestre;
  warningStyle =  new Style(
		{	stroke: new Stroke({ width:3, color:'yellow' }),
			fill: new Fill({ color:'yellow' })
		});
  dangerousStyle =  new Style(
		{	stroke: new Stroke({ width:3, color:'red' }),
			fill: new Fill({ color:'red' })
		});
   
  title = 'Notificación';
  semesterErrorMessage = 'No se ha podido obtener el semestre activo';
  mapErrorMessage = 'No se ha podido mostrar el mapa activo.';
  locationErrorMessage = 'No se ha podido mostrar los datos estadísticos.';
 
  constructor( private locationService: LocationService,
		   private notifyService : NotificationService,
		   private semesterService: SemesterService,
		   private mapService: MapService,
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
						geometry: new Polygon(JSON.parse(locations[i].coordenada)),
						id: locations[i].id,
						geometry_name: locations[i].nombre
					});
					
					var priority= locations[i].data;
					switch(priority) { 
					   case Actividad.PRIORITIES[0].id: 
						  feature.setStyle(this.dangerousStyle)
						  break; 
					   } 
					   case Actividad.PRIORITIES[1].id: { 
						  feature.setStyle(this.warningStyle)
						  break; 
					   }
					   case Actividad.PRIORITIES[2].id: { 
						  //statements; 
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
  
  assignTitleToLocation(region){
	// Use Angular's Renderer2 to create the div element
	var newDiv = this.renderer.createElement('div');
	// Set the id of the div
	this.renderer.addClass(newDiv, 'placeName');
	this.renderer.setProperty(newDiv, 'id', 'region-' + region.id);
	this.renderer.setProperty(newDiv, 'textContent', region.nombre);
	var centroid = JSON.parse(region.centroide);
	let overlay = new Overlay({
	  position: [centroid[0],centroid[1]], 
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
	
	// Control Select to add percentage text
	var select = new Select({
						style: function(f) { 
							return f.styleText; }
		  });
	this.map.addInteraction(select);
}
  
  getActiveMap(){
    this.mapService.getActiveMap()
    .subscribe(map =>{ 
				this.mapImageUrl = '../static/media/'+map.imagen;
				console.log(this.mapImageUrl)
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
				
	  // Popup overlay with popupClass=anim
	  var popup = new Popup (
		{	popupClass: "default anim", //"tooltips", "warning" "black" "default", "tips", "shadow",
			closeBox: true,
			onclose: function(){ console.log("You close the box"); },
			positioning: "top-center",
			autoPan: true,
			autoPanAnimation: { duration: 100 }
		});
	 
     this.map = new OlMap({
		  target: 'map',
		  layers: [imageLayer],
		  view: this.view,
		  overlays: [popup]
	  });
  }

}
