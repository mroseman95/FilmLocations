import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import { Marker } from 'react-leaflet';


const CIRCLE_MARKER_RADII = [
  { max: 5, radius: 15 },
  { max: 10, radius: 25 },
  { max: 30, radius: 30 },
  { max: 100, radius: 40 },
  { max: 500, radius: 50 },
  { max: 1000, radius: 60 },
  { max: Infinity, radius: 80 }
];

/*
 * getCircleMarkerRadius calculates what the radius for the circle marker on the map for a cluster with the given number of locations
 * @param numLocations: how many locations are in the cluster this circle marker represents
 * @return: the radius the circle marker should have
 */
function getCircleMarkerRadius(numLocations) {
  for (const range of CIRCLE_MARKER_RADII) {
    const max = range.max;
    const radius = range.radius;

    if (numLocations < max) {
      return radius;
    }
  }
}

function ClusterMarker(props) {
  const coordinate = useSelector(state => state.map.markers[props.markerId].coordinate, shallowEqual);
  const count = useSelector(state => state.map.markers[props.markerId].count);
  const highlighted = useSelector(state => state.map.markers[props.markerId].highlighted);
  const markerLocations = useSelector(state => state.map.markers[props.markerId].locations, shallowEqual);

  return (
    <Marker
      position={coordinate}
      icon={L.divIcon({
        html: `<div class="cluster-marker-count">${count}</div>`,
        className: highlighted ? 'cluster-marker-icon highlighted' : 'cluster-marker-icon',
        iconSize: 2 * getCircleMarkerRadius(count)
      })}
      onClick={() => props.onClusterMarkerClick(markerLocations)}
    >
    </Marker>
  );
}

export default ClusterMarker;
