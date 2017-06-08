var WikiRestService = function(url){
	this.url = url;
}

WikiRestService.prototype.invoke = function(content, callbackSuccess, callBackError) {
	$.ajax( {
      url: this.url.replace('$value', content),
      dataType: 'jsonp',
      timeout: 5000,
      success: function(response) {
         callbackSuccess(response);
      },
      error: function(xhr, ajaxOptions, thrownError){
      	 callBackError(xhr, ajaxOptions, thrownError);
      }
    }
  );
}

var map;

var markersViewModelList = ko.observableArray([]);

var currentInfoWindow = null;
var currentMarker = null

var wikiRestService = new WikiRestService('https://en.wikipedia.org/w/api.php?action=opensearch&search=$value&format=json&callback=wikiCallback');

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

        var infoWindow = new google.maps.InfoWindow();
        currentInfoWindow = infoWindow;
        currentMarker = marker;

        infoWindow.setContent('<div>' + marker.title + '</div>');

		marker.addListener('click', animate(marker, infoWindow));

        markersViewModelList.push(new MarkerViewModel(modelLocations[i].title, modelLocations[i].location, modelLocations[i].visible, marker, infoWindow));
         
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

var MarkerViewModel = function(title, location, visible, marker, infoWindow){
	var self = this;
	self.title = ko.observable(title);
	self.location = ko.observable(location);
	self.visible = ko.observable(visible);
	self.marker = marker;
	self.infoWindow = infoWindow;
	self.show = animate(marker, infoWindow);
	self.wikiList = ko.observableArray([]);
}

var animate = function(clickedMarker, infoWindow){
	return function(){
			if(currentMarker != clickedMarker){
				currentMarker.setAnimation(null);
				clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
				currentMarker = clickedMarker;
			}else{
				if(clickedMarker.getAnimation() == null){
					clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
				}
				else{
					clickedMarker.setAnimation(null);
				}
			}
			currentInfoWindow.close();
			infoWindow.open(map, clickedMarker);
			currentInfoWindow = infoWindow;
		}
}


var ViewModel = function(markersViewModelList){
	self = this;

	this.filter = ko.observable();

	//console.log(markersViewModelList[0]);
	this.currentClickedMarker = ko.observable();

	this.filterList = function(data, event){

		for (var i = 0; i < self.markersList().length; i++) {
			if(self.markersList()[i].title().toUpperCase().indexOf(data.filter().toUpperCase()) > -1){
				self.markersList()[i].visible("block");
				self.markersList()[i].marker.setVisible(true);
			}
			else{
				self.markersList()[i].visible("none");
				self.markersList()[i].marker.setVisible(false);
				self.markersList()[i].infoWindow.close();
			}
		}

		return true;
	}
	this.markersList = markersViewModelList;
}

ko.applyBindings(new ViewModel(markersViewModelList));

var test = function(value){
	for(var i = 0 ; i < value.length; i++){
		console.log(value[i]);
	}
	
}

var err = function(a,b,c){
	console.log(a);
	console.log(b);
	console.log(c);
}

wikiRestService.invoke('Famiglia Mancini', test, err);

