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
  mapImageUrl: string = '../static/media/mapas/findCont.png';
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
  title = 'Notificación';
  
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
  
  ngOnInit(): void {
   console.log('ngOnInit');
   this.getMaps();
   this.getRegions();
   this.getSuperiorLocations()
   this.regions ={
			id: '0',
			name: 'Regions',
			regionList: this.featureCollection.features
    };
	
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
  
  processMap(){
	this.regionService.getRegionsOnMap(this.selectedMap)
    .subscribe(regions =>{ 
			    console.log(regions);
	           },
			   error => {
				  catchError(this.notifyService.handleError<RegionGeografica>('getRegions'));
				  this.notifyService.showErrorTimeout(this.regionErrorMessage, this.title);
				  }
			   );
 }
  
  save(){
  }
  
/*************** MAP VISUALIZATION ******************* ***/
  
  @ViewChild('img', { static: false }) img: ElementRef;
  onLoad() {
   console.log((this.img.nativeElement as HTMLImageElement).naturalWidth);
   console.log((this.img.nativeElement as HTMLImageElement).naturalHeight);
   this.loadedImageWidth = (this.img.nativeElement as HTMLImageElement).naturalWidth;
   this.loadedImageHeight = (this.img.nativeElement as HTMLImageElement).naturalHeight;
   this.createMap();
 }
  
  createMap(): void{
	let extent = [0, 0, this.loadedImageWidth, this.loadedImageHeight]; //1485, 1061] //

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
	//Check if map not already exist
   if(this.map == null)
   {
      this.map = new OlMap({
		  target: 'map',
		  layers: [imageLayer],
		  view: this.view
	  });
	  this.drawElementsOnMap();
	  this.addMapInteraction();
	}
	else //Change only vectorLayer (markers)
	{
	 this.map.getInteractions().pop();
	 this.map.getOverlays().clear();
	 let oldContourVector = this.map.getLayers().getArray()[1];
	 this.map.removeLayer(oldContourVector);
	 
	 let oldVectorLayer = this.map.getLayers().getArray()[0];
	 let source = new ImageStatic({
							url: this.mapImageUrl,
							projection: projection,
							imageExtent: extent
						  })
     oldVectorLayer.setSource(source);
	}

  }

  
//-------------------------DRAW ELEMENTS ON MAP
//-------DRAW CONTOURS
  drawElementsOnMap(){
	this.featureCollection.features.forEach(region => {
					let feature = new Feature({
						geometry: new Polygon(region.geometry.coordinates),
						id: region.id,
						geometry_name: region.geometry_name
					});
					this.vectorSource.addFeature(feature);
					
					
					// Use Angular's Renderer2 to create the div element
					var newDiv = this.renderer.createElement('div');
					// Set the id of the div
					this.renderer.setProperty(newDiv, 'id', 'region-' + region.id);
					//this.renderer.setProperty(newDiv,'z-index', 9999);
					this.renderer.setProperty(newDiv, 'textContent', region.id);
					// Append the created div to the body element
					//this.renderer.appendChild(document.body, newDiv);
					
					
					
					let centroid = region.properties.centroid;
					//let newDiv = angular.element("<div id='number"+index+"'></div>");
					let overlay = new Overlay({
					  position: [centroid[0],centroid[1]],
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
		geometry: new Polygon(item.geometry.coordinates),
	});

	f.setStyle(new Style({
		  fill: new Fill({
			color: "red"
		  })}));
	
	//this.selectedCollection.push(f);
	
	var fitOptions ={
	  duration: 2000,
	  easing: olEasing["easeOut"] 
	};
	this.map.getView().fit(f.getGeometry(), fitOptions);
	/*this.map.animateFeature (f
	, new ol.featureAnimation.Zoom({
	  fade: olEasing.easeOut, 
	  duration: 2000,
	  easing: olEasing["easeOut"] 
	}));*/
  }
 
 getRegions(){
	
	this.featureCollection = { "type": "FeatureCollection","features": [
{ "type": "Feature", "id": 1, "geometry_name": 1, "geometry": { "type": "Polygon", "coordinates": [[ 
[466,665],[465,666],[464,666],[464,667],[463,668],[463,671],[464,672],[464,890],[463,891],[463,894],[464,895],[464,896],[471,896],[472,895],[795,895],[796,896],[798,896],[799,895],[802,895],[803,894],[806,897],[806,900],[805,901],[805,952],[804,953],[804,956],[805,957],[805,958],[812,958],[813,957],[873,957],[874,958],[881,958],[881,951],[880,950],[880,906],[881,905],[881,903],[880,902],[880,899],[879,898],[883,894],[884,895],[887,895],[888,896],[890,896],[891,895],[1460,895],[1461,896],[1468,896],[1468,889],[1467,888],[1467,674],[1468,673],[1468,666],[1467,666],[1466,665],[1463,665],[1462,666],[470,666],[469,665], ]]}, "properties": {"centroid": [866,847]}},
{ "type": "Feature", "id": 2, "geometry_name": 2, "geometry": { "type": "Polygon", "coordinates": [[ 
[1385,795],[1384,796],[1382,796],[1381,797],[1380,797],[1378,799],[1378,800],[1377,801],[1377,803],[1376,804],[1376,809],[1377,810],[1377,869],[1376,870],[1376,875],[1377,876],[1377,878],[1378,879],[1378,880],[1380,882],[1451,882],[1454,879],[1454,800],[1451,797],[1450,797],[1449,796],[1447,796],[1446,795],[1443,795],[1442,796],[1389,796],[1388,795], ]]}, "properties": {"centroid": [1401,823]}},
{ "type": "Feature", "id": 3, "geometry_name": 3, "geometry": { "type": "Polygon", "coordinates": [[ 
[1303,795],[1302,796],[1300,796],[1299,797],[1298,797],[1296,799],[1296,800],[1295,801],[1295,878],[1296,879],[1296,880],[1298,882],[1369,882],[1371,880],[1371,878],[1372,877],[1372,868],[1371,867],[1371,812],[1372,811],[1372,802],[1371,801],[1371,799],[1369,797],[1368,797],[1367,796],[1365,796],[1364,795],[1361,795],[1360,796],[1307,796],[1306,795], ]]}, "properties": {"centroid": [1338,823]}},
{ "type": "Feature", "id": 4, "geometry_name": 4, "geometry": { "type": "Polygon", "coordinates": [[ 
[1222,795],[1221,796],[1219,796],[1218,797],[1217,797],[1215,799],[1215,800],[1214,801],[1214,802],[1213,803],[1213,876],[1214,877],[1214,878],[1215,879],[1215,880],[1217,882],[1236,882],[1237,883],[1276,883],[1277,882],[1288,882],[1290,880],[1290,799],[1288,797],[1287,797],[1286,796],[1284,796],[1283,795],[1280,795],[1279,796],[1226,796],[1225,795], ]]}, "properties": {"centroid": [1243,828]}},
{ "type": "Feature", "id": 5, "geometry_name": 5, "geometry": { "type": "Polygon", "coordinates": [[ 
[1139,795],[1138,796],[1136,796],[1135,797],[1134,797],[1132,799],[1132,800],[1131,801],[1131,878],[1132,879],[1132,880],[1134,882],[1152,882],[1153,883],[1190,883],[1191,882],[1205,882],[1207,880],[1207,879],[1208,878],[1208,801],[1207,800],[1207,799],[1205,797],[1204,797],[1203,796],[1201,796],[1200,795],[1197,795],[1196,796],[1143,796],[1142,795], ]]}, "properties": {"centroid": [1169,828]}},
{ "type": "Feature", "id": 6, "geometry_name": 6, "geometry": { "type": "Polygon", "coordinates": [[ 
[1058,794],[1057,795],[1055,795],[1054,796],[1053,796],[1051,798],[1051,799],[1050,800],[1050,802],[1049,803],[1049,808],[1050,809],[1050,868],[1049,869],[1049,874],[1050,875],[1050,877],[1051,878],[1051,879],[1053,881],[1057,881],[1058,882],[1061,882],[1062,881],[1069,881],[1070,882],[1108,882],[1109,881],[1115,881],[1116,882],[1119,882],[1120,881],[1124,881],[1126,879],[1126,798],[1124,796],[1123,796],[1122,795],[1120,795],[1119,794],[1116,794],[1115,795],[1062,795],[1061,794], ]]}, "properties": {"centroid": [1078,838]}},
{ "type": "Feature", "id": 7, "geometry_name": 7, "geometry": { "type": "Polygon", "coordinates": [[ 
[976,794],[975,795],[973,795],[972,796],[971,796],[969,798],[969,799],[968,800],[968,802],[967,803],[967,808],[968,809],[968,868],[967,869],[967,874],[968,875],[968,877],[969,878],[969,879],[971,881],[975,881],[976,882],[979,882],[980,881],[989,881],[990,882],[1026,882],[1027,881],[1033,881],[1034,882],[1037,882],[1038,881],[1042,881],[1044,879],[1044,877],[1045,876],[1045,867],[1044,866],[1044,811],[1045,810],[1045,801],[1044,800],[1044,798],[1042,796],[1041,796],[1040,795],[1038,795],[1037,794],[1034,794],[1033,795],[980,795],[979,794], ]]}, "properties": {"centroid": [1003,838]}},
{ "type": "Feature", "id": 8, "geometry_name": 8, "geometry": { "type": "Polygon", "coordinates": [[ 
[894,794],[893,795],[891,795],[890,796],[889,796],[887,798],[887,799],[886,800],[886,802],[885,803],[885,808],[886,809],[886,868],[885,869],[885,874],[886,875],[886,877],[887,878],[887,879],[889,881],[893,881],[894,882],[897,882],[898,881],[904,881],[905,882],[956,882],[957,881],[960,881],[962,879],[962,877],[963,876],[963,857],[962,856],[962,811],[963,810],[963,801],[962,800],[962,798],[960,796],[959,796],[958,795],[956,795],[955,794],[952,794],[951,795],[898,795],[897,794], ]]}, "properties": {"centroid": [919,834]}},
{ "type": "Feature", "id": 9, "geometry_name": 9, "geometry": { "type": "Polygon", "coordinates": [[ 
[812,794],[811,795],[809,795],[808,796],[807,796],[805,798],[805,799],[804,800],[804,801],[803,802],[803,875],[804,876],[804,877],[805,878],[805,879],[807,881],[809,881],[810,882],[875,882],[876,881],[878,881],[880,879],[880,877],[881,876],[881,867],[880,866],[880,811],[881,810],[881,801],[880,800],[880,798],[878,796],[877,796],[876,795],[874,795],[873,794],[870,794],[869,795],[816,795],[815,794], ]]}, "properties": {"centroid": [842,829]}},
{ "type": "Feature", "id": 10, "geometry_name": 10, "geometry": { "type": "Polygon", "coordinates": [[ 
[729,794],[728,795],[726,795],[725,796],[724,796],[722,798],[722,799],[721,800],[721,877],[722,878],[722,879],[724,881],[728,881],[729,882],[732,882],[733,881],[739,881],[740,882],[782,882],[783,881],[785,881],[786,882],[790,882],[791,881],[795,881],[797,879],[797,878],[798,877],[798,800],[797,799],[797,798],[795,796],[794,796],[793,795],[791,795],[790,794],[787,794],[786,795],[733,795],[732,794], ]]}, "properties": {"centroid": [759,838]}},
{ "type": "Feature", "id": 11, "geometry_name": 11, "geometry": { "type": "Polygon", "coordinates": [[ 
[649,793],[648,794],[646,794],[645,795],[644,795],[642,797],[642,798],[641,799],[641,801],[640,802],[640,807],[641,808],[641,867],[640,868],[640,873],[641,874],[641,876],[642,877],[642,878],[644,880],[646,880],[647,881],[654,881],[655,880],[659,880],[660,881],[711,881],[712,880],[714,880],[716,878],[716,797],[714,795],[713,795],[712,794],[710,794],[709,793],[706,793],[705,794],[653,794],[652,793], ]]}, "properties": {"centroid": [665,833]}},
{ "type": "Feature", "id": 12, "geometry_name": 12, "geometry": { "type": "Polygon", "coordinates": [[ 
[488,793],[487,794],[485,794],[484,795],[483,795],[480,798],[480,799],[479,800],[479,802],[478,803],[478,806],[479,807],[479,868],[478,869],[478,872],[479,873],[479,875],[480,876],[480,877],[483,880],[485,880],[486,881],[493,881],[494,880],[498,880],[499,881],[541,881],[542,880],[543,881],[551,881],[552,880],[553,880],[554,879],[555,879],[555,878],[556,877],[556,876],[558,874],[560,876],[560,877],[561,878],[561,879],[562,879],[563,880],[564,880],[565,881],[572,881],[573,880],[575,880],[576,881],[618,881],[619,880],[622,880],[623,881],[630,881],[631,880],[633,880],[635,878],[635,876],[636,875],[636,866],[635,865],[635,810],[636,809],[636,800],[635,799],[635,797],[633,795],[632,795],[631,794],[629,794],[628,793],[625,793],[624,794],[571,794],[570,793],[567,793],[566,794],[565,794],[564,795],[563,795],[562,796],[561,796],[561,797],[560,798],[560,799],[559,800],[557,800],[556,799],[556,798],[555,797],[555,796],[554,796],[553,795],[552,795],[551,794],[550,794],[549,793],[546,793],[545,794],[492,794],[491,793], ]]}, "properties": {"centroid": [554,836]}},
{ "type": "Feature", "id": 13, "geometry_name": 13, "geometry": { "type": "Polygon", "coordinates": [[ 
[1386,680],[1385,681],[1383,681],[1382,682],[1381,682],[1379,684],[1379,685],[1378,686],[1378,687],[1377,688],[1377,761],[1378,762],[1378,763],[1379,764],[1379,765],[1381,767],[1383,767],[1384,768],[1391,768],[1392,767],[1398,767],[1399,768],[1432,768],[1433,767],[1441,767],[1442,768],[1449,768],[1450,767],[1452,767],[1454,765],[1454,764],[1455,763],[1455,686],[1454,685],[1454,684],[1452,682],[1451,682],[1450,681],[1448,681],[1447,680],[1444,680],[1443,681],[1390,681],[1389,680], ]]}, "properties": {"centroid": [1412,724]}},
{ "type": "Feature", "id": 14, "geometry_name": 14, "geometry": { "type": "Polygon", "coordinates": [[ 
[1303,680],[1302,681],[1300,681],[1299,682],[1298,682],[1296,684],[1296,685],[1295,686],[1295,763],[1296,764],[1296,765],[1298,767],[1300,767],[1301,768],[1308,768],[1309,767],[1316,767],[1317,768],[1354,768],[1355,767],[1358,767],[1359,768],[1366,768],[1367,767],[1369,767],[1371,765],[1371,764],[1372,763],[1372,686],[1371,685],[1371,684],[1369,682],[1368,682],[1367,681],[1365,681],[1364,680],[1361,680],[1360,681],[1307,681],[1306,680], ]]}, "properties": {"centroid": [1333,724]}},
{ "type": "Feature", "id": 15, "geometry_name": 15, "geometry": { "type": "Polygon", "coordinates": [[ 
[1222,680],[1221,681],[1219,681],[1218,682],[1217,682],[1215,684],[1215,685],[1214,686],[1214,687],[1213,688],[1213,761],[1214,762],[1214,763],[1215,764],[1215,765],[1217,767],[1219,767],[1220,768],[1227,768],[1228,767],[1233,767],[1234,768],[1285,768],[1286,767],[1288,767],[1290,765],[1290,684],[1288,682],[1287,682],[1286,681],[1284,681],[1283,680],[1280,680],[1279,681],[1226,681],[1225,680], ]]}, "properties": {"centroid": [1241,719]}},
{ "type": "Feature", "id": 16, "geometry_name": 16, "geometry": { "type": "Polygon", "coordinates": [[ 
[1139,680],[1138,681],[1136,681],[1135,682],[1134,682],[1132,684],[1132,685],[1131,686],[1131,763],[1132,764],[1132,765],[1134,767],[1136,767],[1137,768],[1144,768],[1145,767],[1194,767],[1195,768],[1202,768],[1203,767],[1205,767],[1207,765],[1207,764],[1208,763],[1208,686],[1207,685],[1207,684],[1205,682],[1204,682],[1203,681],[1201,681],[1200,680],[1197,680],[1196,681],[1143,681],[1142,680], ]]}, "properties": {"centroid": [1169,719]}},
{ "type": "Feature", "id": 17, "geometry_name": 17, "geometry": { "type": "Polygon", "coordinates": [[ 
[1055,680],[1054,681],[1053,681],[1051,683],[1051,684],[1050,685],[1050,687],[1049,688],[1049,693],[1050,694],[1050,753],[1049,754],[1049,759],[1050,760],[1050,762],[1051,763],[1051,764],[1053,766],[1055,766],[1056,767],[1063,767],[1064,766],[1068,766],[1069,767],[1121,767],[1122,766],[1124,766],[1126,764],[1126,683],[1124,681],[1123,681],[1122,680], ]]}, "properties": {"centroid": [1071,728]}},
{ "type": "Feature", "id": 18, "geometry_name": 18, "geometry": { "type": "Polygon", "coordinates": [[ 
[973,680],[972,681],[971,681],[969,683],[969,684],[968,685],[968,687],[967,688],[967,693],[968,694],[968,753],[967,754],[967,759],[968,760],[968,762],[969,763],[969,764],[971,766],[973,766],[974,767],[981,767],[982,766],[987,766],[988,767],[1025,767],[1026,766],[1031,766],[1032,767],[1039,767],[1040,766],[1042,766],[1044,764],[1044,762],[1045,761],[1045,752],[1044,751],[1044,696],[1045,695],[1045,686],[1044,685],[1044,683],[1042,681],[1041,681],[1040,680], ]]}, "properties": {"centroid": [1002,731]}},
{ "type": "Feature", "id": 19, "geometry_name": 19, "geometry": { "type": "Polygon", "coordinates": [[ 
[891,680],[890,681],[889,681],[887,683],[887,684],[886,685],[886,687],[885,688],[885,693],[886,694],[886,753],[885,754],[885,759],[886,760],[886,762],[887,763],[887,764],[889,766],[891,766],[892,767],[899,767],[900,766],[905,766],[906,767],[944,767],[945,766],[949,766],[950,767],[957,767],[958,766],[960,766],[962,764],[962,762],[963,761],[963,752],[962,751],[962,696],[963,695],[963,686],[962,685],[962,683],[960,681],[959,681],[958,680], ]]}, "properties": {"centroid": [920,731]}},
{ "type": "Feature", "id": 20, "geometry_name": 20, "geometry": { "type": "Polygon", "coordinates": [[ 
[809,680],[808,681],[807,681],[805,683],[805,684],[804,685],[804,686],[803,687],[803,760],[804,761],[804,762],[805,763],[805,764],[807,766],[809,766],[810,767],[817,767],[818,766],[867,766],[868,767],[875,767],[876,766],[878,766],[880,764],[880,762],[881,761],[881,752],[880,751],[880,696],[881,695],[881,686],[880,685],[880,683],[878,681],[877,681],[876,680], ]]}, "properties": {"centroid": [842,728]}},
{ "type": "Feature", "id": 21, "geometry_name": 21, "geometry": { "type": "Polygon", "coordinates": [[ 
[726,680],[725,681],[724,681],[722,683],[722,684],[721,685],[721,762],[722,763],[722,764],[724,766],[726,766],[727,767],[734,767],[735,766],[741,766],[742,767],[779,767],[780,766],[784,766],[785,767],[792,767],[793,766],[795,766],[797,764],[797,763],[798,762],[798,685],[797,684],[797,683],[795,681],[794,681],[793,680], ]]}, "properties": {"centroid": [759,734]}},
{ "type": "Feature", "id": 22, "geometry_name": 22, "geometry": { "type": "Polygon", "coordinates": [[ 
[646,679],[645,680],[644,680],[642,682],[642,683],[641,684],[641,686],[640,687],[640,692],[641,693],[641,752],[640,753],[640,758],[641,759],[641,761],[642,762],[642,763],[644,765],[646,765],[647,766],[654,766],[655,765],[658,765],[659,766],[701,766],[702,765],[703,766],[711,766],[712,765],[714,765],[716,763],[716,682],[714,680],[713,680],[712,679], ]]}, "properties": {"centroid": [665,731]}},
{ "type": "Feature", "id": 23, "geometry_name": 23, "geometry": { "type": "Polygon", "coordinates": [[ 
[564,679],[563,680],[562,680],[559,683],[559,684],[558,685],[558,687],[557,688],[557,691],[558,692],[558,753],[557,754],[557,757],[558,758],[558,760],[559,761],[559,762],[562,765],[564,765],[565,766],[572,766],[573,765],[580,765],[581,766],[615,766],[616,765],[622,765],[623,766],[630,766],[631,765],[633,765],[635,763],[635,761],[636,760],[636,751],[635,750],[635,695],[636,694],[636,685],[635,684],[635,682],[633,680],[632,680],[631,679], ]]}, "properties": {"centroid": [593,730]}},
{ "type": "Feature", "id": 24, "geometry_name": 24, "geometry": { "type": "Polygon", "coordinates": [[ 
[567,799],[566,800],[565,800],[564,801],[564,802],[563,803],[563,804],[564,805],[564,870],[563,871],[563,872],[564,873],[564,874],[565,875],[569,875],[570,874],[577,874],[578,875],[616,875],[617,874],[625,874],[626,875],[630,875],[631,874],[631,870],[630,869],[630,806],[631,805],[631,801],[630,800],[629,800],[628,799],[627,800],[624,800],[623,801],[621,801],[620,800],[575,800],[574,801],[572,801],[571,800],[568,800], ]]}, "properties": {"centroid": [594,832]}},
{ "type": "Feature", "id": 25, "geometry_name": 25, "geometry": { "type": "Polygon", "coordinates": [[ 
[488,799],[487,800],[486,800],[485,801],[485,802],[484,803],[485,804],[485,807],[486,808],[486,810],[485,811],[485,864],[486,865],[486,867],[485,868],[485,871],[484,872],[485,873],[485,874],[486,875],[490,875],[491,874],[500,874],[501,875],[539,875],[540,874],[546,874],[547,875],[551,875],[552,874],[552,869],[551,868],[551,807],[552,806],[552,801],[551,800],[550,800],[549,799],[548,800],[545,800],[544,801],[542,801],[541,800],[496,800],[495,801],[493,801],[492,800],[489,800], ]]}, "properties": {"centroid": [511,832]}},
{ "type": "Feature", "id": 26, "geometry_name": 26, "geometry": { "type": "Polygon", "coordinates": [[ 
[13,665],[12,666],[11,666],[10,667],[10,671],[11,672],[11,986],[10,987],[10,991],[12,993],[15,993],[16,992],[18,992],[19,991],[222,991],[223,992],[225,992],[226,991],[229,991],[230,990],[233,993],[233,996],[232,997],[232,1048],[231,1049],[231,1053],[233,1055],[236,1055],[237,1054],[239,1054],[240,1053],[300,1053],[301,1054],[303,1054],[304,1055],[307,1055],[309,1053],[309,1050],[308,1049],[308,1047],[307,1046],[307,1002],[308,1001],[308,999],[307,998],[307,995],[306,994],[310,990],[311,991],[314,991],[315,992],[317,992],[318,991],[445,991],[446,992],[448,992],[449,993],[452,993],[454,991],[454,988],[453,987],[453,985],[452,984],[452,674],[453,673],[453,671],[454,670],[454,667],[453,666],[452,666],[451,665],[449,665],[448,666],[16,666],[15,665], ]]}, "properties": {"centroid": [266,928]}},
{ "type": "Feature", "id": 27, "geometry_name": 27, "geometry": { "type": "Polygon", "coordinates": [[ 
[370,890],[369,891],[367,891],[366,892],[365,892],[363,894],[363,895],[362,896],[362,973],[363,974],[363,975],[365,977],[367,977],[368,978],[373,978],[374,977],[380,977],[381,978],[420,978],[421,977],[427,977],[428,978],[433,978],[434,977],[436,977],[437,976],[438,976],[438,975],[439,974],[439,895],[438,894],[438,893],[437,893],[436,892],[435,892],[434,891],[432,891],[431,890],[429,890],[428,891],[373,891],[372,890], ]]}, "properties": {"centroid": [402,934]}},
{ "type": "Feature", "id": 28, "geometry_name": 28, "geometry": { "type": "Polygon", "coordinates": [[ 
[289,889],[288,890],[286,890],[285,891],[284,891],[282,893],[282,894],[281,895],[281,896],[280,897],[280,903],[281,904],[281,963],[280,964],[280,970],[281,971],[281,972],[282,973],[282,974],[284,976],[286,976],[287,977],[294,977],[295,976],[296,976],[297,977],[352,977],[353,976],[355,976],[357,974],[357,893],[355,891],[354,891],[353,890],[351,890],[350,889],[348,889],[347,890],[292,890],[291,889], ]]}, "properties": {"centroid": [305,929]}},
{ "type": "Feature", "id": 29, "geometry_name": 29, "geometry": { "type": "Polygon", "coordinates": [[ 
[207,889],[206,890],[204,890],[203,891],[202,891],[200,893],[200,894],[199,895],[199,896],[198,897],[198,903],[199,904],[199,963],[198,964],[198,970],[199,971],[199,972],[200,973],[200,974],[202,976],[204,976],[205,977],[212,977],[213,976],[214,976],[215,977],[270,977],[271,976],[273,976],[275,974],[275,973],[276,972],[276,962],[275,961],[275,906],[276,905],[276,895],[275,894],[275,893],[273,891],[272,891],[271,890],[269,890],[268,889],[266,889],[265,890],[210,890],[209,889], ]]}, "properties": {"centroid": [232,929]}},
{ "type": "Feature", "id": 30, "geometry_name": 30, "geometry": { "type": "Polygon", "coordinates": [[ 
[125,889],[124,890],[122,890],[121,891],[120,891],[119,892],[118,892],[118,893],[117,894],[117,895],[116,896],[116,898],[115,899],[115,900],[116,901],[116,966],[115,967],[115,968],[116,969],[116,971],[117,972],[117,973],[118,974],[118,975],[119,975],[120,976],[122,976],[123,977],[188,977],[189,976],[191,976],[193,974],[193,973],[194,972],[194,962],[193,961],[193,906],[194,905],[194,895],[193,894],[193,893],[191,891],[190,891],[189,890],[187,890],[186,889],[184,889],[183,890],[128,890],[127,889], ]]}, "properties": {"centroid": [147,926]}},
{ "type": "Feature", "id": 31, "geometry_name": 31, "geometry": { "type": "Polygon", "coordinates": [[ 
[39,889],[38,890],[36,890],[35,891],[34,891],[33,892],[32,892],[32,893],[31,894],[31,895],[30,896],[30,898],[29,899],[29,901],[30,902],[30,965],[29,966],[29,968],[30,969],[30,971],[31,972],[31,973],[32,974],[32,975],[33,975],[34,976],[36,976],[37,977],[91,977],[92,976],[95,976],[96,977],[102,977],[103,976],[105,976],[106,975],[107,975],[107,974],[108,973],[108,971],[109,970],[109,965],[108,964],[108,903],[109,902],[109,897],[108,896],[108,894],[107,893],[107,892],[106,892],[105,891],[104,891],[103,890],[101,890],[100,889],[98,889],[97,890],[42,890],[41,889], ]]}, "properties": {"centroid": [68,930]}},
{ "type": "Feature", "id": 32, "geometry_name": 32, "geometry": { "type": "Polygon", "coordinates": [[ 
[370,777],[369,778],[367,778],[366,779],[365,779],[363,781],[363,782],[362,783],[362,860],[363,861],[363,862],[365,864],[367,864],[368,865],[433,865],[434,864],[436,864],[437,863],[438,863],[438,862],[439,861],[439,782],[438,781],[438,780],[437,780],[436,779],[435,779],[434,778],[432,778],[431,777],[429,777],[428,778],[373,778],[372,777], ]]}, "properties": {"centroid": [402,811]}},
{ "type": "Feature", "id": 33, "geometry_name": 33, "geometry": { "type": "Polygon", "coordinates": [[ 
[289,776],[288,777],[286,777],[285,778],[284,778],[282,780],[282,781],[281,782],[281,783],[280,784],[280,790],[281,791],[281,850],[280,851],[280,857],[281,858],[281,859],[282,860],[282,861],[284,863],[286,863],[287,864],[352,864],[353,863],[355,863],[357,861],[357,780],[355,778],[354,778],[353,777],[351,777],[350,776],[348,776],[347,777],[292,777],[291,776], ]]}, "properties": {"centroid": [306,810]}},
{ "type": "Feature", "id": 34, "geometry_name": 34, "geometry": { "type": "Polygon", "coordinates": [[ 
[207,776],[206,777],[204,777],[203,778],[202,778],[200,780],[200,781],[199,782],[199,783],[198,784],[198,790],[199,791],[199,850],[198,851],[198,857],[199,858],[199,859],[200,860],[200,861],[202,863],[204,863],[205,864],[270,864],[271,863],[273,863],[275,861],[275,860],[276,859],[276,849],[275,848],[275,793],[276,792],[276,782],[275,781],[275,780],[273,778],[272,778],[271,777],[269,777],[268,776],[266,776],[265,777],[210,777],[209,776], ]]}, "properties": {"centroid": [233,812]}},
{ "type": "Feature", "id": 35, "geometry_name": 35, "geometry": { "type": "Polygon", "coordinates": [[ 
[125,776],[124,777],[122,777],[121,778],[120,778],[119,779],[118,779],[118,780],[117,781],[117,782],[116,783],[116,785],[115,786],[115,788],[116,789],[116,852],[115,853],[115,855],[116,856],[116,858],[117,859],[117,860],[118,861],[118,862],[119,862],[120,863],[122,863],[123,864],[178,864],[179,863],[180,863],[181,864],[188,864],[189,863],[191,863],[193,861],[193,860],[194,859],[194,849],[193,848],[193,793],[194,792],[194,782],[193,781],[193,780],[191,778],[190,778],[189,777],[187,777],[186,776],[184,776],[183,777],[128,777],[127,776], ]]}, "properties": {"centroid": [149,817]}},
{ "type": "Feature", "id": 36, "geometry_name": 36, "geometry": { "type": "Polygon", "coordinates": [[ 
[367,678],[366,679],[365,679],[363,681],[363,682],[362,683],[362,760],[363,761],[363,762],[365,764],[367,764],[368,765],[433,765],[434,764],[436,764],[437,763],[438,763],[438,762],[439,761],[439,682],[438,681],[438,680],[437,680],[436,679],[435,679],[434,678], ]]}, "properties": {"centroid": [403,721]}},
{ "type": "Feature", "id": 37, "geometry_name": 37, "geometry": { "type": "Polygon", "coordinates": [[ 
[287,677],[286,678],[285,678],[284,679],[283,679],[282,680],[282,681],[281,682],[281,683],[280,684],[280,690],[281,691],[281,750],[280,751],[280,757],[281,758],[281,759],[282,760],[282,761],[284,763],[286,763],[287,764],[294,764],[295,763],[296,763],[297,764],[352,764],[353,763],[355,763],[357,761],[357,680],[356,679],[355,679],[354,678],[353,678],[352,677], ]]}, "properties": {"centroid": [303,720]}},
{ "type": "Feature", "id": 38, "geometry_name": 38, "geometry": { "type": "Polygon", "coordinates": [[ 
[205,677],[204,678],[203,678],[202,679],[201,679],[200,680],[200,681],[199,682],[199,683],[198,684],[198,690],[199,691],[199,750],[198,751],[198,757],[199,758],[199,759],[200,760],[200,761],[202,763],[204,763],[205,764],[260,764],[261,763],[262,763],[263,764],[270,764],[271,763],[273,763],[275,761],[275,760],[276,759],[276,749],[275,748],[275,693],[276,692],[276,682],[275,681],[275,680],[274,679],[273,679],[272,678],[271,678],[270,677], ]]}, "properties": {"centroid": [236,720]}},
{ "type": "Feature", "id": 39, "geometry_name": 39, "geometry": { "type": "Polygon", "coordinates": [[ 
[123,677],[122,678],[121,678],[120,679],[119,679],[117,681],[117,682],[116,683],[116,685],[115,686],[115,688],[116,689],[116,752],[115,753],[115,755],[116,756],[116,758],[117,759],[117,760],[118,761],[118,762],[119,762],[120,763],[122,763],[123,764],[130,764],[131,763],[132,763],[133,764],[188,764],[189,763],[191,763],[193,761],[193,760],[194,759],[194,749],[193,748],[193,693],[194,692],[194,682],[193,681],[193,680],[192,679],[191,679],[190,678],[189,678],[188,677], ]]}, "properties": {"centroid": [147,723]}},
{ "type": "Feature", "id": 40, "geometry_name": 40, "geometry": { "type": "Polygon", "coordinates": [[ 
[316,952],[315,953],[314,953],[314,954],[313,955],[313,956],[314,957],[314,958],[315,959],[315,965],[316,966],[320,966],[321,965],[322,965],[323,964],[324,965],[326,965],[327,966],[330,966],[331,965],[331,964],[333,962],[334,962],[338,966],[342,966],[342,965],[343,964],[343,955],[342,954],[341,954],[340,953],[339,954],[338,954],[335,957],[332,957],[331,956],[331,955],[330,954],[329,954],[328,953],[327,953],[325,955],[325,956],[324,957],[324,958],[323,959],[321,959],[320,958],[320,955],[319,954],[319,953],[318,952], ]]}, "properties": {"centroid": [326,958]}},
{ "type": "Feature", "id": 41, "geometry_name": 41, "geometry": { "type": "Polygon", "coordinates": [[ 
[164,739],[163,740],[162,740],[162,741],[161,742],[161,743],[160,744],[160,745],[159,746],[158,746],[157,745],[157,744],[156,743],[156,742],[154,740],[151,740],[151,741],[150,742],[150,743],[149,744],[149,747],[148,748],[146,748],[144,746],[144,741],[143,740],[141,740],[139,742],[139,743],[138,744],[138,747],[136,749],[136,750],[135,751],[136,752],[136,753],[142,753],[143,752],[157,752],[158,751],[160,751],[161,752],[162,752],[163,753],[167,753],[167,742],[166,741],[166,740],[165,740], ]]}, "properties": {"centroid": [152,745]}},
{ "type": "Feature", "id": 42, "geometry_name": 42, "geometry": { "type": "Polygon", "coordinates": [[ 
[909,516],[908,517],[907,517],[907,518],[906,519],[906,522],[907,523],[907,652],[906,653],[906,656],[907,657],[907,658],[914,658],[915,657],[1225,657],[1226,658],[1233,658],[1233,651],[1232,650],[1232,525],[1233,524],[1233,517],[1232,517],[1231,516],[1228,516],[1227,517],[913,517],[912,516], ]]}, "properties": {"centroid": [1046,577]}},
{ "type": "Feature", "id": 43, "geometry_name": 43, "geometry": { "type": "Polygon", "coordinates": [[ 
[1192,574],[1191,575],[1189,575],[1188,576],[1187,576],[1186,577],[1186,578],[1185,579],[1185,581],[1184,582],[1184,588],[1185,589],[1185,591],[1186,592],[1186,593],[1187,594],[1189,594],[1190,595],[1196,595],[1197,594],[1198,594],[1199,593],[1199,588],[1198,588],[1197,587],[1196,587],[1195,588],[1191,588],[1189,586],[1189,584],[1192,581],[1193,581],[1195,583],[1198,583],[1199,582],[1199,577],[1198,576],[1197,576],[1196,575],[1195,575],[1194,574], ]]}, "properties": {"centroid": [1191,584]}},
{ "type": "Feature", "id": 44, "geometry_name": 44, "geometry": { "type": "Polygon", "coordinates": [[ 
[1170,574],[1169,575],[1167,575],[1166,576],[1165,576],[1165,577],[1164,578],[1164,582],[1165,583],[1165,587],[1164,588],[1164,592],[1165,593],[1165,594],[1167,594],[1168,595],[1176,595],[1177,594],[1179,594],[1179,593],[1180,592],[1180,578],[1178,576],[1177,576],[1176,575],[1173,575],[1172,574], ]]}, "properties": {"centroid": [1170,583]}},
{ "type": "Feature", "id": 45, "geometry_name": 45, "geometry": { "type": "Polygon", "coordinates": [[ 
[1126,574],[1125,575],[1124,575],[1123,576],[1122,576],[1121,577],[1121,578],[1120,579],[1121,580],[1121,582],[1122,583],[1122,586],[1121,587],[1121,589],[1120,590],[1120,592],[1121,593],[1121,594],[1122,595],[1128,595],[1128,594],[1129,593],[1129,589],[1128,588],[1128,587],[1127,586],[1127,584],[1130,581],[1137,581],[1139,583],[1139,589],[1140,590],[1140,591],[1141,592],[1141,593],[1142,594],[1143,594],[1144,595],[1148,595],[1151,592],[1151,590],[1152,589],[1152,586],[1153,585],[1153,584],[1156,581],[1156,575],[1155,575],[1154,574],[1152,574],[1147,579],[1145,579],[1142,576],[1141,576],[1140,575],[1131,575],[1130,574], ]]}, "properties": {"centroid": [1134,584]}},
{ "type": "Feature", "id": 46, "geometry_name": 46, "geometry": { "type": "Polygon", "coordinates": [[ 
[1101,574],[1100,575],[1099,575],[1098,576],[1098,577],[1097,578],[1097,580],[1098,581],[1098,590],[1097,591],[1097,592],[1098,593],[1098,594],[1099,595],[1104,595],[1105,594],[1106,595],[1112,595],[1113,594],[1113,591],[1112,590],[1112,589],[1111,588],[1111,586],[1109,584],[1108,585],[1107,585],[1105,587],[1102,584],[1102,582],[1104,580],[1107,580],[1108,581],[1111,581],[1112,580],[1113,580],[1113,575],[1112,575],[1111,574], ]]}, "properties": {"centroid": [1105,584]}},
{ "type": "Feature", "id": 47, "geometry_name": 47, "geometry": { "type": "Polygon", "coordinates": [[ 
[1083,574],[1082,575],[1080,575],[1079,576],[1078,576],[1078,577],[1077,578],[1077,582],[1078,583],[1078,587],[1077,588],[1077,592],[1078,593],[1078,594],[1080,594],[1081,595],[1089,595],[1090,594],[1091,594],[1092,593],[1092,592],[1093,591],[1093,579],[1092,578],[1092,577],[1091,576],[1090,576],[1089,575],[1087,575],[1086,574], ]]}, "properties": {"centroid": [1084,583]}},
{ "type": "Feature", "id": 48, "geometry_name": 48, "geometry": { "type": "Polygon", "coordinates": [[ 
[1034,574],[1032,576],[1032,581],[1033,582],[1033,593],[1035,595],[1045,595],[1046,594],[1047,594],[1048,593],[1048,587],[1046,585],[1046,583],[1049,580],[1050,580],[1052,582],[1052,583],[1053,584],[1053,590],[1054,591],[1054,592],[1055,593],[1055,594],[1056,594],[1057,595],[1061,595],[1064,592],[1064,590],[1065,589],[1065,586],[1066,585],[1066,584],[1069,581],[1069,575],[1068,575],[1067,574],[1065,574],[1060,579],[1058,579],[1055,576],[1054,576],[1053,575],[1047,575],[1046,574],[1045,575],[1044,575],[1043,576],[1043,577],[1042,578],[1042,581],[1041,582],[1041,584],[1042,585],[1042,588],[1041,589],[1039,589],[1037,587],[1038,586],[1038,581],[1037,580],[1037,575],[1036,574], ]]}, "properties": {"centroid": [1049,583]}},
{ "type": "Feature", "id": 49, "geometry_name": 49, "geometry": { "type": "Polygon", "coordinates": [[ 
[1001,574],[1000,575],[999,575],[999,576],[998,577],[998,581],[999,582],[999,587],[998,588],[997,588],[996,589],[995,589],[993,591],[993,594],[994,595],[999,595],[1000,594],[1012,594],[1013,595],[1017,595],[1018,594],[1018,589],[1017,588],[1017,584],[1018,583],[1018,582],[1020,580],[1021,580],[1023,582],[1023,589],[1022,590],[1022,592],[1023,593],[1023,594],[1024,595],[1028,595],[1028,580],[1027,579],[1027,578],[1026,577],[1026,576],[1025,576],[1024,575],[1023,575],[1022,574],[1019,574],[1018,575],[1017,575],[1016,576],[1015,576],[1013,578],[1013,579],[1012,580],[1012,581],[1011,582],[1012,583],[1012,588],[1011,589],[1007,589],[1004,586],[1004,585],[1005,584],[1005,582],[1006,581],[1006,577],[1005,576],[1005,575],[1004,575],[1003,574], ]]}, "properties": {"centroid": [1011,583]}},
{ "type": "Feature", "id": 50, "geometry_name": 50, "geometry": { "type": "Polygon", "coordinates": [[ 
[976,574],[974,576],[974,577],[973,578],[974,579],[974,580],[977,583],[977,584],[978,585],[978,590],[979,591],[979,592],[980,593],[980,594],[981,595],[986,595],[988,593],[988,591],[989,590],[989,588],[990,587],[990,585],[993,582],[993,575],[992,575],[991,574],[990,574],[985,579],[983,579],[980,576],[980,575],[979,575],[978,574], ]]}, "properties": {"centroid": [982,582]}},
{ "type": "Feature", "id": 51, "geometry_name": 51, "geometry": { "type": "Polygon", "coordinates": [[ 
[946,574],[945,575],[944,575],[944,576],[943,577],[943,580],[944,581],[944,593],[946,595],[955,595],[956,594],[956,588],[955,587],[955,586],[954,586],[953,585],[952,586],[950,586],[949,585],[949,584],[948,583],[951,580],[956,580],[957,579],[957,575],[956,575],[955,574], ]]}, "properties": {"centroid": [950,582]}},
{ "type": "Feature", "id": 52, "geometry_name": 52, "geometry": { "type": "Polygon", "coordinates": [[ 
[12,471],[11,472],[10,472],[10,473],[9,474],[9,477],[10,478],[10,653],[9,654],[9,657],[10,658],[10,659],[17,659],[18,658],[797,658],[798,659],[805,659],[805,653],[804,652],[804,479],[805,478],[805,473],[803,471],[800,471],[799,472],[16,472],[15,471], ]]}, "properties": {"centroid": [333,554]}},
{ "type": "Feature", "id": 53, "geometry_name": 53, "geometry": { "type": "Polygon", "coordinates": [[ 
[399,567],[398,568],[398,569],[397,570],[398,571],[398,572],[399,573],[399,575],[400,576],[400,582],[401,583],[401,584],[402,585],[402,586],[403,586],[404,587],[408,587],[410,585],[410,584],[411,583],[411,578],[412,577],[412,575],[415,572],[416,572],[417,573],[417,581],[416,582],[416,584],[417,585],[417,586],[418,587],[423,587],[424,586],[424,579],[423,578],[423,577],[422,576],[422,575],[421,574],[421,568],[420,567],[419,567],[418,568],[417,568],[416,569],[415,568],[414,568],[413,567],[411,567],[407,571],[405,571],[403,569],[403,568],[402,567], ]]}, "properties": {"centroid": [410,576]}},
{ "type": "Feature", "id": 54, "geometry_name": 54, "geometry": { "type": "Polygon", "coordinates": [[ 
[511,566],[510,567],[508,567],[507,568],[506,568],[503,571],[503,572],[502,573],[502,578],[503,579],[503,580],[504,581],[504,582],[505,583],[505,584],[508,587],[514,587],[515,586],[517,586],[520,583],[520,582],[521,581],[521,573],[520,572],[520,571],[517,568],[516,568],[515,567],[513,567],[512,566], ]]}, "properties": {"centroid": [510,575]}},
{ "type": "Feature", "id": 55, "geometry_name": 55, "geometry": { "type": "Polygon", "coordinates": [[ 
[480,566],[479,567],[478,567],[477,568],[477,569],[476,570],[476,576],[477,577],[477,578],[478,579],[478,582],[477,583],[477,584],[478,585],[478,586],[479,587],[483,587],[484,586],[495,586],[496,587],[500,587],[501,586],[501,583],[500,582],[499,582],[495,578],[495,576],[496,575],[496,573],[497,572],[497,569],[496,568],[496,567],[495,567],[494,566],[492,566],[491,567],[490,567],[490,568],[489,569],[489,573],[490,574],[490,579],[488,581],[484,581],[483,580],[483,579],[482,578],[482,576],[483,575],[483,568],[481,566], ]]}, "properties": {"centroid": [487,575]}},
{ "type": "Feature", "id": 56, "geometry_name": 56, "geometry": { "type": "Polygon", "coordinates": [[ 
[454,566],[453,567],[452,567],[450,569],[450,570],[449,571],[449,572],[450,573],[450,585],[452,587],[461,587],[462,586],[462,580],[461,579],[461,578],[460,578],[459,577],[458,578],[456,578],[455,577],[455,576],[454,575],[457,572],[462,572],[463,571],[463,568],[461,566], ]]}, "properties": {"centroid": [456,575]}},
{ "type": "Feature", "id": 57, "geometry_name": 57, "geometry": { "type": "Polygon", "coordinates": [[ 
[365,566],[364,567],[363,567],[362,568],[361,568],[360,569],[360,570],[359,571],[359,573],[358,574],[358,580],[359,581],[359,583],[360,584],[360,585],[361,586],[362,586],[363,587],[370,587],[371,586],[372,586],[373,585],[373,584],[374,583],[374,572],[373,571],[373,569],[372,568],[371,568],[370,567],[369,567],[368,566], ]]}, "properties": {"centroid": [365,575]}},
{ "type": "Feature", "id": 58, "geometry_name": 58, "geometry": { "type": "Polygon", "coordinates": [[ 
[337,566],[336,567],[335,567],[332,570],[332,571],[331,572],[331,574],[330,575],[330,578],[329,579],[329,580],[330,581],[330,582],[331,583],[331,584],[333,586],[335,586],[336,587],[342,587],[343,586],[344,586],[345,585],[345,580],[344,580],[343,579],[342,579],[341,580],[337,580],[334,577],[338,573],[339,573],[341,575],[344,575],[345,574],[345,570],[344,569],[344,568],[343,568],[342,567],[341,567],[340,566], ]]}, "properties": {"centroid": [337,576]}},
{ "type": "Feature", "id": 59, "geometry_name": 59, "geometry": { "type": "Polygon", "coordinates": [[ 
[312,566],[311,567],[310,567],[310,568],[309,569],[309,572],[310,573],[310,574],[312,576],[312,577],[313,578],[313,581],[314,582],[314,583],[315,584],[315,585],[317,587],[321,587],[324,584],[324,578],[325,577],[325,575],[327,573],[327,567],[326,566],[325,566],[324,567],[323,567],[323,568],[320,571],[318,571],[313,566], ]]}, "properties": {"centroid": [317,574]}},
{ "type": "Feature", "id": 60, "geometry_name": 60, "geometry": { "type": "Polygon", "coordinates": [[ 
[300,566],[299,567],[298,567],[298,568],[297,569],[297,573],[298,574],[298,579],[296,581],[294,581],[293,582],[290,582],[289,581],[288,581],[287,580],[285,580],[284,579],[283,579],[282,578],[280,578],[279,579],[278,579],[278,580],[277,581],[277,582],[278,583],[278,584],[281,587],[287,587],[288,586],[289,586],[290,585],[291,585],[292,586],[293,586],[294,587],[298,587],[299,586],[303,586],[304,587],[309,587],[310,586],[310,583],[308,581],[307,581],[306,580],[305,580],[303,578],[303,576],[304,575],[304,567],[303,567],[302,566], ]]}, "properties": {"centroid": [293,579]}},
{ "type": "Feature", "id": 61, "geometry_name": 61, "geometry": { "type": "Polygon", "coordinates": [[ 
[910,7],[909,8],[908,8],[908,9],[907,10],[907,13],[908,14],[908,502],[907,503],[907,506],[908,507],[908,508],[915,508],[916,507],[1227,507],[1228,508],[1235,508],[1235,501],[1234,500],[1234,317],[1235,316],[1235,314],[1234,313],[1234,310],[1233,309],[1234,308],[1234,307],[1236,305],[1237,305],[1238,304],[1239,305],[1242,305],[1243,306],[1245,306],[1246,305],[1289,305],[1290,306],[1297,306],[1297,299],[1296,298],[1296,238],[1297,237],[1297,230],[1296,230],[1295,229],[1292,229],[1291,230],[1241,230],[1240,231],[1236,231],[1234,229],[1234,228],[1233,227],[1234,226],[1234,223],[1235,222],[1235,220],[1234,219],[1234,16],[1235,15],[1235,8],[1234,8],[1233,7],[1230,7],[1229,8],[914,8],[913,7], ]]}, "properties": {"centroid": [1168,250]}},
{ "type": "Feature", "id": 62, "geometry_name": 62, "geometry": { "type": "Polygon", "coordinates": [[ 
[1145,433],[1144,434],[1143,434],[1141,436],[1141,437],[1140,438],[1141,439],[1141,442],[1142,443],[1142,445],[1141,446],[1141,489],[1142,490],[1142,492],[1141,493],[1141,496],[1140,497],[1140,499],[1141,500],[1141,501],[1147,501],[1148,500],[1159,500],[1160,501],[1187,501],[1188,500],[1189,501],[1196,501],[1197,500],[1209,500],[1210,501],[1216,501],[1216,495],[1215,494],[1215,441],[1216,440],[1216,436],[1214,434],[1213,434],[1212,433],[1211,434],[1208,434],[1207,435],[1205,435],[1204,434],[1153,434],[1152,435],[1150,435],[1149,434],[1146,434], ]]}, "properties": {"centroid": [1170,464]}},
{ "type": "Feature", "id": 63, "geometry_name": 63, "geometry": { "type": "Polygon", "coordinates": [[ 
[1030,433],[1029,434],[1028,434],[1026,436],[1026,437],[1025,438],[1026,439],[1026,442],[1027,443],[1027,445],[1026,446],[1026,489],[1027,490],[1027,492],[1026,493],[1026,496],[1025,497],[1025,499],[1026,500],[1026,501],[1032,501],[1033,500],[1094,500],[1095,501],[1101,501],[1101,495],[1100,494],[1100,441],[1101,440],[1101,436],[1099,434],[1098,434],[1097,433],[1096,434],[1093,434],[1092,435],[1090,435],[1089,434],[1038,434],[1037,435],[1035,435],[1034,434],[1031,434], ]]}, "properties": {"centroid": [1053,459]}},
{ "type": "Feature", "id": 64, "geometry_name": 64, "geometry": { "type": "Polygon", "coordinates": [[ 
[923,430],[922,431],[921,431],[919,433],[919,437],[920,438],[920,491],[919,492],[919,494],[918,495],[918,496],[919,497],[919,498],[920,499],[925,499],[926,498],[928,498],[929,497],[932,497],[933,498],[936,498],[937,499],[939,499],[940,498],[973,498],[974,497],[986,497],[987,498],[989,498],[990,499],[994,499],[994,498],[995,497],[995,492],[994,491],[994,438],[995,437],[995,433],[993,431],[992,431],[991,430],[990,431],[987,431],[986,432],[984,432],[983,431],[932,431],[931,432],[929,432],[928,431],[925,431],[924,430], ]]}, "properties": {"centroid": [952,468]}},
{ "type": "Feature", "id": 65, "geometry_name": 65, "geometry": { "type": "Polygon", "coordinates": [[ 
[923,348],[922,349],[921,349],[919,351],[919,355],[920,356],[920,409],[919,410],[919,414],[921,416],[926,416],[927,415],[954,415],[955,416],[958,416],[959,415],[964,415],[965,416],[968,416],[969,415],[988,415],[989,416],[993,416],[995,414],[995,410],[994,409],[994,356],[995,355],[995,351],[993,349],[992,349],[991,348],[990,349],[987,349],[986,350],[984,350],[983,349],[932,349],[931,350],[929,350],[928,349],[925,349],[924,348], ]]}, "properties": {"centroid": [957,380]}},
{ "type": "Feature", "id": 66, "geometry_name": 66, "geometry": { "type": "Polygon", "coordinates": [[ 
[1143,346],[1142,347],[1140,347],[1139,348],[1138,348],[1136,350],[1136,351],[1135,352],[1135,354],[1134,355],[1134,358],[1135,359],[1135,412],[1134,413],[1134,416],[1135,417],[1135,419],[1136,420],[1136,421],[1138,423],[1140,423],[1141,424],[1151,424],[1152,423],[1154,423],[1155,424],[1201,424],[1202,423],[1205,423],[1206,424],[1216,424],[1217,423],[1219,423],[1221,421],[1221,350],[1219,348],[1218,348],[1217,347],[1215,347],[1214,346],[1208,346],[1207,347],[1150,347],[1149,346], ]]}, "properties": {"centroid": [1166,385]}},
{ "type": "Feature", "id": 67, "geometry_name": 67, "geometry": { "type": "Polygon", "coordinates": [[ 
[1028,346],[1027,347],[1025,347],[1024,348],[1023,348],[1021,350],[1021,351],[1020,352],[1020,354],[1019,355],[1019,358],[1020,359],[1020,412],[1019,413],[1019,416],[1020,417],[1020,419],[1021,420],[1021,421],[1023,423],[1025,423],[1026,424],[1036,424],[1037,423],[1049,423],[1050,424],[1080,424],[1081,423],[1090,423],[1091,424],[1101,424],[1102,423],[1104,423],[1106,421],[1106,419],[1107,418],[1107,411],[1106,410],[1106,361],[1107,360],[1107,353],[1106,352],[1106,350],[1104,348],[1103,348],[1102,347],[1100,347],[1099,346],[1093,346],[1092,347],[1035,347],[1034,346], ]]}, "properties": {"centroid": [1060,385]}},
{ "type": "Feature", "id": 68, "geometry_name": 68, "geometry": { "type": "Polygon", "coordinates": [[ 
[923,266],[922,267],[921,267],[919,269],[919,273],[920,274],[920,327],[919,328],[919,332],[921,334],[926,334],[927,333],[935,333],[936,334],[973,334],[974,333],[988,333],[989,334],[993,334],[995,332],[995,328],[994,327],[994,274],[995,273],[995,269],[993,267],[992,267],[991,266],[990,267],[987,267],[986,268],[984,268],[983,267],[932,267],[931,268],[929,268],[928,267],[925,267],[924,266], ]]}, "properties": {"centroid": [956,294]}},
{ "type": "Feature", "id": 69, "geometry_name": 69, "geometry": { "type": "Polygon", "coordinates": [[ 
[1140,265],[1139,266],[1138,266],[1136,268],[1136,269],[1135,270],[1135,272],[1134,273],[1134,276],[1135,277],[1135,330],[1134,331],[1134,334],[1135,335],[1135,337],[1136,338],[1136,339],[1138,341],[1140,341],[1141,342],[1200,342],[1201,341],[1205,341],[1206,342],[1216,342],[1217,341],[1219,341],[1221,339],[1221,279],[1222,278],[1222,271],[1221,270],[1221,268],[1219,266],[1218,266],[1217,265], ]]}, "properties": {"centroid": [1171,304]}},
{ "type": "Feature", "id": 70, "geometry_name": 70, "geometry": { "type": "Polygon", "coordinates": [[ 
[1025,265],[1024,266],[1023,266],[1021,268],[1021,269],[1020,270],[1020,272],[1019,273],[1019,276],[1020,277],[1020,330],[1019,331],[1019,334],[1020,335],[1020,337],[1021,338],[1021,339],[1023,341],[1025,341],[1026,342],[1036,342],[1037,341],[1040,341],[1041,342],[1084,342],[1085,341],[1090,341],[1091,342],[1101,342],[1102,341],[1104,341],[1106,339],[1106,337],[1107,336],[1107,329],[1106,328],[1106,279],[1107,278],[1107,271],[1106,270],[1106,268],[1104,266],[1103,266],[1102,265], ]]}, "properties": {"centroid": [1059,310]}},
{ "type": "Feature", "id": 71, "geometry_name": 71, "geometry": { "type": "Polygon", "coordinates": [[ 
[1264,240],[1263,241],[1260,241],[1259,242],[1257,242],[1256,243],[1255,243],[1254,244],[1253,244],[1252,245],[1251,245],[1247,249],[1247,250],[1245,252],[1245,253],[1244,254],[1244,256],[1243,257],[1243,259],[1242,260],[1242,264],[1241,265],[1241,267],[1242,268],[1242,272],[1243,273],[1243,275],[1244,276],[1244,277],[1245,278],[1245,279],[1246,280],[1246,281],[1248,283],[1248,284],[1251,287],[1252,287],[1253,288],[1254,288],[1256,290],[1258,290],[1259,291],[1263,291],[1264,292],[1267,292],[1268,291],[1272,291],[1273,290],[1275,290],[1276,289],[1277,289],[1279,287],[1280,287],[1283,284],[1283,283],[1284,282],[1284,280],[1285,279],[1285,277],[1286,276],[1286,273],[1287,272],[1287,260],[1286,259],[1286,256],[1285,255],[1285,253],[1284,252],[1284,250],[1283,249],[1283,248],[1280,245],[1279,245],[1278,244],[1277,244],[1276,243],[1275,243],[1274,242],[1272,242],[1271,241],[1267,241],[1266,240], ]]}, "properties": {"centroid": [1263,265]}},
{ "type": "Feature", "id": 72, "geometry_name": 72, "geometry": { "type": "Polygon", "coordinates": [[ 
[925,185],[924,186],[923,186],[922,187],[921,187],[921,188],[920,189],[920,190],[921,191],[921,248],[920,249],[920,250],[921,251],[921,252],[922,252],[923,253],[926,253],[927,252],[932,252],[933,253],[974,253],[975,252],[989,252],[990,253],[994,253],[996,251],[996,247],[995,246],[995,193],[996,192],[996,188],[994,186],[993,186],[992,185],[991,186],[988,186],[987,187],[985,187],[984,186],[933,186],[932,187],[930,187],[929,186],[926,186], ]]}, "properties": {"centroid": [952,214]}},
{ "type": "Feature", "id": 73, "geometry_name": 73, "geometry": { "type": "Polygon", "coordinates": [[ 
[1143,183],[1142,184],[1141,184],[1140,185],[1139,185],[1137,187],[1137,188],[1136,189],[1136,191],[1135,192],[1135,195],[1136,196],[1136,249],[1135,250],[1135,253],[1136,254],[1136,256],[1137,257],[1137,258],[1139,260],[1220,260],[1222,258],[1222,256],[1223,255],[1223,248],[1222,247],[1222,188],[1221,187],[1221,186],[1220,185],[1219,185],[1218,184],[1217,184],[1216,183], ]]}, "properties": {"centroid": [1171,214]}},
{ "type": "Feature", "id": 74, "geometry_name": 74, "geometry": { "type": "Polygon", "coordinates": [[ 
[1028,183],[1027,184],[1026,184],[1025,185],[1024,185],[1022,187],[1022,188],[1021,189],[1021,191],[1020,192],[1020,195],[1021,196],[1021,249],[1020,250],[1020,253],[1021,254],[1021,256],[1022,257],[1022,258],[1024,260],[1046,260],[1047,261],[1070,261],[1071,260],[1105,260],[1107,258],[1107,256],[1108,255],[1108,248],[1107,247],[1107,198],[1108,197],[1108,190],[1107,189],[1107,187],[1105,185],[1104,185],[1103,184],[1102,184],[1101,183], ]]}, "properties": {"centroid": [1059,218]}},
{ "type": "Feature", "id": 75, "geometry_name": 75, "geometry": { "type": "Polygon", "coordinates": [[ 
[925,102],[924,103],[923,103],[922,104],[921,104],[921,105],[920,106],[920,107],[921,108],[921,165],[920,166],[920,167],[921,168],[921,169],[922,169],[923,170],[927,170],[928,169],[936,169],[937,170],[974,170],[975,169],[989,169],[990,170],[994,170],[996,168],[996,164],[995,163],[995,110],[996,109],[996,105],[994,103],[993,103],[992,102],[991,103],[988,103],[987,104],[985,104],[984,103],[933,103],[932,104],[930,104],[929,103],[926,103], ]]}, "properties": {"centroid": [953,131]}},
{ "type": "Feature", "id": 76, "geometry_name": 76, "geometry": { "type": "Polygon", "coordinates": [[ 
[1144,100],[1143,101],[1141,101],[1140,102],[1139,102],[1137,104],[1137,105],[1136,106],[1136,108],[1135,109],[1135,112],[1136,113],[1136,166],[1135,167],[1135,170],[1136,171],[1136,173],[1137,174],[1137,175],[1139,177],[1140,177],[1141,178],[1218,178],[1219,177],[1220,177],[1221,176],[1221,175],[1222,174],[1222,105],[1221,104],[1221,103],[1220,102],[1219,102],[1218,101],[1217,101],[1216,100],[1209,100],[1208,101],[1151,101],[1150,100], ]]}, "properties": {"centroid": [1170,131]}},
{ "type": "Feature", "id": 77, "geometry_name": 77, "geometry": { "type": "Polygon", "coordinates": [[ 
[1029,100],[1028,101],[1026,101],[1025,102],[1024,102],[1022,104],[1022,105],[1021,106],[1021,108],[1020,109],[1020,112],[1021,113],[1021,166],[1020,167],[1020,170],[1021,171],[1021,173],[1022,174],[1022,175],[1024,177],[1025,177],[1026,178],[1103,178],[1104,177],[1105,177],[1107,175],[1107,173],[1108,172],[1108,165],[1107,164],[1107,115],[1108,114],[1108,107],[1107,106],[1107,104],[1105,102],[1104,102],[1103,101],[1102,101],[1101,100],[1094,100],[1093,101],[1036,101],[1035,100], ]]}, "properties": {"centroid": [1060,132]}},
{ "type": "Feature", "id": 78, "geometry_name": 78, "geometry": { "type": "Polygon", "coordinates": [[ 
[923,20],[922,21],[921,21],[919,23],[919,27],[920,28],[920,81],[919,82],[919,86],[921,88],[926,88],[927,87],[933,87],[934,88],[974,88],[975,87],[988,87],[989,88],[993,88],[995,86],[995,82],[994,81],[994,28],[995,27],[995,23],[994,22],[994,21],[993,21],[992,20],[991,20],[990,21],[925,21],[924,20], ]]}, "properties": {"centroid": [957,53]}},
{ "type": "Feature", "id": 79, "geometry_name": 79, "geometry": { "type": "Polygon", "coordinates": [[ 
[1145,18],[1144,19],[1141,19],[1140,20],[1139,20],[1138,21],[1137,21],[1136,22],[1136,23],[1135,24],[1135,26],[1134,27],[1134,30],[1135,31],[1135,84],[1134,85],[1134,88],[1135,89],[1135,91],[1136,92],[1136,93],[1138,95],[1139,95],[1140,96],[1151,96],[1152,95],[1166,95],[1167,96],[1197,96],[1198,95],[1205,95],[1206,96],[1216,96],[1217,95],[1219,95],[1221,93],[1221,22],[1220,21],[1219,21],[1218,20],[1217,20],[1216,19],[1213,19],[1212,18],[1208,18],[1207,19],[1150,19],[1149,18], ]]}, "properties": {"centroid": [1167,54]}},
{ "type": "Feature", "id": 80, "geometry_name": 80, "geometry": { "type": "Polygon", "coordinates": [[ 
[1030,18],[1029,19],[1026,19],[1025,20],[1024,20],[1023,21],[1022,21],[1021,22],[1021,23],[1020,24],[1020,26],[1019,27],[1019,30],[1020,31],[1020,84],[1019,85],[1019,88],[1020,89],[1020,91],[1021,92],[1021,93],[1023,95],[1024,95],[1025,96],[1036,96],[1037,95],[1040,95],[1041,96],[1084,96],[1085,95],[1090,95],[1091,96],[1101,96],[1102,95],[1104,95],[1106,93],[1106,91],[1107,90],[1107,83],[1106,82],[1106,33],[1107,32],[1107,25],[1106,24],[1106,22],[1105,21],[1104,21],[1103,20],[1102,20],[1101,19],[1098,19],[1097,18],[1093,18],[1092,19],[1035,19],[1034,18], ]]}, "properties": {"centroid": [1060,54]}},
{ "type": "Feature", "id": 81, "geometry_name": 81, "geometry": { "type": "Polygon", "coordinates": [[ 
[1055,480],[1054,481],[1053,481],[1052,482],[1049,482],[1048,481],[1047,481],[1046,482],[1045,482],[1044,483],[1044,484],[1043,485],[1043,492],[1044,493],[1044,494],[1045,495],[1050,495],[1051,494],[1053,494],[1054,495],[1058,495],[1059,494],[1060,494],[1061,493],[1062,493],[1063,494],[1064,494],[1065,495],[1068,495],[1069,494],[1069,483],[1067,481],[1065,481],[1063,483],[1063,484],[1062,485],[1062,487],[1061,488],[1060,488],[1058,486],[1058,483],[1057,482],[1057,481],[1056,480], ]]}, "properties": {"centroid": [1055,487]}},
{ "type": "Feature", "id": 82, "geometry_name": 82, "geometry": { "type": "Polygon", "coordinates": [[ 
[1055,398],[1054,399],[1053,399],[1052,400],[1049,400],[1048,399],[1047,399],[1046,400],[1045,400],[1044,401],[1044,402],[1043,403],[1043,410],[1044,411],[1044,412],[1045,413],[1050,413],[1051,412],[1052,412],[1053,413],[1058,413],[1059,412],[1060,412],[1061,411],[1062,411],[1063,412],[1064,412],[1065,413],[1068,413],[1069,412],[1070,412],[1070,409],[1069,408],[1069,402],[1066,399],[1065,399],[1063,401],[1063,402],[1062,403],[1062,404],[1061,405],[1059,405],[1058,404],[1058,401],[1057,400],[1057,399],[1056,398], ]]}, "properties": {"centroid": [1056,405]}},
{ "type": "Feature", "id": 83, "geometry_name": 83, "geometry": { "type": "Polygon", "coordinates": [[ 
[1055,317],[1054,318],[1053,318],[1052,319],[1049,319],[1048,318],[1047,318],[1046,319],[1045,319],[1044,320],[1044,321],[1043,322],[1043,329],[1044,330],[1044,331],[1045,331],[1046,332],[1049,332],[1050,331],[1053,331],[1054,332],[1058,332],[1060,330],[1062,330],[1063,331],[1065,331],[1066,332],[1068,332],[1069,331],[1069,320],[1068,319],[1067,319],[1066,318],[1065,318],[1063,320],[1063,321],[1062,322],[1062,323],[1061,324],[1059,324],[1058,323],[1058,320],[1057,319],[1057,318],[1056,317], ]]}, "properties": {"centroid": [1055,324]}},
{ "type": "Feature", "id": 84, "geometry_name": 84, "geometry": { "type": "Polygon", "coordinates": [[ 
[968,150],[966,152],[966,154],[967,155],[967,158],[966,159],[964,159],[962,157],[962,155],[961,154],[961,152],[960,152],[959,151],[958,151],[957,152],[956,152],[956,153],[955,154],[955,163],[957,165],[960,165],[962,163],[964,163],[965,164],[972,164],[973,163],[973,162],[974,161],[974,160],[975,159],[975,156],[974,155],[974,154],[973,153],[973,152],[972,152],[971,151],[970,151],[969,150], ]]}, "properties": {"centroid": [965,156]}},
{ "type": "Feature", "id": 85, "geometry_name": 85, "geometry": { "type": "Polygon", "coordinates": [[ 
[813,4],[812,5],[811,5],[811,6],[810,7],[810,10],[811,11],[811,652],[810,653],[810,654],[811,655],[811,656],[812,657],[818,657],[819,656],[891,656],[892,657],[899,657],[899,650],[898,649],[898,13],[899,12],[899,5],[898,5],[897,4],[894,4],[893,5],[817,5],[816,4], ]]}, "properties": {"centroid": [847,297]}},
],  "totalFeatures": 85};
 }


}
