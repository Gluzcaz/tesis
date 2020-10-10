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
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';

import { LocationService } from '../../services/location.service';
import { NotificationService } from '../../services/notification.service';
import { catchError} from 'rxjs/operators';
import { Reporte } from '../../models/Reporte';
import { Semestre } from '../../models/Semestre';
import { SemesterService } from '../../services/semester.service';
import { Mapa } from '../../models/Mapa';
import { MapService } from '../../services/map.service';
import { Categoria } from '../../models/Categoria';
import { CategoryService } from '../../services/category.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DOCUMENT, Location} from '@angular/common';

@Component({
  selector: 'app-activity-statistics',
  templateUrl: './activity-statistics.component.html',
  styleUrls: ['./activity-statistics.component.css']
})
export class ActivityStatisticsComponent implements OnInit {

  mapImageUrl: string =''; 
  loadedImageWidth: number = 0;
  loadedImageHeight: number = 0;
  view: OlView = new OlView();
  vectorSource = new Vector();
  map: OlMap;
  selectedSemester: number;
  semesters: Semestre[];
  superiorCategories: Categoria[];
  selectedChartType: string = "pie";
  charTypes = [{ key:   "Circular", value: "pie"},
			  { key:   "Circular 3D", value: "pie3D"},
			  { key:   "Dona", value: "donut"},
			  { key:   "Barras", value: "bar"},
			 ];
  selectedLocationType: boolean = false;
  locationTypes = [{ key:   "Superior", value: false},
			  { key:   "Inferior", value: true}
			 ];
  chartColors = ["#ffa500","blue","red","green","cyan","magenta","yellow","#0f0"]
  actionInProgress = false;
  
  title = 'Notificación';
  locationErrorMessage = 'No se ha podido mostrar los datos estadísticos.';
  semesterErrorMessage = 'No se ha podido mostrar los semestres';
  mapErrorMessage = 'No se ha podido mostrar el mapa activo.';
  categoryErrorMessage = 'No se ha podido mostrar las categorias de actividad.';

  constructor( private locationService: LocationService,
    	       private notifyService : NotificationService,
			   private semesterService: SemesterService,
			   private mapService: MapService,
			   private renderer: Renderer2,
			   private categoryService: CategoryService
			   ) { }

  ngOnInit(): void {
    this.getActiveMap();
	this.getSuperiorCategories();
  }
  
  getFeatureStyle(feature, sel){	

	var radius = 12;
	var data = feature.get("data");
	radius *= (sel?1.5:1);
	// Create chart style
	let style = [ new Style(
		{	image: new Chart(
			{	type: this.selectedChartType, 
				radius: radius, 
				offsetY: this.selectedChartType=='pie' ? 0 : (sel?-1.5:-1)*radius,
				data: data, 
				rotateWithView: true,
				stroke: new Stroke(
				{	color: "#fff",
					width: 1.5
				}),
			})
		})];

	// Show values on select
	if (sel)
	{
		var sum = feature.get("sum");

		var s = 0;
		for (var i=0; i<data.length; i++)
		{	var d = data[i];
			var a = (2*s+d)/sum * Math.PI - Math.PI/2; 
			var v = Math.round(d/sum*1000);
			if (v>0)
			{	style.push(new Style(
				{	text: new Text(
					{	text: (v/10)+"%", /* d.toString() */
						offsetX: Math.cos(a)*(radius+3),
						offsetY: Math.sin(a)*(radius+3),
						textAlign: (a < Math.PI/2 ? "left":"right"),
						textBaseline: "middle",
						stroke: new Stroke({ color:"#fff", width:2.5 }),
						fill: new Fill({color:"#333"})
					})
				}));
			}
			s += d;
		}
	}
    return style;
}
 
  getStatisticData(){
	this.locationService.getActivityStatisticByLocation(this.selectedSemester, this.selectedLocationType)
    .subscribe(locations =>{ 
				console.log(locations)
			    for (var i = 0; i < locations.length; i++) { 
					var statistics = JSON.parse(locations[i].data);
					var sum = 0
					for (var k=0; k<statistics.length; k++) 
						{	
							sum += statistics[k];
						}
						
					var centroid = JSON.parse(locations[i].centroide);
					var feature = new Feature({
						geometry: new Point([centroid[0],centroid[1]]),
						id: locations[i].id,
						geometry_name: locations[i].nombre,
						data: statistics,
						sum: sum, //Total
						style: null,
						styleText: null
					});
					feature.style=this.getFeatureStyle(feature, false);
					feature.styleText=this.getFeatureStyle(feature, true);
					this.vectorSource.addFeature(feature);
					this.assignTitleToLocation(locations[i]);
				}
				this.assignFeaturesToMap()
	           },
			   error => {
				  catchError(this.notifyService.handleError<Reporte>('getActivityStatisticsByLocation'));
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
	  position: [centroid[0],centroid[1]+50], 
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
		source: this.vectorSource,
		// y ordering
		//renderOrder: olExtent.utils.ordering.yOrdering(),
		style: function(f) {return f.style;}
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
  
  getSemesters(){
    this.semesterService.getSemesters()
    .subscribe(semesters =>{ 
				this.semesters = semesters;
				this.selectedSemester = this.semesterService.getDefaultSemester(this.semesters);
				this.getStatisticData();
			   },
			   error => {
				  catchError(this.notifyService.handleError<Semestre>('getSemester'));
				  this.notifyService.showErrorTimeout(this.semesterErrorMessage, this.title);
				  }
			   );
  }  
  
  getSuperiorCategories(){
    this.categoryService.getSuperiorCategories()
    .subscribe(categories =>{ 
				this.superiorCategories = categories;	
	           },
			   error => {
				  catchError(this.notifyService.handleError<Categoria>('getCategory'));
				  this.notifyService.showErrorTimeout(this.categoryErrorMessage, this.title);
				  }
			   );
  } 
  
  clearMap(){
	 this.map.getInteractions().pop();
	 this.map.getOverlays().clear();
	 this.vectorSource.clear();
	 let oldLayer = this.map.getLayers().getArray()[1];
	 this.map.removeLayer(oldLayer);
  }
  
  filterStatistics(){
	this.clearMap()
	this.getStatisticData()
  }
    
  /*************** MAP VISUALIZATION ******************* ***/
  
  @ViewChild('img', { static: false }) img: ElementRef;
  onLoad(){
   this.loadedImageWidth = (this.img.nativeElement as HTMLImageElement).naturalWidth;
   this.loadedImageHeight = (this.img.nativeElement as HTMLImageElement).naturalHeight;
   this.createMap();
   this.getSemesters();
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
  }
  
//-------------------------DRAW ELEMENTS ON MAP
// Style function
changeChartType(selectedChartType: string){
	var features = this.vectorSource.getFeatures();
	for (var i = 0; i < features.length; i++) { 
		features[i].style=this.getFeatureStyle(features[i], false);
		features[i].styleText=this.getFeatureStyle(features[i], true);
	}

	this.vectorSource.changed();
	
}

//---------------------------PDF
	public downloadPDF(): void {
	    this.actionInProgress =true;
	    const DATA = document.getElementById('htmlData');
		const doc = new jsPDF('l', 'pt', 'a4');
	    const options = {
		  background: 'white',
		  scale: 3
		};
		html2canvas(DATA, options).then((canvas) => {
		  const img = canvas.toDataURL('image/PNG');

		  // Add image Canvas to PDF
		  const bufferX = 15;
		  const bufferY = 15;
		  const imgProps = (doc as any).getImageProperties(img);
		  const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
		  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
		  doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
		  
		  doc.setTextColor(212, 172, 13);
	      var text = 'Estadística de actividades';
          var xOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(text) * doc.internal.getFontSize() / 2); 
          doc.text(text, xOffset, 20);
		  
		  return doc;
		}).then((docResult) => {
		  this.actionInProgress =false;
		  docResult.save('EstadísticaActividades.pdf');
		});
	}
	
	

}
