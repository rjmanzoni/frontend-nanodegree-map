var map;

var markersViewModelList = ko.observableArray([]);

function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -23.5477279, lng: -46.6436846},
      zoom: 16
    });

    

   for (var i = 0; i < modelLocations.length; i++) {
        var position = modelLocations[i].location;
        var title = modelLocations[i].title;

        var marker = new google.maps.Marker({
        	map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

		marker.addListener('click', animate(marker));
		marker.addListener('click', infoWindowShow(marker));

        markers.push(marker);
        markersViewModelList.push(new MarkerViewModel(modelLocations[i].title, modelLocations[i].location, modelLocations[i].visible, marker));

         // marker.addListener('click', function() {
          //  populateInfoWindow(this, largeInfowindow);
          //});
         // bounds.extend(markers[i].position);

       // map.fitBounds(bounds);
      }
}

var modelLocations = [
	{title: 'Teatro Municipal de Sao Paulo', location: {lat: -23.545235, lng: -46.6386151}, visible:"true"},
	{title: 'Lanchonete Estadao', location: {lat: -23.5487193, lng: -46.642684}, visible:"true"},
	{title: 'Boate Love Story', location: {lat: -23.5459241, lng: -46.6450752}, visible:"true"},
	{title: 'Bar JazzB', location: {lat: -23.5448619, lng: -46.6450028}, visible:"true"},
	{title: 'Familia Mancini', location: {lat: -23.5503697, lng: -46.645088}, visible:"true"},
	{title: 'Praca Roosevelt', location: {lat: -23.547808, lng: -46.646737}, visible:"true"},
	{title: 'Edificio Copan', location: {lat: -23.5464774, lng: -46.644516}, visible:"true"}
];

var markers = [];

var MarkerViewModel = function(title, location, visible, marker){
	var self = this;
	self.title = ko.observable(title);
	self.location = ko.observable(location);
	self.visible = ko.observable(visible);
	self.marker = ko.observable(marker);
	self.infoWindowShow = infoWindowShow(marker);
	self.show = animate(marker);
}

var animate = function(clickedMarker){
	return function(){
			if(clickedMarker.getAnimation() == google.maps.Animation.BOUNCE){
				clickedMarker.setAnimation(null);
			}
			else{
				markers.forEach(function(marker){
				marker.setAnimation(null);
			});
			clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
		}
	}
}

var infoWindowShow = function(clickedMarker){
	return function(){
		var infoWindow = new google.maps.InfoWindow();
		console.log(infoWindow);
          infoWindow.marker = clickedMarker;
          infoWindow.setContent('<div>' + clickedMarker.title + '</div>');
          infoWindow.open(map, clickedMarker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infoWindow.addListener('closeclick',function(){
           		infoWindow.setMarker = null;
          	}
          );
	}
}

var ViewModel = function(markersViewModelList){
	self = this;

	this.filter = ko.observable();

	this.filterList = function(data, event){

		for (var i = 0; i < self.markersList().length; i++) {
			if(self.markersList()[i].title().toUpperCase().indexOf(data.filter().toUpperCase()) > -1){
				self.markersList()[i].visible("block");
				markers[i].setMap(map);
			}
			else{
				self.markersList()[i].visible("none");
				markers[i].setMap(null);
			}
		}

		return true;
	}
	this.markersList = markersViewModelList;
	//for (var i = 0; i < modelLocations.length; i++) {
	//	self.markersList.push(new MarkerViewModel(modelLocations[i].title, modelLocations[i].location, modelLocations[i].visible, i));
	//}

}

ko.applyBindings(new ViewModel(markersViewModelList));
