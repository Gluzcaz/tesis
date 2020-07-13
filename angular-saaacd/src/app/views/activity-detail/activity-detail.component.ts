import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Actividad } from '../../models/Actividad';
import { Semestre } from '../../models/Semestre';
import { Usuario } from '../../models/Usuario';
import { Categoria } from '../../models/Categoria';
import { Ubicacion } from '../../models/Ubicacion';
import { Dispositivo } from '../../models/Dispositivo';
import { CategoriaSuperior } from '../../models/CategoriaSuperior';
import { ActivityService } from '../../services/Activity.service';
import { NotificationService } from '../../services/notification.service';
import { SemesterService } from '../../services/semester.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { LocationService } from '../../services/location.service';
import { DeviceService } from '../../services/device.service';

import { catchError} from 'rxjs/operators';
import {FormControl,  Validators } from '@angular/forms';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: [ './activity-detail.component.css' ]
})
export class ActivityDetailComponent implements OnInit {
  @Input() activity: Actividad;
  isEdition : boolean;
  id : number;
  currentDate : FormControl;
  resolutionDate : FormControl;
  requiredDate : FormControl;
  priorities: Array<any> = Actividad.PRIORITIES;
  statuses: Array<any> = Actividad.STATUSES;
  semesters: Semestre[];
  petitionActivities: Actividad[];
  users: Usuario[];
  isPetition: boolean = false;
  
  categories: Categoria[];
  categoryHashTable: Object = Object.create(null);
  categoryTree: Array<any> =[];
  categoryGroups: Array<any> =[];
  selectedCategory: number;
  
  locations: Ubicacion[];
  locationHashTable: Object = Object.create(null);
  locationTree: Array<any> =[];
  devicesByLocation: Dispositivo[];
  selectedDevice: number;

  //Required Fields Validations
  userControl = new FormControl('', Validators.required);
   
  //Notification Elements
  title = 'Notificación';
  updateSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  updateErrorMessage = 'No se ha podido actualizar la actividad con ID: ';
  creationSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  creationErrorMessage = 'No se ha podido actualizar la actividad con ID: ';
  semesterErrorMessage = 'No se ha podido mostrar los semestres';
  userErrorMessage = 'No se ha podido mostrar los usuarios';
  categoryErrorMessage = 'No se ha podido mostrar las categorias';
  locationErrorMessage = 'No se ha podido mostrar las ubicaciones';
  deviceErrorMessage = 'No se ha podido mostrar los dispositivos';
  petitionActivitiesErrorMessage = 'No se ha podido mostrar las peticiones.';
  
  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private location: Location,
	private notifyService : NotificationService,
	private semesterService: SemesterService,
	private userService: UserService,
	private categoryService: CategoryService,
	private locationService: LocationService,
    private deviceService: DeviceService
  ) {
    this.currentDate = new FormControl(new Date());  
	this.resolutionDate = new FormControl(new Date());  
	this.requiredDate = new FormControl(new Date());  
    this.id = +this.route.snapshot.paramMap.get('id');
  	this.isEdition = this.id > 0;
  }

  ngOnInit(): void { 
	if(this.isEdition)
		this.getActivity();
	else 
		this.activity = {
		  'id': null,
		  'estado': 'p',
		  'prioridad': 'b',
		  'comentario': '',
		  'fechaResolucion': '',
		  'fechaAlta': '',
		  'fechaRequerido': '',
		  'esSiniestro': false,
		  'actividadSuperior': new Actividad(),
		  'categoria': null,
		  'semestre': new Semestre(),
		  'ubicacion': null,
		  'usuario': new Usuario(),
		  'dispositivo': null
		};
	this.getSemesters();
	this.getUsers();
	this.getCategories();
	this.getLocations();
	this.getPetitionActivities();
	
  }

  getActivity(): void {
    this.activityService.getActivity(this.id)
      .subscribe(activity => this.activity = activity);
  }
  
  getPetitionActivities(): void {
    this.activityService.getPetitionActivities()
      .subscribe(petitionActivities =>{ 
				this.petitionActivities = petitionActivities;
	           },
			   error => {
				  catchError(this.notifyService.handleError<Actividad>('getPetitions'));
				  this.notifyService.showErrorTimeout(this.petitionActivitiesErrorMessage, this.title);
				  }
			   );
  }
    
  getUsers(){
    this.userService.getUsers()
    .subscribe(users =>{ 
				this.users = users;
	           },
			   error => {
				  catchError(this.notifyService.handleError<Usuario>('getUser'));
				  this.notifyService.showErrorTimeout(this.userErrorMessage, this.title);
				  }
			   );
  } 

  getSemesters(){
    this.semesterService.getSemesters()
    .subscribe(semesters =>{ 
				this.semesters = semesters;
				this.assignDefaultSemester();
	           },
			   error => {
				  catchError(this.notifyService.handleError<Semestre>('getSemester'));
				  this.notifyService.showErrorTimeout(this.semesterErrorMessage, this.title);
				  }
			   );
  } 
  
  assignDefaultSemester(){
    for (var i=0; i<this.semesters.length; i++) {
      if(this.semesters[i].esActivo){
		this.activity.semestre.id=this.semesters[i].id;
		break;
	  }
    }
  }
  
  getCategories(){
    this.categoryService.getCategories()
    .subscribe(categories =>{ 
				this.categories = categories;
				this.createCategoryCatalogue();
	           },
			   error => {
				  catchError(this.notifyService.handleError<Categoria>('getCategory'));
				  this.notifyService.showErrorTimeout(this.categoryErrorMessage, this.title);
				  }
			   );
  } 
 
  createCategoryCatalogue(){
	this.categories.forEach(element => {
		if(element.categoriaSuperior == null){
			this.categoryHashTable[element.id] = { element, children : {} } ;
		}
	});
	
	this.categories.forEach(element => {
		if(element.categoriaSuperior && element.categoriaSuperior.categoriaSuperior==null){
			this.categoryHashTable[element.categoriaSuperior.id].children[element.id] =
			{ element, children : [] } ;
		}
	});
	
	this.categories.forEach( element => {
      if( element.categoriaSuperior && element.categoriaSuperior.categoriaSuperior ) 
		this.categoryHashTable[element.categoriaSuperior.categoriaSuperior.id].children[element.categoriaSuperior.id].children.push(element);
      else if(element.categoriaSuperior == null){
			this.categoryTree.push(this.categoryHashTable[element.id]);
		}
	  });
  }
    
  assignCategoryList(selectedSuperiorCategory: number){
	this.categoryGroups=[];
	Object.entries(this.categoryHashTable[selectedSuperiorCategory].children).forEach( element => { 
		this.categoryGroups.push(element[1]);
	});
  }
   
  getLocations(){
    this.locationService.getLocations()
    .subscribe(locations =>{ 
				this.locations = locations;
				this.createLocationCatalogue();
	           },
			   error => {
				  catchError(this.notifyService.handleError<Ubicacion>('getLocation'));
				  this.notifyService.showErrorTimeout(this.locationErrorMessage, this.title);
				  }
			   );
  } 
  
  createLocationCatalogue(){
	this.locations.forEach(element => {
		if(element.ubicacionSuperior == null){
			this.locationHashTable[element.id] = { element, children : [] } ;
		}
	});
	
	this.locations.forEach( element => {
      if( element.ubicacionSuperior ) 
		this.locationHashTable[element.ubicacionSuperior.id].children.push(element);
      else if(element.ubicacionSuperior == null){
			this.locationTree.push(this.locationHashTable[element.id]);
		}
	  });
  }
  
  assignDeviceList(selectedLocation: number){
	 this.deviceService.getDevicesByLocation(selectedLocation)
      .subscribe(devices =>{ 
				this.devicesByLocation = devices
	           },
			   error => {
				  catchError(this.notifyService.handleError<Dispositivo>('getDevice'));
				  this.notifyService.showErrorTimeout(this.deviceErrorMessage, this.title);
				  }
			   );
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
	if(this.isEdition)
		this.activityService.updateActivity(this.activity)
		  .subscribe(
					response => {
					  this.notifyService.showSuccessTimeout(this.updateSuccessMessage + this.activity.id, this.title);
					  this.goBack();
					  },
					error => {
					  catchError(this.notifyService.handleError<Actividad>('deleteActivity'));
					  this.notifyService.showErrorTimeout(this.updateErrorMessage + this.activity.id, this.title);
					  this.goBack();
					  });
	else
		this.activityService.createActivity(this.activity)
		  .subscribe(
					response => {
					  this.notifyService.showSuccessTimeout(this.creationSuccessMessage + this.activity.id, this.title);
					  this.goBack();
					  },
					error => {
					  catchError(this.notifyService.handleError<Actividad>('deleteActivity'));
					  this.notifyService.showErrorTimeout(this.creationErrorMessage + this.activity.id, this.title);
					  this.goBack();
					  });
		
  }
}
