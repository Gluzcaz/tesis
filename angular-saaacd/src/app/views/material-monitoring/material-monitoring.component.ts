import { Component, ViewChild, ElementRef, OnInit,Renderer2,Inject } from '@angular/core';
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

import { DeviceService } from '../../services/device.service';
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

import { ExpiredDevice } from '../../models/ExpiredDevice';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DOCUMENT, Location} from '@angular/common';

@Component({
  selector: 'app-material-monitoring',
  templateUrl: './material-monitoring.component.html',
  styleUrls: ['./material-monitoring.component.css']
})
export class MaterialMonitoringComponent implements OnInit {
  devices: ExpiredDevice[];
  deviceTotalPrice = 0;
  mapImageUrl: string =''; 
  loadedImageWidth: number = 0;
  loadedImageHeight: number = 0;
  view: OlView = new OlView();
  vectorSource = new Vector();
  map: OlMap;
  selectedSemester: number;
  actionInProgress =false;
  minDate: Date;
  maxDate: Date;
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
  superiorCategories: string[] = ['Material expirado','Material por expirar en un mes'];
  chartColors = ["red","yellow"]
  //Table Elements
  displayedColumns: string[] =['id','nombre','cantidad', 'precio']
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
   
  title = 'Notificación';
  locationErrorMessage = 'No se ha podido mostrar los datos estadísticos.';
  mapErrorMessage = 'No se ha podido identificar el mapa.';
  deviceErrorMessage = 'No se ha podido mostrar los dispositivos expirados.';
 
  constructor( private deviceService: DeviceService,
           private locationService: LocationService,
		   private notifyService : NotificationService,
		   private mapService: MapService,
		   public dialog: MatDialog,
		   private renderer: Renderer2,
		   @Inject(DOCUMENT) document
		   ) { 
	var today = new Date();
    var year = today.getFullYear();
	var month = today.getMonth();
	var day = today.getDay();
	
    this.minDate = today;
    this.maxDate = new Date(year + 2, month, day);	   
	}

  ngOnInit(): void {
	this.getActiveMap();
	this.getExpiredDevices();
  }
  
  getMaterialMonitoringData(){
	this.locationService.getMaterialMonitoringByLocation()
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
					
					var priority= parseInt(locations[i].data, 10);
					switch(priority) { 
					   case 1:{
						  feature.setStyle(this.dangerousStyle)
						  break; 
					   } 
					   case 2: { 
						  feature.setStyle(this.warningStyle);
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
				if(locations.length >0)
					this.assignFeaturesToMap()
	           },
			   error => {
				  catchError(this.notifyService.handleError<Reporte>('getActivityStadisticByLocation'));
				  this.notifyService.showErrorTimeout(this.locationErrorMessage, this.title);
				  }
			   );
  }
  
  getExpiredDevices(){
	this.deviceService.getExpiredDevices()
    .subscribe(devices =>{ 
			   this.devices = devices;
			   if(devices.length > 0){
				   for (var i = 0; i < devices.length; i++) { 
						this.deviceTotalPrice += devices[i].precio*devices[i].cantidad
				   }
				   this.setDataSource();
			   }
	          },
			   error => {
				  catchError(this.notifyService.handleError<ExpiredDevice>('getExpiredDevices'));
				  this.notifyService.showErrorTimeout(this.deviceErrorMessage, this.title);
				  }
			   );
	
  }
  
   setDataSource(){
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.devices);
	this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
	this.dataSource.sortingDataAccessor = (item, property) => {
			var sortingData= null;
			switch(property){
				case 'id':
					sortingData = item.id;
					break;
				case 'nombre':
					sortingData = item.nombre;
					break;
				case 'cantidad':
					sortingData = item.cantidad;
				case 'precio':
					sortingData = item.precio;
				default:
					sortingData = item[property];
					break;
			}
			return sortingData;
	};
  }
  
  getActiveMap(){
    this.mapService.getActiveMap()
    .subscribe(map =>{ 
				this.mapImageUrl = '../' + (map.imagen).split("saaacd/" , 2)[1];
	           },
			   error => {
				  catchError(this.notifyService.handleError<Mapa>('getActiveMap'));
				  this.notifyService.showErrorTimeout(this.mapErrorMessage, this.title);
				  }
			   );
  } 
  
  changeFutureDate(event) {
    console.log(event.value);
  }
  
    /*************** MAP VISUALIZATION ******************* ***/
  
  @ViewChild('img', { static: false }) img: ElementRef;
  onLoad(){
   this.loadedImageWidth = (this.img.nativeElement as HTMLImageElement).naturalWidth;
   this.loadedImageHeight = (this.img.nativeElement as HTMLImageElement).naturalHeight;
   if(this.mapImageUrl != ''){
	   this.createMap();
   }
   this.getMaterialMonitoringData();
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
    const dialogData = new MonitorDialogModel(id, title, false);
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
	if(parseInt(region.data,10) == 1)
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
  
  //---------------------------PDF
	public downloadPDF(): void {
		this.actionInProgress = true;
		const DATA = document.getElementById('htmlData');
		const doc = new jsPDF('p', 'pt', 'a4');
		//doc.text('Monitoreo de Material', 12, 12);
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
		  const pdfHeight = doc.internal.pageSize.getHeight() - 4 * bufferY;//(imgProps.height * pdfWidth) / imgProps.width;
		  doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
		  return doc;
		}).then((docResult) => {
		  this.actionInProgress =false;
		  docResult.save('MoniteroMaterial.pdf');
		});
  }

}