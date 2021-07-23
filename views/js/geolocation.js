window.addEventListener("load", () => {
  /**
   * Creates a map and set the maximum zoom to 18.
   */
  let mymap = L.map("mapid", {
    maxZoom: 18,
  });

  let activePolyline = L.layerGroup().addTo(mymap); // Creates a layer group with the polylines that draws the path to the parent host.

  let isActivePolyline = 0; // It's a flag to set if a polyline is drawn on the map.

  let legend = L.control({position: 'bottomleft'}); // Creates a box of legends
  legend.onAdd = function () { // Function to fill the box with the legends
    let div = L.DomUtil.create('div', 'info legend'); // Creates the html div where the legend will be.

    // Includes the legend data.
    div.innerHTML += '<img src="./modules/geolocation/views/js/images/marker-512_v.png" width="15px"/> <span>Host Status Ok</span> <br><br>'; 
    div.innerHTML += '<img src="./modules/geolocation/views/js/images/marker-512_m.png" width="15px"/> <span>Host Status Problem</span> <br><br>';
    div.innerHTML += '<img src="./modules/geolocation/views/js/images/marker-512_a.png" width="15px"/> <span>Host Status Maintenance</span> <br><br>';
    div.innerHTML += '<i class="legend-cluster ok-status"></i> <span>Cluster Hosts Status Ok</span> <br><br>';
    div.innerHTML += '<i class="legend-cluster problem-status"></i> <span>Cluster Host Status Problem</span> <br><br>';
    div.innerHTML += '<i class="legend-cluster maintenance-status"></i> <span>Cluster Host Status Maintenance</span> <br><br>';
    div.innerHTML += '<img src="./modules/geolocation/views/js/images/line.png" width="15px"/> <span>Distance Between Two Hosts</span><br><br>';
    // Button to clear all lines drawed on map.
    div.innerHTML += '<button id="clearLines">Clear lines</button> ';
    // Returns the div
    return div;
  };
  // Adds the legend on the map.
  legend.addTo(mymap);

  /**
   * Customizes the cluster icon by color.
   * CSS Class marker-cluster-(small/medium/large)
   */
  function customClusterIcon(cluster) {
    // Count number of markers from each category.
    let markers = cluster.getAllChildMarkers();

    let maintenanceCount = 0;
    let problemCount = 0;
    let okCount = 0;

    for (var marker of markers) {
      var category = marker.options.category;
      if (category && category === "maintenance") {
        maintenanceCount++;
      } else if (category === "problem") {
        problemCount++;
      } else if (category === "ok") {
        okCount++;
      }
    }
    // Generate the cluster icon depending on presence of Markers from different categories.
    if (problemCount > 0) {
      return L.divIcon({
        html: `<div><span>${
          problemCount + okCount + maintenanceCount
        }</span></div>`,
        className:
          "leaflet-marker-icon marker-cluster marker-cluster-large leaflet-zoom-animated leaflet-interactive",
        iconSize: [20, 20],
      });
    } else if (maintenanceCount > 0) {
      return L.divIcon({
        html: `<div><span>${okCount + maintenanceCount}</span></div>`,
        className:
          "leaflet-marker-icon marker-cluster marker-cluster-medium leaflet-zoom-animated leaflet-interactive",
        iconSize: [20, 20],
      });
    } else {
      return L.divIcon({
        html: `<div><span>${okCount}</span></div>`,
        className:
          "leaflet-marker-icon marker-cluster marker-cluster-small leaflet-zoom-animated leaflet-interactive",
        iconSize: [20, 20],
      });
    }
  }

  /**
   * Draws the line from a host to the parent host.
   */
  function getPathCoordinates(hostId) {
  
    let url = `${window.location.origin}/zabbix/zabbix.php?action=geolocation.view&hostid=${hostId}&getPathCoordinates=1`; // the way to receive the JSON data with the parent hosts.

    let latlngs = []; // array to receive the latitude and longitude data of each hosts that is a point in the draw.
  
    fetch(url, { method: 'GET' }) // Sends the request to get the JSON data with the parent hosts.
      .then(response => response.text()) // Obtains the response
      .then(data => { // Sends data

        a = data.replace(/'/g, '"'); // Replaces single quotes with double quotes.
        
        a = JSON.parse(a); // Converts the JSON data to a array.
        
        activePolyline.remove(); // Clears the layer group.
        activePolyline = L.layerGroup().addTo(mymap); // Reboot the layer group.
        if(isActivePolyline == hostId){ // Asks if there's a line drawn already in this specific path; if it's true, it'll just clear the line in the map, in the click button moment.
          isActivePolyline = 0; // Flag is unset.
          return; // The function is interrupted.
        }
        isActivePolyline = hostId; // Hold the last child host, from the line will be drawn.
        
        let polylines = []; // Declares the array to store the polylines
        let j = 0; // counter to indicate the index in the polyline array
        a.forEach(function (data,index) { // Loop to fill the polyline array
          latlngs.push([data[1], data[2]]); // Fill the latlngs array with the latitude and longitude information of the array.
          if(index > 0 && index < a.length){ // The line will be draw if and only if the latlngs array have 2 or more points with coordinates.
            polylines.push(L.polyline([latlngs[index-1],latlngs[index]], { // Draws a black line between two points on the map.
              color: 'black'
            }))
            polylines[j].addTo(activePolyline) // Adds the polyline to the activePolyline group.
            let labelLine = a[j][0]; // Gets the line label.
            let distance = getDistanceBetweenCoordinates(latlngs[index-1][0],latlngs[index-1][1],latlngs[index][0],latlngs[index][1]); // Get the distance between two points, calculated by the getDistanceBetweenCoordinates group.
            distance = distance.toFixed(3); // Fixes 3 decimal places. 
            polylines[j].setText(`${labelLine}`, {center: true, offset: -10, attributes: {'font-weight': '800',textLength:"0.5em",lengthAdjust:"spacingAndGlyphs"}}) // Sets the label in the line and the attributes of the text.
            polylines[j].setText(`${distance}km`, {center: true, offset: 15, attributes: {'font-weight': '800',textLength:"0.5em",lengthAdjust:"spacingAndGlyphs"}}) // Sets the distance in the line and the attributes of the text.
            j++; 
          }
        });
      })
      .catch(function (error) {
        console.log(error); // Shows the error in the browser console, if the request fails.
      });
  }

  /**
   * Gets the click of the path coordinates button to call the getPathCoordinates function.
   */
  function callToGetPathCoordinates(hostid){
    let pathButton = document.getElementById(`pathButton-${hostid}`);
    pathButton.onclick = function () {
      getPathCoordinates(hostid);
    }   
  }


  /**
   * Calculates the distance between two coordinates.
   */
  function getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2, unit = 'K'){
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit=="K") { dist = dist * 1.609344 }
      if (unit=="N") { dist = dist * 0.8684 }
      return dist;
    }
  }


  /**
   * Prints the markers and the map in the div.
   */
  async function getDataFromJson() {

    /**
     * Fills array with latitude and longitude data from Zabbix API.
     */

    let arrayOfLatLngs = [];

    for (let i = 0; i < content.length; i++) {
      if (content[i].lat && content[i].lon) {
        arrayOfLatLngs.push([content[i].lat, content[i].lon]);
      }
    }

    /**
     * Sets the limits for the Zoom pattern.
     */

    let bounds = new L.LatLngBounds(arrayOfLatLngs);

    mymap.fitBounds(bounds);

    /**
     * Declares the customClusterIcon function, where the clusters styles are defined. 
     */

    let markers = L.markerClusterGroup({
      iconCreateFunction: customClusterIcon,
    }).addTo(mymap);

    /**
     * Declares the 3 types of layer groups by each host status.
     */

    let maintenance = L.layerGroup();
    let problem = L.layerGroup();
    let ok = L.layerGroup();

    /**
     * Declares the markers icon by each style.
     */

    let greenMarker = L.icon({
      iconUrl: "./modules/geolocation/views/js/images/marker-512_v.png",
      iconSize: [30],
    });
    let redMarker = L.icon({
      iconUrl: "./modules/geolocation/views/js/images/marker-512_m.png",
      iconSize: [30],
    });
    let yellowMarker = L.icon({
      iconUrl: "./modules/geolocation/views/js/images/marker-512_a.png",
      iconSize: [30],
    });

    /**
     * Correlates the markers icon with your corresponding category, corresponding to the host status.
     */

    let problemStyle = {
      icon: redMarker,
      category: "problem"
    };

    let maintenanceStyle = {
      icon: yellowMarker,
      category: "maintenance"
    };

    let okStyle = {
      icon: greenMarker,
      category: "ok"
    };

    /**
     * Loop to print each marker on the map.
     */

    let promiseContent = new Promise((resolve, reject) => {
      content.forEach((value, index, array) => {     
        /**
         * Declares Popup content for each marker, with the content that come from the "content" variable.
         */
        let popupLink = `<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view`; // string with the begining of the link 
        popupLink += `&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1" target="_blank">`; // Adds the filter to the latest data page.
        let popupCloseTagLink = "</a></center>"; // string to close the link
        let popupContent = ""; //this variable will contain the name and/or the hostname of the host, based on the info that come from Zabbix API.
        let title = "";
        
        if (value.host !== value.name){ // Checks if the visible name is equal to the host name in Zabbix.
          popupContent += `<center><p><strong>${value.name}</strong> <br>(${value.host})</p></center>`;   // Prints the visible name and the hostname, because they are differents.
          title += `${value.name} ${value.host}`
        }else{
          popupContent += `<center><p><strong>${value.name}</strong></p></center>`;   // Prints only the visible name, because the hostname and the visible name are the same.
          title += `${value.name}`
        }

        popupContentOnClick = `${popupLink}${popupContent}${popupCloseTagLink}<center><button id="pathButton-${value.hostid}">Path</button></center>`; //This variable is used when the marker is clicked, showing a link to the latest data screen of the host.

        /**
         * Function to create and set markers on map. 
         */
        function createAndSetMarker(style, lat, lon, layerGroup, hostId,hostName){
          style.title = `${hostName}`;
          let marker = L.marker([lat, lon], style) // Declares marker with the latitude and longitude information and the respective style
                      .addTo(layerGroup); // Adds to the layer group named maintenance.
          marker.on('click', async (ev) => { // function to show the popup with link to latest data and the button to draw the line to the parent host.
            popupContentOnClick = `${popupLink}${popupContent}${popupCloseTagLink}<center><button id="pathButton-${hostId}">Path</button></center>`; // Concatenates the link variables with the label variable with the path-to-the-parent-host button
            await mymap.closePopup(); // Closes any popups that might are open on the map.
            await ev.target.bindPopup(popupContentOnClick); // Binds the popup (with link) with the marker.
            await ev.target.openPopup(); // Opens the popup above the marker.
            flagPopupOpened = 1; // Flag to inform that the popup popupContentOnClick is opened.
            callToGetPathCoordinates(hostId); // Function to wait a click on the path button.
          });
        }

        //Checks if there is a filter active to show only the wanted marker on the map.
        if (!(filterJson.hostids === null)) {
          filterJson.hostids.forEach((val, ind) => { // Gets the hostids set in the filter area.
            if (val == value.hostid) { // Checks if the current value (hostid) in the loop is equal to the value(s) set in the filter
              if (value.lat && value.lon) { // Checks if the current host have latitude and longitude informantion; when not, the host is not shown.
                if (value.maintenance == 1) { // If the maintenance value is 1, it means that the host will be shown with yellow color, as specified previously in the markers variables declaration 
                  createAndSetMarker(maintenanceStyle, value.lat, value.lon, maintenance, value.hostid,title); // Calls function to create the marker and set it on the map.
                } else if (value.problem === 1) {
                  createAndSetMarker(problemStyle, value.lat, value.lon, problem, value.hostid,title); // Calls function to create the marker and set it on the map.
                } else {
                  createAndSetMarker(okStyle, value.lat, value.lon, ok, value.hostid,title); // Calls function to create the marker and set it on the map.
                }
              }
            }
          });
        } else {
          if (value.lat && value.lon) {
            if (value.maintenance == 1) {
              createAndSetMarker(maintenanceStyle, value.lat, value.lon, maintenance, value.hostid,title); // Calls function to create the marker and set it on the map.
            } else if (value.problem === 1) {
              createAndSetMarker(problemStyle, value.lat, value.lon, problem, value.hostid,title); // Calls function to create the marker and set it on the map.
            } else {
              createAndSetMarker(okStyle, value.lat, value.lon, ok, value.hostid,title); // Calls function to create the marker and set it on the map.
            }
          }
        }

        if(index === array.length -1) resolve();
        
      });
    })

    promiseContent.then(() => {
      markers.addLayers([maintenance, problem, ok]); // Adds layers of markers to the markers cluster group.
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { // Adds tile layer with credits.
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    /**
     * Leaflet Search to find hosts in map.
     * The search button is placed on the map in the top right place.
     * A 18 zoom is set when a host is found.
     */
    let searchControl = new L.Control.Search({
      layer: markers,
      position: 'topright',
      initial: false,
      marker: false,
      zoom: 18
    });

    mymap.addControl( searchControl ); // Adds search control on the map.
  }

  getDataFromJson(); // Calls to the function that fill the map with markers that correspond to hosts whose information comes from Zabbix API.

  let clearLines = document.getElementById('clearLines'); // Button to clear all lines drawed on map.
  clearLines.onclick = () => { // Waits for the click on the button to clear all lines drawed on map.
    activePolyline.remove(); // Clears the layer group.
    activePolyline = L.layerGroup().addTo(mymap); // Reboot the layer group.
    if(isActivePolyline !== 0){ // Asks if there's a line drawn already in this specific path; if it's true, it'll just clear the line in the map, in the click button moment.
      isActivePolyline = 0; // Flag is unset.
    }
  }

});