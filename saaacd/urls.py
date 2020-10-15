from django.conf.urls import url
from django.urls import path, include

from saaacd.views.ActivityView import ActivityView 
from saaacd.views.SemesterView import SemesterView
from saaacd.views.UserView import UserView
from saaacd.views.CategoryView import CategoryView
from saaacd.views.LocationView import LocationView
from saaacd.views.DeviceView import DeviceView
from saaacd.views.MapView import MapView
from saaacd.views.RegionView import RegionView
from rest_framework import routers
from django.urls import re_path
from django.conf import settings 
from django.conf.urls.static import static 
from django.contrib.auth.views import LoginView,LogoutView
from django.contrib.auth.decorators import login_required
 
router = routers.DefaultRouter()
 
urlpatterns = [
	#url(r'^$', ActivityView.as_view()),
	url(r'^$', 
        LoginView.as_view(
            template_name='admin/login.html',
            extra_context={         
              'title': 'Autenticación',
              'site_title': 'SAAACD',
              'site_header': 'SAAACD Autenticación'})),
	url(r'^login/', 
        LoginView.as_view(
            template_name='admin/login.html',
            extra_context={         
              'title': 'Autenticación',
              'site_title': 'SAAACD',
              'site_header': 'SAAACD Autenticación'})),
	url(r'^logout/',
		LogoutView.as_view(
			extra_context={         
			  'title': 'Autenticación',
			  'site_title': 'SAAACD',
			  'site_header': 'SAAACD Autenticación'}),
			  {'next_page': settings.LOGOUT_REDIRECT_URL}),
	url(r'^allActivities/', ActivityView.as_view()),
	re_path(r'^detail/(?P<id>[0-9]+)/$',ActivityView.getDetailUrl),
	url(r'^create/', ActivityView.keepUrl),
	url(r'^activityStatistic/', ActivityView.keepUrl),
	url(r'^materialStatistic/', ActivityView.keepUrl),
	url(r'^activityMonitoring/', ActivityView.keepUrl),
	url(r'^materialMonitoring/', ActivityView.keepUrl),
	url(r'^map/', ActivityView.keepUrl),
	url(r'^api/petitionActivities/', ActivityView.getPetitionActivities),
	url(r'^api/activitiesByLocation/', ActivityView.getActivitiesByLocation),
	url(r'^api/detailActivity/', ActivityView.detailActivity),
	url(r'^api/saveActivity/', login_required(ActivityView.saveActivity, login_url='/login/')),
	url(r'^api/activities/', ActivityView.getActivities),
	url(r'^api/semesters/', SemesterView.getSemesters),
	url(r'^api/users/', UserView.getUsers),
	url(r'^api/categories/', CategoryView.getCategories),
	url(r'^api/superiorCategories/', CategoryView.getSuperiorCategories),
	url(r'^api/locations/', LocationView.getLocations),
	url(r'^api/activityStatisticByInfLocation/', LocationView.getActivityStadisticByInfLocation),
	url(r'^api/activityStatisticBySupLocation/', LocationView.getActivityStadisticBySupLocation),
	url(r'^api/materialStatisticByInfLocation/', LocationView.getMaterialStadisticByInfLocation),
	url(r'^api/materialStatisticBySupLocation/', LocationView.getMaterialStadisticBySupLocation),
    url(r'^api/activityMonitoringByLocation/', LocationView.getActivityMonitoringByLocation),
    url(r'^api/materialMonitoringByLocation/', LocationView.getMaterialMonitoringByLocation),
	url(r'^api/lifeTimeDeviceByLocation/', LocationView.getLifeTimeDeviceByLocation),
    url(r'^api/inferiorLocations', LocationView.getInferiorLocations),
	url(r'^api/superiorLocations', LocationView.getSuperiorLocations),
	url(r'^api/devices/', DeviceView.getDevicesByLocation),
	url(r'^api/expiredDevices/', DeviceView.getExpiredDevices),	
	url(r'^api/maps/', MapView.getMaps),
	url(r'^api/activeMap/', MapView.getActiveMap),
	url(r'^api/regions/', RegionView.getRegionsOnMap),
	url(r'^api/saveLocations/', LocationView.saveLocations),
]
