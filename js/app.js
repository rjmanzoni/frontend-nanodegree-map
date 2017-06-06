var modelLocations = [
	{title: 'Teatro Municipal de Sao Paulo', location: {lat: -23.545235, lng: -46.6386151}, visible:"true"},
	{title: 'Lanchonete Estadao', location: {lat: -23.5487193, lng: -46.642684}, visible:"true"},
	{title: 'Boate Love Story', location: {lat: -23.5459241, lng: -46.6450752}, visible:"true"},
	{title: 'Bar JazzB', location: {lat: -23.5448619, lng: -46.6450028}, visible:"true"},
	{title: 'Familia Mancini', location: {lat: -23.5503697, lng: -46.645088}, visible:"true"},
	{title: 'Praca Roosevelt', location: {lat: -23.547808, lng: -46.646737}, visible:"true"},
	{title: 'Edificio Copan', location: {lat: -23.5464774, lng: -46.644516}, visible:"true"}
];

var ViewModel = function(){
	self = this;

	this.filter = ko.observable();

	this.filterList = function(data, event){
		//self.markersList.removeAll();
		//var x = ko.observableArray();
		self.markersList().forEach(function(marker){
			if(marker().title.toUpperCase().indexOf(data.filter().toUpperCase()) > -1){
				marker().title = "none";
				console.log(marker().title);
			}
		});
		//console.log(x);
		//self.markersList = x;
		//self.markersList()[0].title = 'asdas';
		return true;
	}

	var array = [];
		modelLocations.forEach(function(marker){
			array.push(ko.observable(marker));
		});

	self.markersList = ko.observableArray(array);
	
}

ko.applyBindings(new ViewModel());

var map;
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
         // markers.push(marker);
          
         // marker.addListener('click', function() {
          //  populateInfoWindow(this, largeInfowindow);
          //});
         // bounds.extend(markers[i].position);
        
       // map.fitBounds(bounds);
      }
}
