import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, formatDate } from '@angular/common';

import { Actividad } from '../../models/Actividad';
import { ActividadSuperior } from '../../models/ActividadSuperior';
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
import {FormControl,  Validators, FormGroup, FormBuilder, AbstractControl} from '@angular/forms';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: [ './activity-detail.component.css' ]
})
export class ActivityDetailComponent implements OnInit {
  @Input() activity: Actividad;
  isEdition : boolean;
  id : number;
  priorities: Array<any> = Actividad.PRIORITIES;
  statuses: Array<any> = Actividad.STATUSES;
  semesters: Semestre[];
  petitionActivities: Actividad[];
  users: Usuario[];
  isPetition: boolean = false;
  DONE : string = Actividad.STATUSES[0].id;
  MAX_LENGTH_COMMENT: number = Actividad.MAX_LENGTH_COMMENT;
  pageTitle : string = "Nueva Actividad"; 
  
  categories: Categoria[];
  categoryHashTable: Object = Object.create(null);
  categoryTree: Array<any> =[];
  categoryGroups: Array<any> =[];
  
  locations: Ubicacion[];
  locationHashTable: Object = Object.create(null);
  locationTree: Array<any> =[];
  devicesByLocation: Dispositivo[];
  isValidRequiredDate : Boolean = true;
  isValidResolutionDate : Boolean = true;
   
  //Notification Elements
  title = 'Notificación';
  updateSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  updateErrorMessage = 'No se ha podido actualizar la actividad con ID: ';
  creationSuccessMessage = 'Se ha actualizado satisfactoriamente la actividad con ID: ';
  creationErrorMessage = 'No se ha podido actualizar la actividad con ID: ';
  semesterErrorMessage = 'No se ha podido mostrar los semestres.';
  userErrorMessage = 'No se ha podido mostrar los usuarios.';
  categoryErrorMessage = 'No se ha podido mostrar las categorias.';
  locationErrorMessage = 'No se ha podido mostrar las ubicaciones.';
  deviceErrorMessage = 'No se ha podido mostrar los dispositivos.';
  petitionActivitiesErrorMessage = 'No se ha podido mostrar las peticiones.';
  validationGroupErrorMessage = 'Por favor verifique los campos.'
  getActivityDetailsErrorMessage = 'No se ha podido obtener los detalles de la actividad';

  priorityControl = new FormControl('', Validators.required);
  statusControl = new FormControl('', Validators.required);
  currentDateControl = new FormControl(null, Validators.required); 
  resolutionDateControl = new FormControl();  
  requiredDateControl = new FormControl();
  petitionControl = new FormControl();
  commentControl = new FormControl('', Validators.maxLength(this.MAX_LENGTH_COMMENT));
  superiorActivityControl = new FormControl();
  userControl = new FormControl('', Validators.required);
  semesterControl = new FormControl('', Validators.required);
  categoryControl = new FormControl('', Validators.required);
  superiorCategoryControl = new FormControl('', Validators.required);
  lifeTimeControl = new FormControl();
  locationControl = new FormControl();
  deviceControl = new FormControl();
  
  validationGroup : FormGroup = new FormGroup({
	  userControl : this.userControl,
	  semesterControl : this.semesterControl,
	  priorityControl : this.priorityControl,
	  statusControl : this.statusControl,
	  currentDateControl : this.currentDateControl, 
	  resolutionDateControl : this.resolutionDateControl,  
	  requiredDateControl : this.requiredDateControl,
	  superiorActivityControl : this.superiorActivityControl,
	  petitionControl: this.petitionControl,
	  categoryControl: this.categoryControl,
	  superiorCategoryControl: this.superiorCategoryControl,
	  commentControl: this.commentControl,
	  locationControl: this.locationControl,
	  deviceControl: this.deviceControl,
	  lifeTimeControl: this.lifeTimeControl
    });
      
  //Required Messages
  requiredUserField = 'Por favor escoge un usuario.';
  requiredSemesterField = 'Por favor escoge un semestre.';
  requiredPriorityField = 'Por favor escoge una prioridad.';
  requiredStatusField = 'Por favor escoge un estado.';
  requiredStartDateField = 'Por favor escoge una fecha de alta.';
  requiredCategoryField = 'Por favor escoge una actividad.';
  requiredSuperiorCategoryField = 'Por favor escoge una categoría de actividad.';
  maxLenghtCommentField = 'Por favor no exceda el número máximo de 250 caracteres.';
  dateLessValidationMessage = 'Por favor ingrese una fecha posterior a la fecha de Alta.';
  dateLessThanRequiredMessage = 'Por favor ingrese una fecha anterior a la fecha requerida.';
  dateLessThanResolutionMessage = 'Por favor ingrese una fecha anterior a la fecha de resolución.';
  requireDoneStatusMessage = 'Por favor elige el estado Realizada para registrar una fecha de resolución.';
  requireResolutionDateMessage = 'Necesita una fecha de resolución para registrar una actividad Realizada.';
  
  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private location: Location,
	private notifyService : NotificationService,
	private semesterService: SemesterService,
	private userService: UserService,
	private categoryService: CategoryService,
	private locationService: LocationService,
    private deviceService: DeviceService,
	private formBuilder: FormBuilder
  ) {
    this.id = +this.route.snapshot.paramMap.get('id');
  	this.isEdition = this.id > 0; 
	if(this.isEdition)
		this.pageTitle = "Actividad " + this.id;
  }

  ngOnInit(): void { 
	if(this.isEdition){
		this.getActivity();
	}else {
		this.activity = {
		  'id': null,
		  'estado': 'p',
		  'prioridad': 'b',
		  'comentario': '',
		  'fechaResolucion': null,
		  'fechaAlta': null,
		  'fechaRequerido': null,
		  'esSiniestro': false,
		  'actividadSuperior': null,
		  'categoria': null,
		  'semestre': null,
		  'ubicacion': null,
		  'usuario': null,
		  'dispositivo': null
		};
		this.getCategories();
		this.getSemesters();
		this.getUsers();
		this.getLocations();
		this.getPetitionActivities();
		this.setDefaultValuesToForms();
	}
  }

  getActivity(): void {
    this.activityService.getActivity(this.id)
      .subscribe(activity =>{ 
					this.activity = activity;
     				this.getCategories();
					this.getSemesters();
					this.getUsers();
					this.getLocations();
					this.getPetitionActivities();
					this.setDefaultValuesToForms();
					},
				error => {
				  catchError(this.notifyService.handleError<Actividad>('getActivityDetails'));
				  this.notifyService.showErrorTimeout(this.getActivityDetailsErrorMessage, this.title);
				  });
  }
   
  setDefaultValuesToForms(): void {
	this.statusControl.setValue(this.activity.estado);
	if(this.statusControl.value != this.DONE)
		this.resolutionDateControl.disable();
	this.priorityControl.setValue(this.activity.prioridad);
	this.petitionControl.setValue(this.activity.esSiniestro);
	if(this.activity.ubicacion == null || (this.activity.ubicacion != null && this.activity.ubicacion.id <= 0)){
		this.deviceControl.disable();
		this.lifeTimeControl.disable();
	}
	
	if(this.isEdition){
		this.currentDateControl.setValue(new Date(this.activity.fechaAlta));
		if(this.activity.fechaResolucion != null)
			this.resolutionDateControl.setValue(new Date(this.activity.fechaResolucion));
		if(this.activity.fechaRequerido != null)
			this.requiredDateControl.setValue(new Date(this.activity.fechaRequerido));
		this.commentControl.setValue(this.activity.comentario);
	}
	else{
		this.currentDateControl.setValue(new Date());
	}
	this.addValidations();
  }
  
  addValidations(): void {
	this.resolutionDateControl.valueChanges.subscribe(resolutionDate => {
		//Start date must be less than resolution date.
		if (this.currentDateControl.value !=null
			&& resolutionDate != null
			&& this.currentDateControl.value > resolutionDate) {
			this.resolutionDateControl.setErrors({ isInvalidDate: true });
		}   
		else {
			//Done state is required to register resolution date.
			if( resolutionDate != null &&
				this.statusControl.value != this.DONE ){ 
				this.statusControl.setErrors({ isInvalidDate: true });
			} 
			else{ 
			    //Resolution date is required to register Done state.
				if(resolutionDate == null && this.statusControl.value == this.DONE)
				   this.resolutionDateControl.setErrors({ requireResolutionDate: true });
				else
				   this.statusControl.setErrors(null);
			}
		}
      });
  
	this.requiredDateControl.valueChanges.subscribe(requiredDate => {
	    //Start date must be less than resolution date.
		if ( requiredDate!= null && this.currentDateControl.value > requiredDate) {
			this.requiredDateControl.setErrors({ isInvalidDate: true });
			console.log('validacion1');
		}    
		else {
			this.resolutionDateControl.setErrors(null);
		}
      });
  
    this.currentDateControl.valueChanges.subscribe(currentDate => {
	//Start date must be less than required date.
	if (this.requiredDateControl.value != null && currentDate != null 
		&& currentDate > this.requiredDateControl.value) {
        this.currentDateControl.setErrors({ isLessThanRequiredDate: true });
		console.log('validacion2');
    } 
	else {
		//Start date must be less than resolution date.
		if (this.resolutionDateControl.value!=null  
			&&  currentDate > this.resolutionDateControl.value) {
			this.currentDateControl.setErrors({ isLessThanResolutionDate: true });
			console.log('validacion3');
		}
		else {
			this.currentDateControl.setErrors(null);
		}
	}
  });
   	  
  this.statusControl.valueChanges.subscribe(status => {
	//Resolution date is required to register Done state
	if(status != this.DONE)
		this.resolutionDateControl.disable();
	else{ 
		this.resolutionDateControl.enable();
	    if(this.resolutionDateControl.value == null) {
			this.resolutionDateControl.setErrors({ requireResolutionDate: true });
	    }
		else {
			this.resolutionDateControl.setErrors(null);
		}
	}    
  });

  }
  
  hasRequiredError(fieldName: string): boolean{
	return this.validationGroup.get(fieldName).hasError('required');
  }

  hasDateError(fieldName: string): boolean {
	return this.validationGroup.get(fieldName).hasError('isInvalidDate');
  }
     
  hasCurrentDateError(): boolean {
	return (this.currentDateControl.hasError('isLessThanRequiredDate') ||
			this.currentDateControl.hasError('isLessThanResolutionDate'));
  }
  
  getCurrentDateErrorMessage(): string {
	if(this.currentDateControl.hasError('isLessThanRequiredDate'))
		return this.dateLessThanRequiredMessage ;
	if(this.currentDateControl.hasError('isLessThanResolutionDate'))
		return this.dateLessThanResolutionMessage;
	return "";
  }
   
  getPetitionActivities(): void {
    this.activityService.getPetitionActivities()
      .subscribe(petitionActivities =>{ 
				this.petitionActivities = petitionActivities;
				let emptyActivity = new Actividad();
				emptyActivity.id=0;
				this.petitionActivities.push(emptyActivity);
				if(this.activity.actividadSuperior != null)
					this.superiorActivityControl.setValue(this.activity.actividadSuperior.id);
				else
					this.superiorActivityControl.setValue(0);
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
				if(this.isEdition)
					this.userControl.setValue(this.activity.usuario.id);
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
				if(this.isEdition)
				    this.semesterControl.setValue(this.activity.semestre.id);
				else
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
	    this.semesterControl.setValue(this.semesters[i].id);
		break;
	  }
    }
  }
  
  getCategories(){
    this.categoryService.getCategories()
    .subscribe(categories =>{ 
				this.categories = categories;
				this.createCategoryCatalogue();
				if(this.activity.categoria!=null && this.activity.categoria.categoriaSuperior != null){
					let categoriaSuperior = this.activity.categoria.categoriaSuperior.id;
					if(this.activity.categoria.categoriaSuperior.categoriaSuperior != null){
						categoriaSuperior = this.activity.categoria.categoriaSuperior.categoriaSuperior.id;
				    }
					this.superiorCategoryControl.setValue(categoriaSuperior);
					this.assignCategoryList(categoriaSuperior);
					this.categoryControl.setValue(this.activity.categoria.id);
         		}	
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
  
  assignLifeTimeDevice(selectedDevice: number){
	if(selectedDevice >0 ){
		//const foundDevice = this.devicesByLocation.find(device => device.id == selectedDevice);
		//this.lifeTimeControl.setValue(foundDevice.tiempoVida);
		this.lifeTimeControl.enable();
	}
	else{
		this.lifeTimeControl.disable();
	}
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
				this.locations.push({"id": 0, "nombre": "", "regionGeografica": null, "ubicacionSuperior": null, "tipoUbicacion": { "id": 0, "nombre": "Ninguno"}});
				this.createLocationCatalogue();
				if(this.activity.ubicacion != null){
					this.locationControl.setValue(this.activity.ubicacion.id);
					//Assign device according with the location
					this.assignDeviceList(this.activity.ubicacion.id);
					if(this.activity.dispositivo != null){
						this.deviceControl.setValue(this.activity.dispositivo.id);
						this.lifeTimeControl.setValue(0);
					}
				} 
				else {
				    this.locationControl.setValue(0);
				}
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
	this.devicesByLocation = [];
    if(selectedLocation > 0){
		this.deviceService.getDevicesByLocation(selectedLocation)
        .subscribe(devices =>{ 
				this.devicesByLocation = devices
				this.devicesByLocation.push({"id": 0, "inventarioUNAM": "", "tipoDispositivo": { "id": 0, "nombre": "Ninguno"}});
	            this.deviceControl.enable();
				this.lifeTimeControl.enable();
			   },
			   error => {
				  catchError(this.notifyService.handleError<Dispositivo>('getDevice'));
				  this.notifyService.showErrorTimeout(this.deviceErrorMessage, this.title);
				  });
	} 
	else{
		this.deviceControl.disable();
		this.lifeTimeControl.disable();
	}
	this.deviceControl.setValue(0);
 }

  goBack(): void {
    this.location.back();
  }
  
  cancel(event: any): void {
	event.preventDefault();
    this.location.back();
  }
  
  getRawActivity(): any{
	let newActivity = {
			  'id' : null,
			  'estado': this.validationGroup.get('statusControl').value,
			  'prioridad': this.validationGroup.get('priorityControl').value,
			  'comentario': '',
			  'fechaResolucion': null,
			  'fechaAlta': formatDate(new Date(this.validationGroup.get('currentDateControl').value.toString()), 'yyyy-MM-dd', 'en-US').toString(),
			  'fechaRequerido': null,
			  'esSiniestro': this.validationGroup.get('petitionControl').value ? 1 : 0,
			  'actividadSuperior': null,
			  'categoria': this.validationGroup.get('categoryControl').value,
			  'semestre': this.validationGroup.get('semesterControl').value,
			  'ubicacion': null,
			  'usuario': this.validationGroup.get('userControl').value,
			  'dispositivo': null,
			  'tiempoVida': 0
			};
			
	if(this.isEdition)
		newActivity['id'] = this.id;
	
	if( this.validationGroup.get('commentControl').value!='')
		newActivity['comentario'] = this.validationGroup.get('commentControl').value;
	
	if(	this.validationGroup.get('superiorActivityControl').value!=null &&
		this.validationGroup.get('superiorActivityControl').value > 0)
		newActivity['actividadSuperior'] = this.validationGroup.get('superiorActivityControl').value;
	
	if(	this.validationGroup.get('locationControl').value != null &&
		this.validationGroup.get('locationControl').value > 0)
		newActivity['ubicacion'] = this.validationGroup.get('locationControl').value;
	
	if(	this.validationGroup.get('deviceControl').value!=null &&
		this.validationGroup.get('deviceControl').value > 0){
		newActivity['dispositivo'] = this.validationGroup.get('deviceControl').value;
		
		if(this.validationGroup.get('lifeTimeControl').value!=null &&
			this.validationGroup.get('lifeTimeControl').value >=0){
			//newActivity['lifeTimeControl']=this.validationGroup.get('lifeTimeControl').value;
		}
	}
	
	if(this.validationGroup.get('resolutionDateControl').value!=null)
		newActivity['fechaResolucion']=formatDate(new Date(this.validationGroup.get('resolutionDateControl').value), 'yyyy-MM-dd', 'en-US').toString();

	if(this.validationGroup.get('requiredDateControl').value!=null)
		newActivity['fechaRequerido']=formatDate(new Date(this.validationGroup.get('requiredDateControl').value), 'yyyy-MM-dd', 'en-US').toString();
	console.log(newActivity);
	return newActivity;
  }

  save(): void {
    if(this.validationGroup.valid){
			let newActivity = this.getRawActivity();	
			if(this.isEdition)
				this.activityService.updateActivity(newActivity)
				  .subscribe(
							response => {
							  this.notifyService.showSuccessTimeout(this.updateSuccessMessage + this.activity.id, this.title);
							  this.goBack();
							  },
							error => {
							  catchError(this.notifyService.handleError<Actividad>('ActivityEdition'));
							  this.notifyService.showErrorTimeout(this.updateErrorMessage + this.activity.id, this.title);
							  this.goBack();
							  });
			else
				this.activityService.createActivity(newActivity)
				  .subscribe(
							response => {
							  this.notifyService.showSuccessTimeout(this.creationSuccessMessage + response.id, this.title);
							  this.goBack();
							  },
							error => {
							  catchError(this.notifyService.handleError<Actividad>('ActivityCreation'));
							  this.notifyService.showErrorTimeout(this.creationErrorMessage + this.activity.id, this.title);
							  this.goBack();
							  });
	}
	else{
		 this.notifyService.showErrorTimeout(this.validationGroupErrorMessage, this.title);
	}
	
  }

}
