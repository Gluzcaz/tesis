from django.conf.urls import url
from django.urls import path, include
 
from saaacd import views
from rest_framework import routers
 
 
router = routers.DefaultRouter()
#router.register(r'customers', views.CustViewSet) 
 
urlpatterns = [
    url(r'^$', views.HomePageView.as_view()),
	url(r'^allActivities/', views.HomePageView.as_view()),
	url(r'^api/deleteActivity/',views.HomePageView.detailActivity),
	url(r'^api/activities/', views.HomePageView.getActivities),
	
   #url(r'^.*', TemplateView.as_view(template_name="home.html"), name="home")
   # url(r'^links/$', views.LinksPageView.as_view()), # simple view
   # url(r'^getcust/$',views.Actividades.getActividad), # simple view
   # url(r'^apitest/$',views.CalcTest), # for REST API test
]