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
      	 callBackError();
      }
    }
  );
}

var map;

var markersViewModelList = ko.observableArray([]);
var markersList = [];

var currentInfoWindow = null;
var currentMarker = null

var wikiRestService = new WikiRestService('https://en.wikipedia.org/w/api.php?action=opensearch&search=$value&format=json&callback=wikiCallback');

function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -23.5479528, lng: -46.6430906},
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
		markersList.push(marker);
		//marker.addListener('click', animate(marker, infoWindow));

        markersViewModelList.push(new MarkerModel(modelLocations[i].title, modelLocations[i].location, modelLocations[i].visible, marker, infoWindow));
         
      }
}

var modelLocations = [
	{title: 'Theatro Municipal (São Paulo)', location: {lat: -23.545235, lng: -46.6386151}, visible:"true"},
	{title: 'Praça da República', location: {lat: -23.543392, lng: -46.642537}, visible:"true"},
	{title: 'Edificio Itália', location: {lat: -23.545415, lng: -46.643553}, visible:"true"},
	{title: 'Centro Cultural Banco do Brasil', location: {lat: -23.5474917, lng: -46.6346508}, visible:"true"},
	{title: 'Praca Roosevelt', location: {lat: -23.547808, lng: -46.646737}, visible:"true"},
	{title: 'Edificio Copan', location: {lat: -23.5464774, lng: -46.644516}, visible:"true"}
];

var MarkerModel = function(title, location, visible, marker, infoWindow){
	var self = this;
	self.title = ko.observable(title);
	self.location = ko.observable(location);
	self.visible = ko.observable(visible);
	self.marker = marker;
	self.infoWindow = infoWindow;
	self.show = animate(marker, infoWindow);
	self.wikiList =  ko.observable();

	self.fill = function(response){
		self.wikiList(response[2]);
	}

	self.err = function(){
		self.wikiList('Não foi possível recuperar a infomação do wikipedia!');
	}
	
	wikiRestService.invoke(self.title(), self.fill, self.err);
	
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

	this.setCurrent = function(location){
		self.currentLocation(location.wikiList());
	}

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

	this.currentLocation = ko.observable();
}

ko.applyBindings(new ViewModel(markersViewModelList));

var test = function(value){
	value.forEach(function(x){
		console.log(x);
	});
}

var err = function(a,b,c){
	console.log(a);
	console.log(b);
	console.log(c);
}

wikiRestService.invoke('Centro Cultural Banco do Brasil', test, err);

