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
 
 
router = routers.DefaultRouter()
#router.register(r'customers', views.CustViewSet) 
 
urlpatterns = [
    url(r'^$', views.ActivityView.as_view()),
	url(r'^allActivities/', views.ActivityView.as_view()),
	re_path(r'^detail/(?P<id>[0-9]+)/$',views.ActivityView.getDetailUrl),
	url(r'^create/', views.ActivityView.keepUrl),
	url(r'^activityStadistic/', views.ActivityView.keepUrl),
	url(r'^map/', views.ActivityView.keepUrl),
	url(r'^api/petitionActivities/', views.ActivityView.getPetitionActivities),
	url(r'^api/detailActivity/', views.ActivityView.detailActivity),
	url(r'^api/saveActivity/', views.ActivityView.saveActivity),
	url(r'^api/activities/', views.ActivityView.getActivities),
	url(r'^api/semesters/', SemesterView.getSemesters),
	url(r'^api/users/', UserView.getUsers),
	url(r'^api/categories/', CategoryView.getCategories),
	url(r'^api/superiorCategories/', CategoryView.getSuperiorCategories),
	url(r'^api/locations/', LocationView.getLocations),
	url(r'^api/activityStadisticByInfLocation/', LocationView.getActivityStadisticByInfLocation),
	url(r'^api/activityStadisticBySupLocation/', LocationView.getActivityStadisticBySupLocation),
	url(r'^api/inferiorLocations', LocationView.getInferiorLocations),
	url(r'^api/superiorLocations', LocationView.getSuperiorLocations),
	url(r'^api/devices/', DeviceView.getDevicesByLocation),
	url(r'^api/maps/', MapView.getMaps),
	url(r'^api/activeMap/', MapView.getActiveMap),
	url(r'^api/regions/', RegionView.getRegionsOnMap),
	url(r'^api/saveLocations/', LocationView.saveLocations),
	
   #url(r'^.*', TemplateView.as_view(template_name="home.html"), name="home")
   # url(r'^links/$', views.LinksPageView.as_view()), # simple view
   # url(r'^getcust/$',views.Actividades.getActividad), # simple view
   # url(r'^apitest/$',views.CalcTest), # for REST API test
]
