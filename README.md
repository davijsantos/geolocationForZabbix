# Geolocation For Zabbix
Geolocation Monitoring in Zabbix
Credits
Leaflet - a Javascript library for interactive maps (https://leafletjs.com/)
Leaflet Markercluster (https://github.com/Leaflet/Leaflet.markercluster) - by yukunzeng 
Leaflet Text Path (https://github.com/makinacorpus/Leaflet.TextPath) - by Makina Corpus
Leaflet Control Search (https://opengeo.tech/maps/leaflet-search/) - by Stefano Cudini
Function to Calculate the distance between two coordinates (https://www.geodatasource.com/developers/javascript) - by GeoDataSource Team

A project that adds as a module a geolocation monitoring for hosts. If your project needs for something like this, feel free to use it.

Add this project in a directory inside the modules directory. Follow the steps in Zabbix Documentation to activate the module in your Zabbix. (https://www.zabbix.com/documentation/current/manual/modules)

Tested in Zabbix 5.0 or superior.
## Browsers
* Google Chrome
* Chromium based

## Usage

Fill correctly the next fields in Inventory tab in your host configuration:
* Location latitude
* Location longitude

In this way, the point will appear on map.

### Establishing the host dependency tree

Fill correctly the next field in Inventory tab in your host configuration:
* Host router

Obs.: The name has to be exactly the host "Visible Name".

