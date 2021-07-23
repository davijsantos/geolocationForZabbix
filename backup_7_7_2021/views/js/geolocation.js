window.addEventListener('load', ()=>{

    async function getDataFromJson(){
        let arrayOfLatLngs = [];

        for (let i = 0; i < content.length; i++) {
            if (content[i].lat && content[i].lon){
                arrayOfLatLngs.push([content[i].lat, content[i].lon]);
            }
        }

        let bounds = new L.LatLngBounds(arrayOfLatLngs);

        let mymap = L.map("mapid");

        // let markers = L.markerClusterGroup({
        //     maxClusterRadius: 120
        // });

        mymap.fitBounds(bounds);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);
    
        let greenMarker = L.icon({
            iconUrl: './modules/geolocation/views/js/images/marker-512_v.png',
            iconSize:     [38]
        });
        let redMarker = L.icon({
            iconUrl: './modules/geolocation/views/js/images/marker-512_m.png',
            iconSize:     [38]
        });
        let yellowMarker = L.icon({
            iconUrl: './modules/geolocation/views/js/images/marker-512_a.png',
            iconSize:     [38]
        });
        content.forEach((value,index) => {
            if (!(filterJson.hostids === null)){
                console.log(content)
                filterJson.hostids.forEach((val,ind) =>{
                    if(val == value.hostid){
                        if(value.lat && value.lon){
                            if(value.maintenance == 1){
                                L.marker([value.lat, value.lon], {icon: yellowMarker,riseOnHover: true}).addTo(mymap)
                                    .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1 target="_blank""><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                            }else if(value.problem === 1){
                                L.marker([value.lat, value.lon], {icon: redMarker,riseOnHover: true}).addTo(mymap)
                                    .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1 target="_blank""><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                            }else{
                                L.marker([value.lat, value.lon], {icon: greenMarker,riseOnHover: true}).addTo(mymap)
                                    .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1" target="_blank"><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                            }
                        }
                    }
                });
            }else{
                if(value.lat && value.lon){
                    if(value.maintenance == 1){
                        L.marker([value.lat, value.lon], {icon: yellowMarker,riseOnHover: true}).addTo(mymap)
                            .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1" target="_blank"><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                    }else if(value.problem === 1){
                        L.marker([value.lat, value.lon], {icon: redMarker,riseOnHover: true}).addTo(mymap)
                            .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1" target="_blank"><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                    }else{
                        L.marker([value.lat, value.lon], {icon: greenMarker,riseOnHover: true}).addTo(mymap)
                            .bindPopup(`<center><a href="${window.location.origin}/zabbix/zabbix.php?action=latest.view&filter_hostids%5B%5D=${value.hostid}&filter_application=&filter_select=&filter_set=1" target="_blank"><strong>${value.name}</strong> <br>(${value.host})</a></center>`);
                    }
                }
            }
        });
    }
    getDataFromJson();
});
