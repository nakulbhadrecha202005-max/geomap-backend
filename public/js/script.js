const socket = io()

if (navigator.geolocation) { // navigator inbuilt object in browser
  navigator.geolocation.watchPosition((position_value) => { // position of person
    const { latitude, longitude } = position_value.coords
    socket.emit('send-Location', { latitude, longitude}) // we send location to server named "send-Location"
  }, (error) => {
    console.log('Error : ', error)
  }, {
    enableHighAccuracy: true, // 
    timeout: 5000,
    maximumAge: 0 // no cache, always get new location
  })
}

const map = L.map('map').setView([8, 68], 16) // [0,0] lat lon means center , 10 zoom level
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Nakul_bhadrecha' // open streep map providing free map tiles
}).addTo(map); // {} object

const marker = {}

socket.on('recived_Location', (data) => {
  const { _id, data: { latitude, longitude } } = data
  map.setView([latitude, longitude]) // set view to new location
  if (marker[_id]) {
    marker[_id].setLatLng([latitude, longitude])
  } else {
    marker[_id] = L.marker([latitude, longitude]).addTo(map) // add marker to map
  }
})
