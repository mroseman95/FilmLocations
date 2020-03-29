import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setMapViewport, setMapBounds, fetchMapMarkers, setSpecificMovieMapMarkers } from '../../actions';

import { Map, TileLayer } from 'react-leaflet';

import ClusterMarker from './ClusterMarker.js';
import LocationMarker from './LocationMarker.js';

import './MovieMap.css';

export default function MovieMap() {
  const dispatch = useDispatch();

  const map = useRef(null);

  const viewport = useSelector(state => state.map.viewport, shallowEqual);
  const bounds = useSelector(state => state.map.bounds, shallowEqual);

  // Invalidate the maps size whenever the movie info panel shows or hides
  const movieInfoShowing = useSelector(state => state.movieInfo.showing);
  useEffect(() => {
    const leafletElement = map.current.leafletElement;
    leafletElement.invalidateSize();
  }, [movieInfoShowing]);

  const specificMovie = useSelector(state => state.specificMovie, shallowEqual);
  useEffect(() => {
    if (specificMovie !== null) {
      dispatch(setSpecificMovieMapMarkers(specificMovie));
    }
  }, [specificMovie]);

  // set the map markers when the bounds change or a specific movie is set/unset
  useEffect(() => {
    if (specificMovie !== null) {
      return;
    }

    if (
      bounds.southWest[0] !== undefined && bounds.southWest[1] !== undefined &&
      bounds.northEast !== undefined && bounds.northEast[1] !== undefined
    ) {
      dispatch(fetchMapMarkers(bounds, viewport.zoom));
    }
  }, [bounds, specificMovie]);


  const markers = useSelector(state => state.map.markers, shallowEqual);

  // if a specific movie is showing, when markers change fit the map to show the new markers
  useEffect(() => {
    if (specificMovie !== null) {
      const leafletElement = map.current.leafletElement;
      leafletElement.fitBounds(Object.values(markers).map((marker) => {
        return marker.coordinate
      }));
    }
  }, [markers]);

  return (
    <Map
      ref={map}
      worldCopyJump={true}
      minZoom={window.screen.width < 576 ? 2 : 4}
      maxZoom={20}
      viewport={viewport}
      whenReady={() => {
        const leafletElement = map.current.leafletElement;
        const bounds = leafletElement.getBounds();
        dispatch(setMapBounds(bounds));
      }}
      onViewportChanged={(newViewport) => {
        dispatch(setMapViewport(newViewport));
        // grab the new bounds from the leafletElement dynamic property
        const leafletElement = map.current.leafletElement;
        const bounds = leafletElement.getBounds();
        dispatch(setMapBounds(bounds));
      }}
    >
      <TileLayer
        attribution={'&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'}
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      />

      {Object.values(markers).map((marker) => {
        if (marker.count > 1) {
          return (
            <ClusterMarker key={marker.id} marker={marker}></ClusterMarker>
          );
        } else {
          return (
            <LocationMarker key={marker.id} marker={marker}></LocationMarker>
          );
        }
      })}
    </Map>
  );
}