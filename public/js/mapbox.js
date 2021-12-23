const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoianMwMDAiLCJhIjoiY2tzZXltb2YxMTUyZDMwb2Q1d2I4ZzFnYiJ9.5qVNCSjIGDPYA1EhDHLWUw';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/js000/ckx1xilz93mvo15ns4x13x4oe',
        scrollZoom: false
    })
    
    const bounds = new mapboxgl.LngLatBounds()
    
    locations.forEach(location => {
        const el = document.createElement('div')
        el.className = 'marker'
    
        const popup = new mapboxgl.Popup({offset: 30 })
        .setLngLat(location.coordinates)
        .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
        .setMaxWidth("300px")
        .addTo(map)
    
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(location.coordinates)
        .addTo(map)
    
        bounds.extend(location.coordinates)
    });
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
        }
    })
}

const mapBox = document.getElementById('map')

if(mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}