const API_URL = 'https://nycapi.vercel.app/api/lieux';

function convertApiToApp(apiPlace) {
    return {
        id: apiPlace.id,
        name: apiPlace.nom,
        lat: parseFloat(apiPlace.latitude),
        lng: parseFloat(apiPlace.longitude),
        day: apiPlace.jour || null
    };
}

function convertAppToApi(appPlace) {
    return {
        nom: appPlace.name,
        latitude: appPlace.lat.toString(),
        longitude: appPlace.lng.toString(),
        adresse: null,
        jour: appPlace.day || null
    };
}

async function getPlaces() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        const apiPlaces = await response.json();
        const placesObj = {};
        apiPlaces.forEach(apiPlace => {
            const appPlace = convertApiToApp(apiPlace);
            placesObj[appPlace.id] = appPlace;
        });
        return placesObj;
    } catch (error) {
        console.error('Erreur API getPlaces:', error);
        return {};
    }
}

async function createPlace(placeData) {
    try {
        const apiData = convertAppToApi(placeData);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
        });
        if (!response.ok) throw new Error('Erreur lors de la création');
        const apiPlace = await response.json();
        return convertApiToApp(apiPlace);
    } catch (error) {
        console.error('Erreur API createPlace:', error);
        throw error;
    }
}

async function updatePlace(id, placeData) {
    try {
        const apiData = convertAppToApi(placeData);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
        });
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        const apiPlace = await response.json();
        return convertApiToApp(apiPlace);
    } catch (error) {
        console.error('Erreur API updatePlace:', error);
        throw error;
    }
}

async function deletePlaceApi(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        return true;
    } catch (error) {
        console.error('Erreur API deletePlace:', error);
        throw error;
    }
}

async function loadPlaces() {
    return await getPlaces();
}

let places = {};

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
                .bindPopup(createPopupContent(place.name, place.lat, place.lng, id));
            dayMarkers[day][id] = marker;
        }
    });

    const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(createPopupContent(hotel.name, hotel.lat, hotel.lng, null));

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
                .bindPopup(createPopupContent(place.name, place.lat, place.lng, parseInt(id)));
            allMarkers[id] = marker;
        }
    });

    const hotelMarker = L.marker([hotel.lat, hotel.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(createPopupContent(hotel.name, hotel.lat, hotel.lng, null));
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

function navigateToDay(day) {
    navigateTo({ type: 'day', id: day });
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

function createPopupContent(placeName, placeLat, placeLng, placeId = null) {
    const escapedName = placeName.replace(/'/g, "\\'");
    let content = `<div style="text-align: center; padding: 8px 0;"><strong style="font-size: 1.1em;">${placeName}</strong></div>`;
    
    if (currentUserPosition) {
        const distance = calculateDistance(
            currentUserPosition.lat,
            currentUserPosition.lng,
            placeLat,
            placeLng
        );
        const distanceMeters = Math.round(distance);
        const walkingMinutes = calculateWalkingTime(distanceMeters);
        
        content += `<div style="text-align: center; font-size: 0.95em; margin-top: 5px; color: #666;">Distance: ${distanceMeters} m</div>`;
        content += `<div style="text-align: center; font-size: 0.95em; margin-top: 3px; color: #666;">Temps de marche: ${walkingMinutes} min</div>`;
    }
    
    content += `<div style="display: flex; gap: 8px; margin-top: 12px; width: 100%;">
        <button onclick="showPlaceInfo(${placeId !== null ? placeId : 'null'}, '${escapedName}', ${placeLat}, ${placeLng})" 
                class="popup-btn popup-btn-info"
                style="flex: 1; background: #007AFF; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9em; font-weight: 500;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        </button>
        <button onclick="showRoute(${placeLat}, ${placeLng}, '${escapedName}')" 
                class="popup-btn popup-btn-route"
                style="flex: 1; background: #25D366; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9em; font-weight: 500;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </button>
    </div>`;
    
    return content;
}

window.showPlaceInfo = function(placeId, placeName, placeLat, placeLng) {
    if (placeId !== null && places[placeId]) {
        navigateToEditPlace(placeId);
    } else {
        alert(`Informations du lieu:\nNom: ${placeName}\nLatitude: ${placeLat}\nLongitude: ${placeLng}\n\nCe lieu n'est pas dans votre liste.`);
    }
};

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
                marker.setPopupContent(createPopupContent(place.name, place.lat, place.lng, parseInt(id)));
            }
        }
    });

    const hotelMarker = allMarkers[hotel.name];
    if (hotelMarker) {
        hotelMarker.setPopupContent(createPopupContent(hotel.name, hotel.lat, hotel.lng, null));
    }

    Object.keys(maps).forEach(day => {
        if (day === 'all') return;
        const dayPlacesList = getPlacesByDay(day);
        dayPlacesList.forEach(id => {
            const place = places[id];
            if (place && dayMarkers[day] && dayMarkers[day][id]) {
                dayMarkers[day][id].setPopupContent(createPopupContent(place.name, place.lat, place.lng, id));
            }
        });
        
        if (dayMarkers[day] && dayMarkers[day][hotel.name]) {
            dayMarkers[day][hotel.name].setPopupContent(createPopupContent(hotel.name, hotel.lat, hotel.lng, null));
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
let navigationHistory = [];
let isNavigatingBack = false;
let lastGeocodeTime = 0;
let geocodeTimeout = null;
const GEOCODE_MIN_INTERVAL = 1000;

function navigateTo(state) {
    if (!isNavigatingBack) {
        history.pushState(state, '', `#${state.type}-${state.id || ''}`);
        navigationHistory.push(state);
    }
    applyState(state);
}

function applyState(state) {
    if (state.type === 'day') {
        showDay(state.id);
    } else if (state.type === 'page') {
        if (state.id === 'settings') {
            showSettingsPage();
        } else if (state.id === 'edit-place') {
            showEditPlacePage(state.placeId || null);
        }
    }
}

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

function navigateToSettings() {
    navigateTo({ type: 'page', id: 'settings' });
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
            <button class="delete-btn" data-place-id="${id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        
        const nameSpan = item.querySelector('.place-name');
        nameSpan.addEventListener('click', () => {
            navigateToEditPlace(id);
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

async function deletePlace(id) {
    const deletedId = parseInt(id);
    
    try {
        await deletePlaceApi(deletedId);
        
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
        
        if (maps['all']) {
            createLegend();
        }
        
        renderPlacesList();
        updateDayPlacesLists();
    } catch (error) {
        alert('Erreur lors de la suppression: ' + error.message);
    }
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
            setTimeout(async () => {
                initEditPlaceMap(place.lat, place.lng);
                await updateAddressFromCoords();
            }, 100);
        }
    } else {
        if (title) title.textContent = 'Ajouter un lieu';
        if (nameInput) nameInput.value = '';
        if (latInput) latInput.value = '';
        if (lngInput) lngInput.value = '';
        if (daySelect) daySelect.value = '';
        if (saveBtn) saveBtn.textContent = 'Ajouter';
        const addressInput = document.getElementById('edit-place-address');
        if (addressInput) addressInput.value = '';
        setTimeout(async () => {
            initEditPlaceMap(40.7128, -74.0060);
            await updateAddressFromCoords();
        }, 100);
    }
}

function navigateToEditPlace(id) {
    navigateTo({ type: 'page', id: 'edit-place', placeId: id });
}

function showAddPlacePage() {
    showEditPlacePage(null);
}

function navigateToAddPlace() {
    navigateToEditPlace(null);
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
    
    editPlaceMarker.on('dragend', async () => {
        const position = editPlaceMarker.getLatLng();
        const latInput = document.getElementById('edit-place-lat');
        const lngInput = document.getElementById('edit-place-lng');
        if (latInput) latInput.value = position.lat.toFixed(7);
        if (lngInput) lngInput.value = position.lng.toFixed(7);
        await updateAddressFromCoords();
    });
    
    editPlaceMap.on('click', async (e) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        editPlaceMarker.setLatLng([newLat, newLng]);
        const latInput = document.getElementById('edit-place-lat');
        const lngInput = document.getElementById('edit-place-lng');
        if (latInput) latInput.value = newLat.toFixed(7);
        if (lngInput) lngInput.value = newLng.toFixed(7);
        await updateAddressFromCoords();
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

async function reverseGeocode(lat, lng) {
    const now = Date.now();
    const timeSinceLastCall = now - lastGeocodeTime;
    
    if (timeSinceLastCall < GEOCODE_MIN_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, GEOCODE_MIN_INTERVAL - timeSinceLastCall));
    }
    
    lastGeocodeTime = Date.now();
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: {
                'User-Agent': 'NYCApp/1.0',
                'Referer': window.location.origin
            }
        });
        
        if (!response.ok) {
            if (response.status === 429 || response.status === 403) {
                throw new Error('Trop de requêtes. Veuillez patienter quelques instants.');
            }
            throw new Error('Erreur de réponse');
        }
        
        const data = await response.json();
        if (data && data.display_name) {
            return data.display_name;
        }
        return '';
    } catch (error) {
        console.error('Erreur reverse geocoding:', error);
        return '';
    }
}

async function updateAddressFromCoords() {
    if (geocodeTimeout) {
        clearTimeout(geocodeTimeout);
    }
    
    geocodeTimeout = setTimeout(async () => {
        const latInput = document.getElementById('edit-place-lat');
        const lngInput = document.getElementById('edit-place-lng');
        const addressInput = document.getElementById('edit-place-address');
        
        if (!latInput || !lngInput || !addressInput) return;
        
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            addressInput.value = 'Chargement...';
            const address = await reverseGeocode(lat, lng);
            addressInput.value = address || '';
        } else {
            addressInput.value = '';
        }
    }, 500);
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
        updateAddressFromCoords();
    }
}

async function savePlace() {
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
    
    const placeData = { name, lat, lng, day: selectedDay || null };
    
    try {
        let placeId;
        let updatedPlace;
        
        if (currentEditPlaceId !== null && currentEditPlaceId !== undefined) {
            placeId = currentEditPlaceId;
            updatedPlace = await updatePlace(placeId, placeData);
        } else {
            updatedPlace = await createPlace(placeData);
            placeId = updatedPlace.id;
        }
        
        places[placeId] = updatedPlace;
        
        if (maps['all']) {
            if (allMarkers[placeId]) {
                allMarkers[placeId].setLatLng([lat, lng]);
                allMarkers[placeId].setPopupContent(createPopupContent(name, lat, lng, placeId));
            } else {
                const marker = L.marker([lat, lng])
                    .addTo(maps['all'])
                    .bindPopup(createPopupContent(name, lat, lng, placeId));
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
                        dayMarkers[day][placeId].setPopupContent(createPopupContent(name, lat, lng, placeId));
                    } else {
                        const marker = L.marker([lat, lng])
                            .addTo(maps[day])
                            .bindPopup(createPopupContent(name, lat, lng, placeId));
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
    } catch (error) {
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        places = await loadPlaces();
    } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        places = {};
    }
    
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
                navigateToDay(day);
            }
            closeMenu();
        });
    });

    const addPlaceBtn = document.getElementById('add-place-btn');
    if (addPlaceBtn) {
        addPlaceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToAddPlace();
            closeMenu();
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSettings();
            closeMenu();
        });
    }

    const backToSettingsBtn = document.getElementById('back-to-settings');
    if (backToSettingsBtn) {
        backToSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isNavigatingBack = true;
            history.back();
            isNavigatingBack = false;
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

    const initialState = { type: 'day', id: 'all' };
    history.replaceState(initialState, '', '#day-all');
    navigationHistory.push(initialState);
    showDay('all');

    attachPlaceListListeners();

    window.addEventListener('popstate', (e) => {
        isNavigatingBack = true;
        if (e.state) {
            applyState(e.state);
            if (navigationHistory.length > 0) {
                navigationHistory.pop();
            }
        } else if (navigationHistory.length > 0) {
            navigationHistory.pop();
            const prevState = navigationHistory[navigationHistory.length - 1] || initialState;
            applyState(prevState);
        } else {
            applyState(initialState);
        }
        isNavigatingBack = false;
    });
});