const defaultPlaces = {
    1: { id: 1, name: "Grand Central Station", lat: 40.7527, lng: -73.9772, day: "1602" },
    2: { id: 2, name: "Chrysler Building", lat: 40.7516, lng: -73.9755, day: "1602" },
    3: { id: 3, name: "Bryant Park", lat: 40.7536, lng: -73.9832, day: "1602" },
    4: { id: 4, name: "Summit One Vanderbilt", lat: 40.7529, lng: -73.9786, day: "1602" },
    5: { id: 5, name: "Times Square", lat: 40.7580, lng: -73.9855, day: "1702" },
    6: { id: 6, name: "Madison Square Garden", lat: 40.7505, lng: -73.9934, day: null },
    7: { id: 7, name: "Fifth Avenue", lat: 40.7749, lng: -73.9657, day: "1602" },
    8: { id: 8, name: "Empire State Building", lat: 40.7484, lng: -73.9857, day: null },
    9: { id: 9, name: "Flatiron Building", lat: 40.7411, lng: -73.9897, day: "1402" },
    10: { id: 10, name: "Madison Square Park", lat: 40.7424, lng: -73.9876, day: "1402" },
    11: { id: 11, name: "St Patrick's Cathedral", lat: 40.7585, lng: -73.9760, day: null },
    12: { id: 12, name: "Hudson Yards", lat: 40.7540, lng: -74.0027, day: "1402" },
    13: { id: 13, name: "The Vessel", lat: 40.7536, lng: -74.0025, day: "1402" },
    14: { id: 14, name: "Edge at Hudson Yards", lat: 40.7539, lng: -74.0019, day: "1402" },
    15: { id: 15, name: "The High Line", lat: 40.7479, lng: -74.0049, day: null },
    16: { id: 16, name: "Chelsea Market", lat: 40.7424, lng: -74.0060, day: null },
    17: { id: 17, name: "Wall Street", lat: 40.7064, lng: -74.0094, day: null },
    18: { id: 18, name: "9/11 Memorial & Museum", lat: 40.7115, lng: -74.0134, day: "1202" },
    19: { id: 19, name: "One World Observatory", lat: 40.7130, lng: -74.0132, day: null },
    20: { id: 20, name: "Oculus", lat: 40.7116, lng: -74.0126, day: "1202" },
    21: { id: 21, name: "Brooklyn Bridge", lat: 40.7061, lng: -73.9969, day: "1302" },
    22: { id: 22, name: "Pier 35", lat: 40.7094517, lng: -73.9884141, day: "1302" },
    23: { id: 23, name: "DUMBO", lat: 40.7033, lng: -73.9881, day: "1302" },
    24: { id: 24, name: "Brooklyn Bridge Park", lat: 40.7003, lng: -73.9967, day: "1302" },
    25: { id: 25, name: "Brooklyn Heights Promenade", lat: 40.6964, lng: -73.9973, day: "1302" },
    26: { id: 26, name: "Roosevelt Island", lat: 40.7618, lng: -73.9496, day: null },
    27: { id: 27, name: "Time Out Market", lat: 40.7031, lng: -73.9903, day: "1302" },
    28: { id: 28, name: "230 Fifth Rooftop Bar", lat: 40.7430, lng: -73.9887, day: "1402" },
    29: { id: 29, name: "Central Park", lat: 40.7829, lng: -73.9654, day: "1502" },
    30: { id: 30, name: "Columbus Circle", lat: 40.7681, lng: -73.9819, day: "1502" },
    31: { id: 31, name: "Greenwich Village", lat: 40.7336, lng: -74.0027, day: null },
    32: { id: 32, name: "Washington Square Park", lat: 40.7305056, lng: -73.9968651, day: "1702" },
    33: { id: 33, name: "Grundy Park point de vue New jersey", lat: 40.7162153, lng: -74.0318602, day: "1202" },
    34: { id: 34, name: "Squibb Park Bridge", lat: 40.7010568, lng: -73.9963321, day: "1302" },
    35: { id: 35, name: "Emmett's deep dish", lat: 40.7273322, lng: -74.0024485, day: "1302" },
    36: { id: 36, name: "Hoboken Pier C Panoramic", lat: 40.7403707, lng: -74.0250004, day: "1202" },
    37: { id: 37, name: "Roosevelt Island tramway", lat: 40.7612789, lng: -73.9641664, day: "1602" },
    38: { id: 38, name: "RoofTop at Exchange Place", lat: 40.7157003, lng: -74.0337627, day: "1202" },
    39: { id: 39, name: "Dallas BBQ", lat: 40.7570239, lng: -73.9886626, day: "1402" },
    40: { id: 40, name: "Planet Hollywood", lat: 40.7553336, lng: -73.9856934, day: "1502" },
    41: { id: 41, name: "Hard Rock Cafe", lat: 40.7570352, lng: -73.9866112, day: "1602" },
    42: { id: 42, name: "Shake Shack", lat: 40.7584105, lng: -73.989219, day: "1702" },
    43: { id: 43, name: "Freeman Alley", lat: 40.721604, lng: -73.9926156, day: "1602" },
    44: { id: 44, name: "Catholic Church of St. Joseph", lat: 40.8117583, lng: -73.9541139, day: "1502" }
};

function loadPlaces() {
    const saved = localStorage.getItem('places');
    const migratedPlaces = {};
    
    if (saved) {
        const loadedPlaces = JSON.parse(saved);
        
        Object.keys(loadedPlaces).forEach(key => {
            const place = loadedPlaces[key];
            if (typeof place === 'object' && place !== null) {
                let id;
                let name;
                let day;
                
                if (place.hasOwnProperty('id')) {
                    id = parseInt(place.id);
                    name = place.name || key;
                    day = place.hasOwnProperty('day') ? place.day : null;
                } else {
                    const match = key.match(/^(\d+)\s+(.+)$/);
                    if (match) {
                        id = parseInt(match[1]);
                        name = match[2];
                        day = place.hasOwnProperty('day') ? place.day : null;
                    } else {
                        id = parseInt(key);
                        if (!isNaN(id)) {
                            name = place.name || key;
                            day = place.hasOwnProperty('day') ? place.day : null;
                        } else {
                            return;
                        }
                    }
                }
                
                if (!isNaN(id)) {
                    if (day === null && defaultPlaces[id] && defaultPlaces[id].day !== null) {
                        day = defaultPlaces[id].day;
                    }
                    
                    migratedPlaces[id] = {
                        id,
                        name,
                        lat: place.lat,
                        lng: place.lng,
                        day: day || null
                    };
                }
            }
        });
    }
    
    Object.keys(defaultPlaces).forEach(id => {
        if (!migratedPlaces[id]) {
            migratedPlaces[id] = { ...defaultPlaces[id] };
        }
    });
    
    return migratedPlaces;
}

function savePlaces(placesData) {
    localStorage.setItem('places', JSON.stringify(placesData));
}

let places = loadPlaces();

function getPlaceName(id) {
    const place = places[id];
    return place ? place.name : null;
}

function getPlaceIdByName(name) {
    for (const id in places) {
        if (places[id].name === name) {
            return parseInt(id);
        }
    }
    return null;
}

function getMaxId() {
    const ids = Object.keys(places).map(id => parseInt(id));
    return ids.length > 0 ? Math.max(...ids) : 0;
}

function getPlacesByDay(day) {
    const dayStr = day.toString().padStart(2, '0') + '02';
    return Object.keys(places).filter(id => {
        const place = places[id];
        return place && place.day === dayStr;
    }).map(id => parseInt(id)).sort((a, b) => a - b);
}

const maps = {};
const allMarkers = {};
const dayMarkers = {};
let userLocationMarker = null;
let userLocationWatchId = null;
let currentMap = null;
let currentUserPosition = null;
let currentRouteLayer = null;
let routeCalculatorLayer = null;
let routeCalculatorActive = false;
let legendActive = false;
let currentTileLayer = null;
let currentMapStyle = 'osm';
const mapTileLayers = {};

const mapStyles = {
    osm: {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    },
    topo: {
        name: 'Topographique',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap contributors',
        maxZoom: 17
    },
    positron: {
        name: 'Clair',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    },
    dark: {
        name: 'Sombre',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    },
    terrain: {
        name: 'Terrain',
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
        attribution: '© Stamen Design © OpenStreetMap contributors',
        maxZoom: 18
    },
    cycle: {
        name: 'Cyclisme',
        url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors © CyclOSM',
        maxZoom: 20
    }
};

const hotel = {
    name: "Hotel Fairfield",
    lat: 40.7565038,
    lng: -73.9924764
};

const createRedIcon = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 30">
        <path fill="#FF0000" d="M10 0C4.5 0 0 4.5 0 10c0 10 10 20 10 20s10-10 10-20c0-5.5-4.5-10-10-10z"/>
        <circle fill="#FFFFFF" cx="10" cy="10" r="3.5"/>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return L.icon({
        iconUrl: url,
        iconSize: [20, 30],
        iconAnchor: [10, 30],
        popupAnchor: [0, -30]
    });
};

const redIcon = createRedIcon();

function initMap(day) {
    const mapId = `map-${day}`;
    const container = document.getElementById(mapId);
    if (!container || maps[day]) return;

    if (day === 'all') {
        initAllMap();
        return;
    }

    const dayPlacesList = getPlacesByDay(day);
    const coordinates = dayPlacesList
        .map(id => places[id])
        .filter(coord => coord !== undefined);

    if (coordinates.length === 0) return;

    const avgLat = coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;

    const map = L.map(mapId).setView([avgLat, avgLng], 13);

    const style = mapStyles[currentMapStyle];
    const tileLayer = L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: style.maxZoom
    }).addTo(map);
    mapTileLayers[day] = tileLayer;
    if (day === 'all' || !currentTileLayer) {
        currentTileLayer = tileLayer;
    }

    if (!dayMarkers[day]) {
        dayMarkers[day] = {};
    }

    dayPlacesList.forEach(id => {
        const place = places[id];
        if (place) {
            const marker = L.marker([place.lat, place.lng])
                .addTo(map)
                .bindPopup(createPopupContent(place.name, place.lat, place.lng));
            dayMarkers[day][id] = marker;
        }
    });

    const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(createPopupContent(hotel.name, hotel.lat, hotel.lng));

    const bounds = coordinates.map(c => [c.lat, c.lng]);
    bounds.push([hotel.lat, hotel.lng]);
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    maps[day] = map;
    currentMap = map;
    startGPSLocation();
}

function initAllMap() {
    const mapId = 'map-all';
    const container = document.getElementById(mapId);
    if (!container) return;
    
    if (maps['all']) {
        createLegend();
        return;
    }

    const allCoordinates = Object.values(places);
    if (allCoordinates.length === 0) return;

    const avgLat = allCoordinates.reduce((sum, c) => sum + c.lat, 0) / allCoordinates.length;
    const avgLng = allCoordinates.reduce((sum, c) => sum + c.lng, 0) / allCoordinates.length;

    const map = L.map(mapId).setView([avgLat, avgLng], 12);

    const style = mapStyles[currentMapStyle];
    const tileLayer = L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: style.maxZoom
    }).addTo(map);
    mapTileLayers['all'] = tileLayer;
    currentTileLayer = tileLayer;

    Object.keys(places).forEach(id => {
        const place = places[id];
        if (place) {
            const marker = L.marker([place.lat, place.lng])
                .addTo(map)
                .bindPopup(createPopupContent(place.name, place.lat, place.lng));
            allMarkers[id] = marker;
        }
    });

    const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(createPopupContent(hotel.name, hotel.lat, hotel.lng));
    allMarkers[hotel.name] = hotelMarker;

    const bounds = allCoordinates.map(c => [c.lat, c.lng]);
    bounds.push([hotel.lat, hotel.lng]);
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }

    maps['all'] = map;
    currentMap = map;
    startGPSLocation();
    
    setTimeout(() => {
        createLegend();
    }, 200);
}

function createLegend() {
    const legendItems = document.getElementById('legend-items');
    if (!legendItems) {
        console.log('legend-items not found');
        return;
    }

    legendItems.innerHTML = '';

    const savedStates = JSON.parse(localStorage.getItem('legendCheckboxStates') || '{}');

    const sortedPlaces = Object.keys(places).map(id => parseInt(id)).sort((a, b) => a - b);
    sortedPlaces.forEach(id => {
        const place = places[id];
        const placeName = place.name;
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.dataset.placeId = id;
        item.dataset.placeName = placeName.toLowerCase();
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `legend-${id}`;
        checkbox.dataset.placeId = id;
        checkbox.checked = savedStates[id] !== undefined ? savedStates[id] : true;
        checkbox.addEventListener('change', (e) => {
            const placeId = parseInt(e.target.dataset.placeId);
            const isChecked = e.target.checked;
            togglePlace(placeId, isChecked);
            updateToggleAllState();
            
            const states = JSON.parse(localStorage.getItem('legendCheckboxStates') || '{}');
            states[placeId] = isChecked;
            localStorage.setItem('legendCheckboxStates', JSON.stringify(states));
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.style.flex = '1';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = placeName;
        label.appendChild(nameSpan);
        
        if (currentUserPosition) {
            if (place) {
                const distance = calculateDistance(
                    currentUserPosition.lat,
                    currentUserPosition.lng,
                    place.lat,
                    place.lng
                );
                const distanceMeters = Math.round(distance);
                const distanceSpan = document.createElement('span');
                distanceSpan.textContent = ` (${distanceMeters} m)`;
                distanceSpan.style.fontSize = '0.85em';
                distanceSpan.style.color = '#666';
                label.appendChild(distanceSpan);
            }
        }

        const zoomButton = document.createElement('button');
        zoomButton.className = 'legend-zoom-btn';
        zoomButton.type = 'button';
        zoomButton.innerHTML = '🔍';
        zoomButton.title = 'Zoomer sur ce lieu';
        zoomButton.addEventListener('click', (e) => {
            e.stopPropagation();
            zoomToPlace(id);
            const legend = document.getElementById('legend');
            if (legend && legend.classList.contains('active')) {
                legend.classList.remove('active');
                const overlay = document.querySelector('.legend-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                const toggleLegendBtn = document.getElementById('toggle-legend');
                if (toggleLegendBtn) {
                    toggleLegendBtn.textContent = 'Afficher légende';
                }
                const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
                if (toggleLegendMobileBtn) {
                    toggleLegendMobileBtn.textContent = 'Afficher légende';
                }
                document.body.style.overflow = '';
                const toggleRouteMobileBtn = document.getElementById('toggle-route-mobile');
                if (toggleRouteMobileBtn) {
                    toggleRouteMobileBtn.style.display = 'block';
                }
                const showRouteCalculatorBtn = document.getElementById('show-route-calculator');
                if (showRouteCalculatorBtn) {
                    showRouteCalculatorBtn.style.display = 'block';
                }
            }
        });

        item.appendChild(checkbox);
        item.appendChild(label);
        item.appendChild(zoomButton);
        legendItems.appendChild(item);
        
        togglePlace(id, checkbox.checked);
    });
    
    updateToggleAllState();
}

function filterLegend(searchTerm) {
    const legendItems = document.querySelectorAll('.legend-item');
    const term = searchTerm.toLowerCase().trim();
    
    legendItems.forEach(item => {
        const placeName = item.dataset.placeName;
        if (placeName && placeName.includes(term)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
    
    updateToggleAllState();
}

function togglePlace(id, visible) {
    const marker = allMarkers[id];
    if (marker && maps['all']) {
        if (visible) {
            if (!maps['all'].hasLayer(marker)) {
                marker.addTo(maps['all']);
            }
        } else {
            if (maps['all'].hasLayer(marker)) {
                maps['all'].removeLayer(marker);
            }
        }
    }
}

function zoomToPlace(id) {
    const place = places[id];
    const marker = allMarkers[id];
    
    if (!place || !marker) {
        return;
    }

    const dayAllSection = document.getElementById('day-all');
    if (dayAllSection) {
        const currentDisplay = dayAllSection.style.display;
        if (currentDisplay === 'none') {
            showDay('all');
            setTimeout(() => {
                performZoomToPlace(id, place, marker);
            }, 300);
        } else {
            performZoomToPlace(id, place, marker);
        }
    }
}

function performZoomToPlace(id, place, marker) {
    const map = maps['all'];
    if (!map) {
        return;
    }

    map.setView([place.lat, place.lng], 16, {
        animate: true,
        duration: 0.5
    });

    setTimeout(() => {
        if (marker && map.hasLayer(marker)) {
            marker.openPopup();
        }
    }, 600);
}

function initRouteCalculator() {
    const routeStartInput = document.getElementById('route-start');
    const routeEndInput = document.getElementById('route-end');
    const calculateButton = document.getElementById('calculate-route');
    const routeResult = document.getElementById('route-result');

    if (!routeStartInput || !routeEndInput || !calculateButton) {
        return;
    }

    function createSuggestions(input, suggestionsContainer) {
        const searchTerm = input.value.toLowerCase().trim();
        const placeList = Object.keys(places).map(id => {
            const place = places[id];
            return { id: parseInt(id), name: place.name };
        }).sort((a, b) => a.name.localeCompare(b.name));
        const filtered = placeList.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        ).slice(0, 10);

        suggestionsContainer.innerHTML = '';
        
        if (searchTerm.length > 0 && filtered.length > 0) {
            suggestionsContainer.classList.add('active');
            filtered.forEach(item => {
                const div = document.createElement('div');
                div.className = 'route-suggestion-item';
                div.textContent = item.name;
                div.addEventListener('click', () => {
                    input.value = item.name;
                    suggestionsContainer.classList.remove('active');
                });
                suggestionsContainer.appendChild(div);
            });
        } else {
            suggestionsContainer.classList.remove('active');
        }
    }

    const startSuggestions = document.getElementById('route-start-suggestions');
    if (routeStartInput && startSuggestions) {
        routeStartInput.addEventListener('input', () => {
            createSuggestions(routeStartInput, startSuggestions);
        });

        routeStartInput.addEventListener('focus', () => {
            if (routeStartInput.value.trim().length > 0) {
                createSuggestions(routeStartInput, startSuggestions);
            }
        });

        document.addEventListener('click', (e) => {
            if (!routeStartInput.contains(e.target) && !startSuggestions.contains(e.target)) {
                startSuggestions.classList.remove('active');
            }
        });
    }

    const endSuggestions = document.getElementById('route-end-suggestions');
    if (routeEndInput && endSuggestions) {
        routeEndInput.addEventListener('input', () => {
            createSuggestions(routeEndInput, endSuggestions);
        });

        routeEndInput.addEventListener('focus', () => {
            if (routeEndInput.value.trim().length > 0) {
                createSuggestions(routeEndInput, endSuggestions);
            }
        });

        document.addEventListener('click', (e) => {
            if (!routeEndInput.contains(e.target) && !endSuggestions.contains(e.target)) {
                endSuggestions.classList.remove('active');
            }
        });
    }

    calculateButton.addEventListener('click', () => {
        const startPlaceName = routeStartInput.value.trim();
        const endPlaceName = routeEndInput.value.trim();

        if (!startPlaceName || !endPlaceName) {
            alert('Veuillez sélectionner un lieu de départ et un lieu d\'arrivée');
            return;
        }

        const startPlaceId = getPlaceIdByName(startPlaceName);
        const endPlaceId = getPlaceIdByName(endPlaceName);
        const startPlace = startPlaceId ? places[startPlaceId] : null;
        const endPlace = endPlaceId ? places[endPlaceId] : null;

        if (!startPlace || !endPlace) {
            alert('Lieux non trouvés. Veuillez utiliser l\'autocomplétion.');
            return;
        }

        const distance = calculateDistance(startPlace.lat, startPlace.lng, endPlace.lat, endPlace.lng);
        const distanceMeters = Math.round(distance);
        const walkingMinutes = calculateWalkingTime(distanceMeters);

        if (routeResult) {
            routeResult.innerHTML = `
                <div class="route-result-content">
                    <div class="route-result-item">
                        <span class="route-result-label">Distance</span>
                        <span class="route-result-value">${distanceMeters} m</span>
                    </div>
                    <div class="route-result-item">
                        <span class="route-result-label">Temps de marche</span>
                        <span class="route-result-value">${walkingMinutes} min</span>
                    </div>
                    <button class="route-cancel-btn">Annuler</button>
                </div>
            `;
            routeResult.classList.add('active');
            
            const cancelBtn = routeResult.querySelector('.route-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    routeStartInput.value = '';
                    routeEndInput.value = '';
                    if (routeCalculatorLayer && maps['all']) {
                        maps['all'].removeLayer(routeCalculatorLayer);
                        routeCalculatorLayer = null;
                    }
                    routeResult.innerHTML = '';
                    routeResult.classList.remove('active');
                });
            }
        }

        drawRouteBetweenPlaces(startPlace, endPlace);
    });
}

function drawRouteBetweenPlaces(startPlace, endPlace) {
    const map = maps['all'];
    if (!map) {
        showDay('all');
        setTimeout(() => {
            drawRouteBetweenPlaces(startPlace, endPlace);
        }, 300);
        return;
    }

    if (routeCalculatorLayer) {
        map.removeLayer(routeCalculatorLayer);
        routeCalculatorLayer = null;
    }

    const url = `https://router.project-osrm.org/route/v1/foot/${startPlace.lng},${startPlace.lat};${endPlace.lng},${endPlace.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                routeCalculatorLayer = L.polyline(coordinates, {
                    color: '#0066FF',
                    weight: 4,
                    opacity: 0.7
                }).addTo(map);

                const bounds = routeCalculatorLayer.getBounds();
                map.fitBounds(bounds, { padding: [50, 50] });
            } else {
                alert('Impossible de calculer l\'itinéraire');
            }
        })
        .catch(error => {
            console.error('Erreur lors du calcul de l\'itinéraire:', error);
            alert('Erreur lors du calcul de l\'itinéraire');
        });
}

function updateToggleAllState() {
    const legendItems = document.querySelectorAll('.legend-item');
    const visibleItems = Array.from(legendItems).filter(item => item.style.display !== 'none');
    const visibleCheckboxes = visibleItems.map(item => item.querySelector('input[type="checkbox"]')).filter(cb => cb);
    const allChecked = visibleCheckboxes.length > 0 && visibleCheckboxes.every(cb => cb.checked);
    const toggleAll = document.getElementById('toggle-all-checkbox');
    const toggleAllText = document.getElementById('toggle-all-text');
    
    if (toggleAll && visibleCheckboxes.length > 0) {
        toggleAll.checked = allChecked;
    }
    if (toggleAllText) {
        toggleAllText.textContent = allChecked ? 'Tout décocher' : 'Tout cocher';
    }
}

function showDay(day) {
    document.querySelectorAll('.day-section').forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.getElementById(`day-${day}`);
    if (targetSection) {
        targetSection.style.display = 'block';
        if (day !== 'all') {
            updateDayPlacesLists();
        }
        setTimeout(() => {
            initMap(day);
        }, 100);
    }

    document.querySelectorAll('.menu-list a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-day="${day}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function createGPSIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <circle fill="#0066FF" cx="10" cy="10" r="6"/>
        <circle fill="#FFFFFF" cx="10" cy="10" r="3"/>
        <circle fill="#0066FF" cx="10" cy="10" r="1.5"/>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return L.icon({
        iconUrl: url,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateWalkingTime(distanceMeters) {
    const walkingSpeedKmh = 4;
    const walkingSpeedMs = walkingSpeedKmh * 1000 / 3600;
    const timeSeconds = distanceMeters / walkingSpeedMs;
    return Math.ceil(timeSeconds / 60);
}

function createPopupContent(placeName, placeLat, placeLng) {
    let content = `<div style="text-align: center;"><strong>${placeName}</strong></div>`;
    
    if (currentUserPosition) {
        const distance = calculateDistance(
            currentUserPosition.lat,
            currentUserPosition.lng,
            placeLat,
            placeLng
        );
        const distanceMeters = Math.round(distance);
        const walkingMinutes = calculateWalkingTime(distanceMeters);
        
        content += `<div style="text-align: center; font-size: 0.9em; margin-top: 5px;">${distanceMeters} m</div>`;
        content += `<div style="text-align: center; font-size: 0.9em; margin-top: 3px;">${walkingMinutes} min</div>`;
        
        content += `<div style="text-align: center; margin-top: 8px;">
            <button onclick="showRoute(${placeLat}, ${placeLng}, '${placeName.replace(/'/g, "\\'")}')" 
                    style="background: #1a1a2e; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85em; display: inline-flex; align-items: center; gap: 5px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Itinéraire
            </button>
        </div>`;
    }
    
    return content;
}

window.showRoute = function(destLat, destLng, placeName) {
    if (!currentUserPosition || !currentMap) {
        alert('Position GPS non disponible');
        return;
    }

    if (currentRouteLayer) {
        currentMap.removeLayer(currentRouteLayer);
        currentRouteLayer = null;
    }

    const startLat = currentUserPosition.lat;
    const startLng = currentUserPosition.lng;

    const url = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                currentRouteLayer = L.polyline(coordinates, {
                    color: '#0066FF',
                    weight: 4,
                    opacity: 0.7
                }).addTo(currentMap);

                const bounds = currentRouteLayer.getBounds();
                currentMap.fitBounds(bounds, { padding: [50, 50] });
                
                if (currentMap.getZoom() > 16) {
                    currentMap.setZoom(16);
                }
            } else {
                alert('Impossible de calculer l\'itinéraire');
            }
        })
        .catch(error => {
            console.error('Erreur lors du calcul de l\'itinéraire:', error);
            alert('Erreur lors du calcul de l\'itinéraire');
        });
};

const gpsIcon = createGPSIcon();

function updateAllPopups() {
    if (!currentUserPosition) return;

    Object.keys(places).forEach(id => {
        const place = places[id];
        if (place) {
            const marker = allMarkers[id];
            if (marker) {
                marker.setPopupContent(createPopupContent(place.name, place.lat, place.lng));
            }
        }
    });

    const hotelMarker = allMarkers[hotel.name];
    if (hotelMarker) {
        hotelMarker.setPopupContent(createPopupContent(hotel.name, hotel.lat, hotel.lng));
    }

    Object.keys(maps).forEach(day => {
        if (day === 'all') return;
        const dayPlacesList = getPlacesByDay(day);
        dayPlacesList.forEach(id => {
            const place = places[id];
            if (place && dayMarkers[day] && dayMarkers[day][id]) {
                dayMarkers[day][id].setPopupContent(createPopupContent(place.name, place.lat, place.lng));
            }
        });
        
        if (dayMarkers[day] && dayMarkers[day][hotel.name]) {
            dayMarkers[day][hotel.name].setPopupContent(createPopupContent(hotel.name, hotel.lat, hotel.lng));
        }
    });
}

function startGPSLocation() {
    if (!navigator.geolocation) {
        console.warn('La géolocalisation n\'est pas supportée par ce navigateur');
        return;
    }

    if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
        userLocationWatchId = null;
    }

    if (userLocationMarker && currentMap) {
        currentMap.removeLayer(userLocationMarker);
        userLocationMarker = null;
    }

    const options = {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
    };
    
    userLocationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentUserPosition = { lat, lng };

            if (currentMap) {
                if (userLocationMarker) {
                    userLocationMarker.setLatLng([lat, lng]);
                } else {
                    userLocationMarker = L.marker([lat, lng], { 
                        icon: gpsIcon,
                        zIndexOffset: 1000
                    })
                    .addTo(currentMap)
                    .bindPopup('Ma position');
                }
            } else {
                console.warn('Aucune carte active pour afficher la position');
            }
            
            updateAllPopups();
        },
        (error) => {
            let errorMessage = 'Erreur de géolocalisation: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permission refusée par l\'utilisateur';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Position indisponible';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Timeout - La requête a pris trop de temps';
                    break;
                default:
                    errorMessage += error.message;
                    break;
            }
            console.error(errorMessage, error);
        },
        options
    );
}

    const centerLocationBtn = document.getElementById('center-user-location');
    if (centerLocationBtn) {
        centerLocationBtn.addEventListener('click', () => {
            const map = maps['all'];
            if (!map) return;
            
            if (!currentUserPosition) {
                alert('Position GPS non disponible');
                return;
            }
            
            map.setView([currentUserPosition.lat, currentUserPosition.lng], 16);
        });
    }

    const showRouteCalculatorBtn = document.getElementById('show-route-calculator');
    if (showRouteCalculatorBtn) {
        showRouteCalculatorBtn.addEventListener('click', () => {
            const routeCalculator = document.querySelector('.route-calculator');
            const routeOverlay = document.querySelector('.route-overlay');
            const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
            if (routeCalculator) {
                routeCalculator.style.display = 'block';
                routeCalculatorActive = true;
                if (routeOverlay) {
                    routeOverlay.classList.add('active');
                }
                if (toggleLegendMobileBtn) {
                    toggleLegendMobileBtn.style.display = 'none';
                }
                document.body.style.overflow = 'hidden';
            }
        });
    }

    const routeOverlay = document.querySelector('.route-overlay');
    if (routeOverlay) {
        routeOverlay.addEventListener('click', () => {
            const routeCalculator = document.querySelector('.route-calculator');
            const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
            if (routeCalculator) {
                routeCalculator.style.display = 'none';
                routeCalculatorActive = false;
                routeOverlay.classList.remove('active');
                if (toggleLegendMobileBtn) {
                    toggleLegendMobileBtn.style.display = 'block';
                }
                document.body.style.overflow = '';
            }
        });
    }

let editPlaceMap = null;
let editPlaceMarker = null;
let currentEditPlaceId = null;
let editPlaceInputHandlers = [];

function showPage(pageId) {
    document.querySelectorAll('.day-section').forEach(section => {
        section.style.display = 'none';
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        if (pageId === 'page-edit-place' && editPlaceMap) {
            setTimeout(() => {
                editPlaceMap.invalidateSize();
            }, 100);
        }
    }
    document.querySelectorAll('.menu-list a').forEach(link => {
        link.classList.remove('active');
    });
}

function showSettingsPage() {
    showPage('page-settings');
    renderPlacesList();
}

function renderPlacesList() {
    const placesList = document.getElementById('places-list');
    if (!placesList) return;
    
    placesList.innerHTML = '';
    const sortedPlaces = Object.keys(places).map(id => parseInt(id)).sort((a, b) => a - b);
    
    sortedPlaces.forEach(id => {
        const place = places[id];
        const item = document.createElement('div');
        item.className = 'place-item';
        item.innerHTML = `
            <span class="place-name">${place.name}</span>
            <button class="delete-btn" data-place-id="${id}">X</button>
        `;
        
        const nameSpan = item.querySelector('.place-name');
        nameSpan.addEventListener('click', () => {
            showEditPlacePage(id);
        });
        
        const deleteBtn = item.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer "${place.name}" ?`)) {
                deletePlace(id);
            }
        });
        
        placesList.appendChild(item);
    });
}

function deletePlace(id) {
    const deletedId = parseInt(id);
    
    if (maps['all']) {
        if (allMarkers[deletedId]) {
            maps['all'].removeLayer(allMarkers[deletedId]);
            delete allMarkers[deletedId];
        }
    }
    
    Object.keys(dayMarkers).forEach(day => {
        if (dayMarkers[day][deletedId]) {
            if (maps[day]) {
                maps[day].removeLayer(dayMarkers[day][deletedId]);
            }
            delete dayMarkers[day][deletedId];
        }
    });
    
    delete places[deletedId];
    
    const idsToReindex = Object.keys(places).map(pid => parseInt(pid)).filter(pid => pid > deletedId).sort((a, b) => b - a);
    
    idsToReindex.forEach(pid => {
        const newId = pid - 1;
        places[newId] = places[pid];
        places[newId].id = newId;
        delete places[pid];
        
        if (allMarkers[pid]) {
            allMarkers[newId] = allMarkers[pid];
            delete allMarkers[pid];
        }
        
        Object.keys(dayMarkers).forEach(day => {
            if (dayMarkers[day][pid]) {
                dayMarkers[day][newId] = dayMarkers[day][pid];
                delete dayMarkers[day][pid];
            }
        });
    });
    
    if (maps['all']) {
        createLegend();
    }
    
    savePlaces(places);
    renderPlacesList();
    updateDayPlacesLists();
}

function showEditPlacePage(id) {
    currentEditPlaceId = id;
    showPage('page-edit-place');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const title = document.getElementById('edit-place-title');
    const nameInput = document.getElementById('edit-place-name');
    const latInput = document.getElementById('edit-place-lat');
    const lngInput = document.getElementById('edit-place-lng');
    const daySelect = document.getElementById('edit-place-day');
    const saveBtn = document.getElementById('edit-place-save');
    
    if (id !== null && id !== undefined) {
        const place = places[id];
        if (place) {
            if (title) title.textContent = place.name;
            if (nameInput) nameInput.value = place.name;
            if (latInput) latInput.value = place.lat;
            if (lngInput) lngInput.value = place.lng;
            if (daySelect) daySelect.value = place.day || '';
            if (saveBtn) saveBtn.textContent = 'Sauvegarder';
            setTimeout(() => {
                initEditPlaceMap(place.lat, place.lng);
            }, 100);
        }
    } else {
        if (title) title.textContent = 'Ajouter un lieu';
        if (nameInput) nameInput.value = '';
        if (latInput) latInput.value = '';
        if (lngInput) lngInput.value = '';
        if (daySelect) daySelect.value = '';
        if (saveBtn) saveBtn.textContent = 'Ajouter';
        setTimeout(() => {
            initEditPlaceMap(40.7128, -74.0060);
        }, 100);
    }
}

function showAddPlacePage() {
    showEditPlacePage(null);
}

function attachPlaceListListeners() {
    document.querySelectorAll('.places-list li[data-place-id]').forEach(item => {
        item.addEventListener('click', (e) => {
            const placeId = parseInt(item.getAttribute('data-place-id'));
            const daySection = item.closest('.day-section');
            if (daySection) {
                const day = daySection.getAttribute('data-day');
                if (day && day !== 'all') {
                    const mapContainer = document.getElementById(`map-${day}`);
                    if (mapContainer) {
                        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        setTimeout(() => {
                            const map = maps[day];
                            const marker = dayMarkers[day] && dayMarkers[day][placeId];
                            const place = places[placeId];
                            if (map && marker && place) {
                                map.setView([place.lat, place.lng], 16, {
                                    animate: true,
                                    duration: 0.5
                                });
                                setTimeout(() => {
                                    marker.openPopup();
                                }, 600);
                            }
                        }, 300);
                    }
                }
            }
        });
    });
}

function updateDayPlacesLists() {
    [12, 13, 14, 15, 16, 17].forEach(day => {
        const daySection = document.getElementById(`day-${day}`);
        if (!daySection) return;
        
        const placesList = daySection.querySelector('.places-list');
        if (!placesList) return;
        
        placesList.innerHTML = '';
        const dayPlacesList = getPlacesByDay(day);
        
        dayPlacesList.forEach(id => {
            const place = places[id];
            if (place) {
                const li = document.createElement('li');
                li.setAttribute('data-place-id', id);
                li.textContent = place.name;
                placesList.appendChild(li);
            }
        });
    });
    
    attachPlaceListListeners();
}

function initEditPlaceMap(lat, lng) {
    const mapContainer = document.getElementById('edit-place-map');
    if (!mapContainer) return;
    
    editPlaceInputHandlers.forEach(handler => {
        handler.element.removeEventListener('input', handler.fn);
    });
    editPlaceInputHandlers = [];
    
    if (editPlaceMap) {
        editPlaceMap.remove();
        editPlaceMap = null;
        editPlaceMarker = null;
    }
    
    editPlaceMap = L.map('edit-place-map').setView([lat, lng], 13);
    
    const style = mapStyles[currentMapStyle];
    L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: style.maxZoom
    }).addTo(editPlaceMap);
    
    editPlaceMarker = L.marker([lat, lng], { draggable: true })
        .addTo(editPlaceMap);
    
    editPlaceMarker.on('dragend', () => {
        const position = editPlaceMarker.getLatLng();
        const latInput = document.getElementById('edit-place-lat');
        const lngInput = document.getElementById('edit-place-lng');
        if (latInput) latInput.value = position.lat.toFixed(7);
        if (lngInput) lngInput.value = position.lng.toFixed(7);
    });
    
    editPlaceMap.on('click', (e) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        editPlaceMarker.setLatLng([newLat, newLng]);
        const latInput = document.getElementById('edit-place-lat');
        const lngInput = document.getElementById('edit-place-lng');
        if (latInput) latInput.value = newLat.toFixed(7);
        if (lngInput) lngInput.value = newLng.toFixed(7);
    });
    
    const latInput = document.getElementById('edit-place-lat');
    const lngInput = document.getElementById('edit-place-lng');
    
    if (latInput) {
        latInput.addEventListener('input', updateMapFromInputs);
        editPlaceInputHandlers.push({ element: latInput, fn: updateMapFromInputs });
    }
    if (lngInput) {
        lngInput.addEventListener('input', updateMapFromInputs);
        editPlaceInputHandlers.push({ element: lngInput, fn: updateMapFromInputs });
    }
}

function updateMapFromInputs() {
    if (!editPlaceMap || !editPlaceMarker) return;
    
    const latInput = document.getElementById('edit-place-lat');
    const lngInput = document.getElementById('edit-place-lng');
    
    if (!latInput || !lngInput) return;
    
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        editPlaceMarker.setLatLng([lat, lng]);
        editPlaceMap.setView([lat, lng], editPlaceMap.getZoom());
    }
}

function savePlace() {
    const nameInput = document.getElementById('edit-place-name');
    const latInput = document.getElementById('edit-place-lat');
    const lngInput = document.getElementById('edit-place-lng');
    
    if (!nameInput || !latInput || !lngInput) return;
    
    const name = nameInput.value.trim();
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    
    if (!name) {
        alert('Le nom du lieu est requis');
        return;
    }
    
    if (isNaN(lat) || isNaN(lng)) {
        alert('Les coordonnées doivent être des nombres valides');
        return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('Les coordonnées sont invalides');
        return;
    }
    
    const daySelect = document.getElementById('edit-place-day');
    const selectedDay = daySelect ? daySelect.value : null;
    
    let placeId;
    if (currentEditPlaceId !== null && currentEditPlaceId !== undefined) {
        placeId = currentEditPlaceId;
        places[placeId].name = name;
        places[placeId].lat = lat;
        places[placeId].lng = lng;
        places[placeId].day = selectedDay || null;
    } else {
        placeId = getMaxId() + 1;
        places[placeId] = { id: placeId, name, lat, lng, day: selectedDay || null };
    }
    
    savePlaces(places);
    
    if (maps['all']) {
        if (allMarkers[placeId]) {
            allMarkers[placeId].setLatLng([lat, lng]);
            allMarkers[placeId].setPopupContent(createPopupContent(name, lat, lng));
        } else {
            const marker = L.marker([lat, lng])
                .addTo(maps['all'])
                .bindPopup(createPopupContent(name, lat, lng));
            allMarkers[placeId] = marker;
        }
        
        createLegend();
    }
    
    Object.keys(dayMarkers).forEach(day => {
        const dayPlacesList = getPlacesByDay(day);
        if (dayPlacesList.includes(placeId)) {
            if (maps[day]) {
                if (dayMarkers[day][placeId]) {
                    dayMarkers[day][placeId].setLatLng([lat, lng]);
                    dayMarkers[day][placeId].setPopupContent(createPopupContent(name, lat, lng));
                } else {
                    const marker = L.marker([lat, lng])
                        .addTo(maps[day])
                        .bindPopup(createPopupContent(name, lat, lng));
                    dayMarkers[day][placeId] = marker;
                }
            }
        } else {
            if (dayMarkers[day] && dayMarkers[day][placeId] && maps[day]) {
                maps[day].removeLayer(dayMarkers[day][placeId]);
                delete dayMarkers[day][placeId];
            }
        }
    });
    
    updateDayPlacesLists();
    showSettingsPage();
}

document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu-list a');
    const menuList = document.querySelector('.menu-list');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    function toggleMenu() {
        if (menuList && menuOverlay) {
            menuList.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        }
    }

    function closeMenu() {
        if (menuList && menuOverlay) {
            menuList.classList.remove('active');
            menuOverlay.classList.remove('active');
        }
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const day = link.getAttribute('data-day');
            if (day) {
                showDay(day);
            }
            closeMenu();
        });
    });

    const addPlaceBtn = document.getElementById('add-place-btn');
    if (addPlaceBtn) {
        addPlaceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAddPlacePage();
            closeMenu();
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSettingsPage();
            closeMenu();
        });
    }

    const backToSettingsBtn = document.getElementById('back-to-settings');
    if (backToSettingsBtn) {
        backToSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSettingsPage();
        });
    }

    const editPlaceSaveBtn = document.getElementById('edit-place-save');
    if (editPlaceSaveBtn) {
        editPlaceSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            savePlace();
        });
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }

    if (menuList) {
        menuList.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                closeMenu();
            }
        });
    }

    function toggleLegend() {
        const legend = document.getElementById('legend');
        const overlay = document.querySelector('.legend-overlay');
        if (legend) {
            const isOpening = !legend.classList.contains('active');
            legend.classList.toggle('active');
            legendActive = legend.classList.contains('active');
            if (isOpening) {
                createLegend();
            }
        }
        if (overlay) {
            overlay.classList.toggle('active');
        }
        if (legend && legend.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            if (window.innerWidth <= 968) {
                const routeCalculator = document.querySelector('.route-calculator');
                if (routeCalculator) {
                    routeCalculator.style.display = 'none';
                    routeCalculatorActive = false;
                }
                const toggleRouteMobileBtn = document.getElementById('toggle-route-mobile');
                if (toggleRouteMobileBtn) {
                    toggleRouteMobileBtn.style.display = 'none';
                }
                const showRouteCalculatorBtn = document.getElementById('show-route-calculator');
                if (showRouteCalculatorBtn) {
                    showRouteCalculatorBtn.style.display = 'none';
                }
            }
        } else {
            document.body.style.overflow = '';
            const toggleRouteMobileBtn = document.getElementById('toggle-route-mobile');
            if (toggleRouteMobileBtn) {
                toggleRouteMobileBtn.style.display = 'block';
            }
            const showRouteCalculatorBtn = document.getElementById('show-route-calculator');
            if (showRouteCalculatorBtn) {
                showRouteCalculatorBtn.style.display = 'block';
            }
        }
        const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
        if (toggleLegendMobileBtn) {
            toggleLegendMobileBtn.textContent = legend && legend.classList.contains('active') 
                ? 'Masquer légende' 
                : 'Afficher légende';
        }
    }

    const toggleLegendBtn = document.getElementById('toggle-legend');
    if (toggleLegendBtn) {
        toggleLegendBtn.addEventListener('click', () => {
            toggleLegend();
            toggleLegendBtn.textContent = document.getElementById('legend').classList.contains('active') 
                ? 'Masquer légende' 
                : 'Afficher légende';
        });
    }

    const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
    if (toggleLegendMobileBtn) {
        toggleLegendMobileBtn.addEventListener('click', () => {
            toggleLegend();
            const legend = document.getElementById('legend');
            toggleLegendMobileBtn.textContent = legend && legend.classList.contains('active') 
                ? 'Masquer légende' 
                : 'Afficher légende';
        });
    }

    const legendOverlay = document.querySelector('.legend-overlay');
    if (legendOverlay) {
        legendOverlay.addEventListener('click', () => {
            toggleLegend();
        });
    }

    function toggleRouteCalculator() {
        const routeCalculator = document.querySelector('.route-calculator');
        if (routeCalculator) {
            const isHidden = routeCalculator.style.display === 'none' || !routeCalculator.style.display;
            routeCalculator.style.display = isHidden ? 'block' : 'none';
            routeCalculatorActive = routeCalculator.style.display === 'block';
            const isVisible = routeCalculator.style.display === 'block';
            const toggleRouteMobileBtn = document.getElementById('toggle-route-mobile');
            if (toggleRouteMobileBtn) {
                toggleRouteMobileBtn.textContent = isVisible 
                    ? 'Masquer itinéraire' 
                    : 'Afficher itinéraire';
            }
            if (isVisible) {
                const legend = document.getElementById('legend');
                const overlay = document.querySelector('.legend-overlay');
                if (legend) {
                    legend.classList.remove('active');
                    legendActive = false;
                }
                if (overlay) {
                    overlay.classList.remove('active');
                }
                const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
                if (toggleLegendMobileBtn) {
                    toggleLegendMobileBtn.style.display = 'none';
                    toggleLegendMobileBtn.textContent = 'Afficher légende';
                }
                document.body.style.overflow = '';
            } else {
                const toggleLegendMobileBtn = document.getElementById('toggle-legend-mobile');
                if (toggleLegendMobileBtn) {
                    toggleLegendMobileBtn.style.display = 'block';
                }
            }
        }
    }

    const toggleRouteMobileBtn = document.getElementById('toggle-route-mobile');
    if (toggleRouteMobileBtn) {
        toggleRouteMobileBtn.addEventListener('click', () => {
            toggleRouteCalculator();
        });
    }



    const toggleAllCheckbox = document.getElementById('toggle-all-checkbox');
    if (toggleAllCheckbox) {
        toggleAllCheckbox.addEventListener('change', (e) => {
            const states = JSON.parse(localStorage.getItem('legendCheckboxStates') || '{}');
            const legendItems = document.querySelectorAll('.legend-item');
            legendItems.forEach(item => {
                if (item.style.display !== 'none') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = e.target.checked;
                        const placeId = parseInt(checkbox.dataset.placeId);
                        if (!isNaN(placeId)) {
                            togglePlace(placeId, e.target.checked);
                            states[placeId] = e.target.checked;
                        }
                    }
                }
            });
            localStorage.setItem('legendCheckboxStates', JSON.stringify(states));
            const toggleAllText = document.getElementById('toggle-all-text');
            if (toggleAllText) {
                toggleAllText.textContent = e.target.checked ? 'Tout décocher' : 'Tout cocher';
            }
        });
    }

    const legendSearchInput = document.getElementById('legend-search-input');
    if (legendSearchInput) {
        legendSearchInput.addEventListener('input', (e) => {
            filterLegend(e.target.value);
        });
    }

    initRouteCalculator();
    
    updateDayPlacesLists();

    showDay('all');

    attachPlaceListListeners();
});