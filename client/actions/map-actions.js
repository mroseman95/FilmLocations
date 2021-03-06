/*
 * ACTION TYPES
 */

export const SET_MAP_BOUNDS = 'SET_MAP_BOUNDS';
export const REQUEST_LOCATION_CLUSTERS = 'REQUEST_LOCATION_CLUSTERS';
export const REQUEST_SPECIFIC_MOVIE_LOCATION_CLUSTERS = 'REQUEST_SPECIFIC_MOVIE_LOCATION_CLUSTERS';
export const SET_MAP_MARKERS = 'SET_MAP_MARKERS';
export const HIGHLIGHT_MARKER = 'HIGHLIGHT_MARKER';
export const UNHIGHLIGHT_MARKER = 'UNHIGHLIGHT_MARKER';
export const FOCUS_LOCATION = 'FOCUS_LOCATION';
export const UNFOCUS_LOCATION = 'UNFOCUS_LOCATION';

/*
 * ACTION CREATORS
 */

export function setMapBounds(bounds) {
  return {
    type: SET_MAP_BOUNDS,
    bounds: {
      southWest: [bounds._southWest.lat, bounds._southWest.lng],
      northEast: [bounds._northEast.lat, bounds._northEast.lng]
    }
  };
}

function requestLocationClusters(bounds, zoom, movieId) {
  return {
    type: REQUEST_LOCATION_CLUSTERS,
    bounds,
    zoom,
    movieId
  };
}

function setMapMarkers(locationClusters, movieId=null) {
  return {
    type: SET_MAP_MARKERS,
    locationClusters,
    movieId
  };
}

/*
 * fetchMapMarkers requests all location clusters within the given bounds/zoom.
 * Converts each cluster into a map marker, and updates the markers state.
 * extracts a list of movieIds each cluster contains, and dispatches an action to update moviesShowing.
 * @param bounds: {southWest: [<lat>, <lon>], northEast: [<lat>, <lon>]} an object describing the southwest and northeast bounds to get location clusters for
 * @param zoom: the current zoom level of the map.
 * @param movieId: optional parameter, if provided, only locations for the given movie will be fetched
 */
export function fetchMapMarkers(bounds, zoom, movieId) {
  return async function(dispatch, getState) {
    const { domain } = getState();

    const southWest = [bounds._southWest.lat, bounds._southWest.lng];
    const northEast = [bounds._northEast.lat, bounds._northEast.lng];

    let clusters = [];

    if (
      southWest[0] === undefined || southWest[1] === undefined ||
      northEast[0] === undefined || northEast[1] === undefined ||
      zoom === undefined
    ) {
      return;
    }

    dispatch(requestLocationClusters(bounds, zoom, movieId));

    try {
      console.time(`fetching location clusters`);
      const response = await fetch(
        `${domain}/location-clusters?swlat=${southWest[0]}&swlon=${southWest[1]}&nelat=${northEast[0]}&nelon=${northEast[1]}&zoom=${zoom}` +
        (movieId != undefined ? `&movieId=${movieId}` : '')
      );
      clusters = await response.json();
      console.timeEnd(`fetching location clusters`);
    } catch (err) {
      console.error(
        `something wen't wrong getting clusters for current bounds: ${bounds} at zoom: ${zoom}` +
        movieId !== undefined ? ` for movie: ${movieId}` : '' +
        `\n${err}`
      );
    }

    dispatch(setMapMarkers(clusters, movieId));
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
    type: UNHIGHLIGHT_MARKER
  };
}

export function focusLocation(focusedLocation) {
  return {
    type: FOCUS_LOCATION,
    focusedLocation
  };
}

export function unfocusLocation() {
  return {
    type: UNFOCUS_LOCATION
  };
}
