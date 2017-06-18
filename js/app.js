var WikiRestService = function(url){
	this.url = url;
};

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
    });
};

var map;
var currentInfoWindow = null;
var currentMarker = null;

var ERROR_MESSAGE = 'Não foi possivel obter infomação no Wikipedia! Possível problema de comunicação.';
var showErrorMessage = false;

var modelLocations = [
	{title: 'Theatro Municipal (São Paulo)', location: {lat: -23.545235, lng: -46.6386151}, visible:"true"},
	{title: 'Praça da República', location: {lat: -23.543392, lng: -46.642537}, visible:"true"},
	{title: 'Edificio Itália', location: {lat: -23.545415, lng: -46.643553}, visible:"true"},
	{title: 'Centro Cultural Banco do Brasil', location: {lat: -23.5474917, lng: -46.6346508}, visible:"true"},
	{title: 'Praca Roosevelt', location: {lat: -23.547808, lng: -46.646737}, visible:"true"},
	{title: 'Edificio Copan', location: {lat: -23.5464774, lng: -46.644516}, visible:"true"}
];

//variável que mantem um mapa de marker e infowindow para estabelecer o vinculo com marker/infowindow e as localizacoes
var mapList = {};

modelLocations.forEach(function(value){
	mapList[value.title] = {marker: null, infoWindow: null};
});

var wikiRestService = new WikiRestService('https://en.wikipedia.org/w/api.php?action=opensearch&search=$value&format=json&callback=wikiCallback');

function googleError(){
	alert('Não foi possível carregar o Mapa do Google');
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: -23.5479528, lng: -46.6430906},
    	zoom: 16
	});

   var error = function(){
        if(!showErrorMessage){
        	alert(ERROR_MESSAGE);
        	showErrorMessage = true;
        }
   	};

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

        //preenche a informacao do WIKI
        var wiki = function(info){
        	return function(response){
        		info.setContent('<div>' + response[2] + '</div>');
        	};
        }(infoWindow);

        

        wikiRestService.invoke(title, wiki, error);

		marker.addListener('click', showInfoWindowAndMarker(title));
		
		modelLocations[i].marker = marker;
		mapList[title].marker = marker;
		mapList[title].infoWindow = infoWindow;
      }
}

//funcao que mostra animacao qd e' clicado na lista ou no marker
var showInfoWindowAndMarker = function(title){
	return function(){
		var clickedMarker = mapList[title].marker;
		var infoWindow = mapList[title].infoWindow;
		if(currentMarker != clickedMarker){
			currentMarker.setAnimation(null);
				clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
			currentMarker = clickedMarker;
		}else{
			if(clickedMarker.getAnimation() === null){
				clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
			}
			else{
				clickedMarker.setAnimation(null);
			}
		}
		currentInfoWindow.close();
		infoWindow.open(map, clickedMarker);
		currentInfoWindow = infoWindow;
	};
};

var LocationModel = function(title, location, visible){
	var self = this;

	self.title = ko.observable(title);
	self.location = ko.observable(location);
	self.visible = ko.observable(visible);
	self.show = showInfoWindowAndMarker(title);	

};

var ViewModel = function(modelLocations){
	self = this;

	this.filter = ko.observable();
	this.markersList = ko.observableArray();
	this.isOpen = ko.observable(false);

	for (var i = 0; i < modelLocations.length; i++) {
		this.markersList.push(new LocationModel(modelLocations[i].title, modelLocations[i].location, modelLocations[i].visible));
	}

	//filtra as localizacoes conforme o usuario digita
	this.filterList = function(data, event){

		for (var i = 0; i < self.markersList().length; i++) {
			if(self.markersList()[i].title().toUpperCase().indexOf(data.filter().toUpperCase()) > -1){
				self.markersList()[i].visible("block");
				mapList[self.markersList()[i].title()].marker.setVisible(true);
			}
			else{
				self.markersList()[i].visible("none");
				mapList[self.markersList()[i].title()].marker.setVisible(false);
				mapList[self.markersList()[i].title()].infoWindow.close();
			}
		}

		return true;
	};

	this.toggle = function(){
		self.isOpen(!this.isOpen());
	};
	
};

ko.applyBindings(new ViewModel(modelLocations));
