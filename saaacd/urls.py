from django.conf.urls import url
from django.urls import path, include
 
from saaacd import views
from saaacd.subviews.SemesterView import SemesterView
from saaacd.subviews.UserView import UserView
from saaacd.subviews.CategoryView import CategoryView
from saaacd.subviews.LocationView import LocationView
from saaacd.subviews.DeviceView import DeviceView
from rest_framework import routers
 
 
router = routers.DefaultRouter()
#router.register(r'customers', views.CustViewSet) 
 
urlpatterns = [
    url(r'^$', views.HomePageView.as_view()),
	url(r'^allActivities/', views.HomePageView.as_view()),
	url(r'^api/petitionActivities/', views.HomePageView.getPetitionActivities),
	url(r'^api/detailActivity/',views.HomePageView.detailActivity),
	url(r'^api/createActivity/', views.HomePageView.createActivity),
	url(r'^api/activities/', views.HomePageView.getActivities),
	url(r'^api/semesters/', SemesterView.getSemesters),
	url(r'^api/users/', UserView.getUsers),
	url(r'^api/categories/', CategoryView.getCategories),
	url(r'^api/locations/', LocationView.getLocations),
	url(r'^api/devices/', DeviceView.getDevicesByLocation),

	
   #url(r'^.*', TemplateView.as_view(template_name="home.html"), name="home")
   # url(r'^links/$', views.LinksPageView.as_view()), # simple view
   # url(r'^getcust/$',views.Actividades.getActividad), # simple view
   # url(r'^apitest/$',views.CalcTest), # for REST API test
]