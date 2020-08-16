import { Component, OnInit, ViewChild, ElementRef, Renderer2, RendererFactory2, Inject } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { catchError} from 'rxjs/operators';

import { LocationService } from '../../services/location.service';
import { RegionService } from '../../services/region.service';
import { Ubicacion } from '../../models/Ubicacion';
import { Mapa } from '../../models/Mapa';
import { RegionGeografica } from '../../models/RegionGeografica';
import { NotificationService } from '../../services/notification.service';
import { MapService } from '../../services/map.service';
import { DOCUMENT } from '@angular/common'; 

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import Vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Projection from 'ol/proj/Projection';
import * as olExtent from 'ol/extent';
import {ScaleLine, defaults as defaultControls} from 'ol/control';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import VectorLayer from 'ol/layer/Vector';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Overlay from 'ol/Overlay';
import Collection from 'ol/Collection';
import Select from 'ol/interaction/Select';
import * as olEasing from 'ol/easing';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  mapImageUrl: string = ''; //'../static/media/mapas/findCont.png';//QUITARLO
  maps: Mapa[];
  regions ={'id':'0', 'name': '', 'regionList':[]};
  locations = [];
  superiorLocations : Ubicacion[];
  connectedTo = [];
  regionsConnectedTo = [];
  mapHashTable: Object = Object.create(null);
  mapTree: Array<any> =[];
  locationErrorMessage = 'No se ha podido mostrar las ubicaciones.';
  regionErrorMessage = 'No se ha podido mostrar las regiones.';
  mapErrorMessage = 'No se ha podido mostrar los mapas.';
  updateLocationsErrorMessage = 'No se ha podido asignar las regiones geográficas a las ubicaciones.';
  updateLocationsSuccessMessage = 'Se asignaron las regiones geográficas exitosamente.';
  title = 'Notificación';
  processedRegions : RegionGeografica[];
  processedImageId = 0;
  processedLocations : Ubicacion[];
  
  loadedImageWidth: number = 0;
  loadedImageHeight: number = 0;
  view: OlView = new OlView();
  imageLayer: ImageLayer = new ImageLayer();
  map: OlMap;
  vectorSource = new Vector();  
  featureCollection = {"type": "FeatureCollection","features": [], "totalFeatures": 0};
  selectedCollection = new Collection(); 
  htmlElement: HTMLElement;
  selectedButton=null;
  selectedMap: number;
  disableButton: boolean = true;
  
  ngOnInit(): void {
   console.log('ngOnInit');
   this.getMaps();
   this.getSuperiorLocations()
  }
  
  ngAfterViewInit(): void {
	console.log('ngAfterViewInit');
  }

  
  constructor(
    private locationService: LocationService,
	private regionService: RegionService,
  	private notifyService : NotificationService,
	private mapService: MapService, 
	private renderer: Renderer2,
	@Inject(DOCUMENT) document
	){
	console.log('constructor');
	this.connectedTo.push('0');

   /* this.locations = [
      {
        id: '1',
		name: 'J101',
        regionList:["item 1"]
      },{
        id: '2',
		name: 'J102',
        regionList:["item 2"]
      },{
        id: '3',
		name: 'J103',
        regionList:["item 3"]
      },{
        id: '4',
		name: 'J104',
        regionList:["item 4"]
      }
    ];
	for (let location of this.locations) {
      this.regionsConnectedTo.push(location.id);
	  this.connectedTo.push(location.id);
    };*/
  }
  
  assignLocationList(selectedSuperiorLocation: number){
    this.locationService.getLocationsBySuperiorLocation(selectedSuperiorLocation)
    .subscribe(locations =>{ 
				this.locations = [];
				const foundSuperiorLocation = this.superiorLocations.find(superiorLocation => superiorLocation.id == selectedSuperiorLocation);
				this.locations.push( {'id': selectedSuperiorLocation.toString(), 'name': foundSuperiorLocation.tipoUbicacion.nombre + " " + foundSuperiorLocation.nombre,'regionList':[]});
			    this.regionsConnectedTo.push(selectedSuperiorLocation.toString());
				this.connectedTo.push(selectedSuperiorLocation.toString());
				
				locations.forEach(location => {
					this.locations.push( {'id': location.id.toString(), 'name': location.tipoUbicacion.nombre + " " + location.nombre,'regionList':[]});
					this.regionsConnectedTo.push(location.id.toString());
				    this.connectedTo.push(location.id.toString());
				});
	           },
			   error => {
				  catchError(this.notifyService.handleError<Ubicacion>('getLocation'));
				  this.notifyService.showErrorTimeout(this.locationErrorMessage, this.title);
				  }
			   );
  } 
  
  getSuperiorLocations(){
    this.locationService.getSuperiorLocations()
    .subscribe(superiorLocations =>{ 
			    this.superiorLocations = superiorLocations;
	           },
			   error => {
				  catchError(this.notifyService.handleError<Ubicacion>('getLocation'));
				  this.notifyService.showErrorTimeout(this.locationErrorMessage, this.title);
				  }
			   );
  } 
  
  getMaps(){
    this.mapService.getMaps()
    .subscribe(maps =>{ 
				this.maps = maps;
				this.createMapCatalogue();
	           },
			   error => {
				  catchError(this.notifyService.handleError<Mapa>('getMaps'));
				  this.notifyService.showErrorTimeout(this.mapErrorMessage, this.title);
				  }
			   );
  } 
  
  changeMapImageUrl(selectedMap){
	if(selectedMap){
		const foundMap = this.maps.find(map => map.id == selectedMap);
		this.mapImageUrl ='../static/media/' + foundMap.imagen;
		this.disableButton = false;
	}else{
		this.mapImageUrl ='';
	}
  }

  drop(event: CdkDragDrop<string[]>) {
   console.log( event.container.data);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if(event.container.data.length === 0 ){
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
	
	console.log(this.locations);
  }
  
  regionDrop(event: CdkDragDrop<string[]>) {
	  //console.log( event.container.data);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else{
	
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
  
  createMapCatalogue(){
	this.maps.forEach( itemMap => {
		if(Object.entries(this.mapHashTable).find(map => (map[1].element.id == itemMap.tipoUbicacion.id)) == undefined){
			this.mapHashTable[itemMap.tipoUbicacion.id] = { element : itemMap.tipoUbicacion , children : [] } ;
			this.mapTree.push(this.mapHashTable[itemMap.tipoUbicacion.id]);
		}
	});
	
	this.maps.forEach( element => {
		this.mapHashTable[element.tipoUbicacion.id].children.push(element);
	});
  }
  
  getSavedData
  
  processMap(){
	
	this.regionService.getRegionsOnMap(this.selectedMap)
    .subscribe(regions =>{ 
				
				this.processedRegions = regions;
				this.regions ={
						id: '0',
						name: 'Regiones',
						regionList: regions
				};

				if(this.processedImageId > 0)
				{
				  this.clearMap();
				}
				this.drawElementsOnMap();
	            this.addMapInteraction();
				this.processedImageId = this.selectedMap;
	           },
			   error => {
				  catchError(this.notifyService.handleError<RegionGeografica>('getRegions'));
				  this.notifyService.showErrorTimeout(this.regionErrorMessage, this.title);
				  }
			   );
 }
 
   
  getRawLocation(locationId: number, region: RegionGeografica): any{
	let id=null;
	/*if(region.id)    //PENDIENTE
		id=region.id;*/
	let location = {
			  'id' : locationId,
			  'coordenada': region.coordenada,
			  'centroide': region.centroide,
			  'regionGeograficaId': id, 
			  'mapaId': this.selectedMap
			};
	return location;
   }
  
  save(){
 	let rawLocations = [];
    this.locations.forEach(location => {
		if(location.regionList.length > 0){
			let rawLocation = this.getRawLocation(location.id, location.regionList[0]);
			rawLocations.push(rawLocation);
		}
	});
	
	this.locationService.updateLocation(rawLocations)
				  .subscribe(
							response => {
							  console.log(response);
							  this.notifyService.showSuccessTimeout(this.updateLocationsSuccessMessage, this.title);
							  },
							error => {
							  catchError(this.notifyService.handleError<Ubicacion>('SaveLocations'));
							  this.notifyService.showErrorTimeout(this.updateLocationsErrorMessage, this.title);
							  });
	
	
  }
  
  /*
  goBack(): void {
    this.location.back();
  }
  
  cancel(event: any): void {
	event.preventDefault();
    this.location.back();
  }*/
  
/*************** MAP VISUALIZATION ******************* ***/
  
  @ViewChild('img', { static: false }) img: ElementRef;
  onLoad(){
   this.loadedImageWidth = (this.img.nativeElement as HTMLImageElement).naturalWidth;
   this.loadedImageHeight = (this.img.nativeElement as HTMLImageElement).naturalHeight;
   console.log(this.mapImageUrl);
   console.log(this.selectedMap);
	//Check if map not already exist
	if(this.map == null){
	   this.createMap();
	} 
	else 
	{   
		if(this.processedImageId > 0){
			if(this.processedImageId == this.selectedMap){
				this.changeVectorLayer();
				this.regions ={
						id: '0',
						name: 'Regiones',
						regionList: this.processedRegions
				};
				this.drawElementsOnMap();
				this.addMapInteraction();
			} else {
				this.clearMap();
				this.changeVectorLayer();
				this.regions ={
						id: '0',
						name: 'Regiones',
						regionList: []
				};
			}
		} 

	}
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
  
  clearMap(){
	 this.map.getInteractions().pop();
	 this.map.getOverlays().clear();
	 this.vectorSource.clear();
	 let oldContourVector = this.map.getLayers().getArray()[1];
	 this.map.removeLayer(oldContourVector);
  }
  
  changeVectorLayer(){
     //Change only vectorLayer (markers)
	 let extent = [0, 0, this.loadedImageWidth, this.loadedImageHeight]; 
	 let projection = new Projection({
		  code: 'map-image',
		  units: 'pixels',
		  extent: extent
		});
	 let oldVectorLayer = this.map.getLayers().getArray()[0];
	 let source = new ImageStatic({
							url: this.mapImageUrl,
							projection: projection,
							imageExtent: extent
						  })
     oldVectorLayer.setSource(source);
  }

  
//-------------------------DRAW ELEMENTS ON MAP
//-------DRAW CONTOURS
  drawElementsOnMap(){
	this.processedRegions.forEach(region => {
					let feature = new Feature({
						geometry: new Polygon(JSON.parse(region.coordenada)),
						id: region.id
					});
					this.vectorSource.addFeature(feature);
					
					
					// Use Angular's Renderer2 to create the div element
					var newDiv = this.renderer.createElement('div');
					// Set the id of the div
					this.renderer.setProperty(newDiv, 'id', 'region-' + region.id);
					this.renderer.setProperty(newDiv, 'textContent', region.id);

					let overlay = new Overlay({
					  position: JSON.parse(region.centroide), 
					  positioning: 'center-center',
					  element: newDiv,
					  stopEvent: false,
					});
					this.map.addOverlay(overlay);
				});
	// Fit to extent
	let extent = this.vectorSource.getExtent();
	if (!(extent[0] == Number.POSITIVE_INFINITY || extent[0] == Number.NEGATIVE_INFINITY)) {
	  this.view.fit(extent);
	}
	
	let stroke = new Stroke({ width:3, color:'blue' });
	let fill = new Fill({ color: [0, 0, 255, 0.1] });
	
	let vectorLayer = new VectorLayer({
		source: this.vectorSource,
		style: new Style(
			{	stroke: stroke,
				fill: fill
			})
	});
	this.map.addLayer(vectorLayer);
}

//ADD INTERACTION ON MAP
addMapInteraction(){
	let selectInteraction = new Select({
	  features: this.selectedCollection,
	  multi: false,
	  style: function(f) {
			return new Style({
			  fill: new Fill({
				color: "#40E0D0"
			  })})}
	});
	this.map.addInteraction(selectInteraction);

	this.selectedCollection.on('add', ({ element: feature }) => {

		if(this.selectedButton!=null){
		   var button = document.getElementById(this.selectedButton);
		   button.style.background="";
		}
		var buttonName="button-"+feature.values_.id;
		var button = document.getElementById(buttonName);
		button.style.background="#999";
		this.selectedButton = buttonName;
		});	

	this.selectedCollection.on('remove', ({ element: feature }) => {
		if(this.selectedButton!=null){
		   var button = document.getElementById(this.selectedButton);
		   button.style.background="";
		}
		var button = document.getElementById("button-"+feature.values_.id);
		button.style.background="";
		this.selectedButton=null;
		});	

}

// Pulse feature at button
 pulse(event, item){
    this.selectedCollection.clear();
	if(item!=null){
	   this.htmlElement = document.getElementById('button-'+item.id);
       this.htmlElement.style.background="";
	}

	var f = new Feature({
		geometry: new Polygon(JSON.parse(item.coordenada)),
	});

	f.setStyle(new Style({
		  fill: new Fill({
			color: "red"
		  })}));

    var fitOptions ={
	  duration: 2000,
	  easing: olEasing["easeOut"] 
	};
	this.map.getView().fit(f.getGeometry(), fitOptions);
  }

}
