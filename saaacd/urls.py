from django.conf.urls import url
from django.urls import path, include
 
from saaacd import views
from saaacd.subviews.SemesterView import SemesterView
from saaacd.subviews.UserView import UserView
from saaacd.subviews.CategoryView import CategoryView
from saaacd.subviews.LocationView import LocationView
from saaacd.subviews.DeviceView import DeviceView
from saaacd.subviews.MapView import MapView
from saaacd.subviews.RegionView import RegionView
from rest_framework import routers
from django.urls import re_path
from django.conf import settings 
from django.conf.urls.static import static 
from django.contrib.auth.views import LoginView,LogoutView
from django.contrib.auth.decorators import login_required
 
router = routers.DefaultRouter()
 
urlpatterns = [
	#url(r'^$', views.ActivityView.as_view()),
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
	url(r'^allActivities/', views.ActivityView.as_view()),
	re_path(r'^detail/(?P<id>[0-9]+)/$',views.ActivityView.getDetailUrl),
	url(r'^create/', views.ActivityView.keepUrl),
	url(r'^activityStatistic/', views.ActivityView.keepUrl),
	url(r'^materialStatistic/', views.ActivityView.keepUrl),
	url(r'^activityMonitoring/', views.ActivityView.keepUrl),
	url(r'^materialMonitoring/', views.ActivityView.keepUrl),
	url(r'^map/', views.ActivityView.keepUrl),
	url(r'^api/petitionActivities/', views.ActivityView.getPetitionActivities),
	url(r'^api/activitiesByLocation/', views.ActivityView.getActivitiesByLocation),
	url(r'^api/detailActivity/', views.ActivityView.detailActivity),
	url(r'^api/saveActivity/', login_required(views.ActivityView.saveActivity, login_url='/login/')),
	url(r'^api/activities/', views.ActivityView.getActivities),
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
