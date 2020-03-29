import { setMovieIdsShowing } from './movie-info-actions.js';

/*
 * ACTION TYPES
 */

export const SET_MAP_VIEWPORT = 'SET_MAP_VIEWPORT';
export const SET_MAP_BOUNDS = 'SET_MAP_BOUNDS';
export const REQUEST_LOCATION_CLUSTERS = 'REQUEST_LOCATION_CLUSTERS';
export const SET_MAP_MARKERS = 'SET_MAP_MARKERS';
export const HIGHLIGHT_MARKER = 'HIGHLIGHT_MARKER';
export const UNHIGHLIGHT_MARKER = 'UNHIGHLIGHT_MARKER';

/*
 * ACTION CREATORS
 */

export function setMapViewport(viewport) {
  return {
    type: SET_MAP_VIEWPORT,
    viewport
  };
}

export function setMapBounds(bounds) {
  return {
    type: SET_MAP_BOUNDS,
    bounds: {
      southWest: [bounds._southWest.lat, bounds._southWest.lng],
      northEast: [bounds._northEast.lat, bounds._northEast.lng]
    }
  };
}

function requestLocationClusters(bounds, zoom) {
  return {
    type: REQUEST_LOCATION_CLUSTERS,
    bounds,
    zoom
  };
}

function setMapMarkers(locationClusters) {
  const markers = {};

  for (const cluster of locationClusters) {
    markers[cluster.id] = {
      id: cluster.id,
      count: cluster.numLocations,
      coordinate: cluster.center,
      locations: cluster.locations
    };
  }

  return {
    type: SET_MAP_MARKERS,
    markers: markers
  };
}

/*
 * setSpecificMovieMarkers sets map markers for locations for a singular movie
 */
export function setSpecificMovieMapMarkers(movie) {
  const markers = {};

  for (const movieLocation of movie.locations) {
    markers[movieLocation.id] = {
      id: movieLocation.id,
      count: 1,
      coordinate: movieLocation.point,
      locations: [movieLocation]
    };
  }

  return {
    type: SET_MAP_MARKERS,
    markers: markers
  }
}

/*
 * fetchMapMarkers requests all location clusters within the given bounds/zoom.
 * Converts each cluster into a map marker, and updates the markers state.
 * extracts a list of movieIds each cluster contains, and dispatches an action to update moviesShowing.
 * @param bounds: {southWest: [<lat>, <lon>], northEast: [<lat>, <lon>]} an object describing the southwest and northeast bounds to get location clusters for
 * @param zoom: the current zoom level of the map.
 */
export function fetchMapMarkers(bounds, zoom) {
  return async function(dispatch, getState) {
    dispatch(requestLocationClusters(bounds, zoom));

    const { domain } = getState();

    const southWest = bounds.southWest;
    const northEast = bounds.northEast;

    let clusters = [];

    try {
      const response = await fetch(`${domain}/film-clusters?swlat=${southWest[0]}&swlon=${southWest[1]}&nelat=${northEast[0]}&nelon=${northEast[1]}&zoom=${zoom}`)
      clusters = await response.json();
    } catch (err) {
      console.error(`something wen't wrong getting clusters for current bounds: ${bounds} at zoom: ${zoom}\n${err}`);
    }

    dispatch(setMapMarkers(clusters));

    const movieIds = clusters.reduce((movieIds, cluster) => {
      return [...movieIds, ...cluster.movies];
    }, []);

    dispatch(setMovieIdsShowing(movieIds));
  }
}

export function highlightMarker(locationId) {
  return {
    type: HIGHLIGHT_MARKER,
    locationId
  };
}

export function unhighlightMarker() {
  return {
    type: UNHIGHLIGHT_MARKER,
  };
}