'use strict';

/* global google */
/**
 * @typedef {number[] | {lat: number, lng: number} | {longitude: number, latitude: number, elevation: number}} geoPoint
 */
const { latitude, longitude } = require('./common');

function googlePoint(point) {
  return new google.maps.LatLng({
    lat: latitude(point),
    lng: longitude(point),
  });
}
exports.googlePoint = googlePoint;

/**
 *
 * @param {geoPoint} start
 * @param {geoPoint} end
 * @returns {number}
 */
function getDistance(start, end) {
  return google.maps.geometry.spherical.computeDistanceBetween(
    googlePoint(start),
    googlePoint(end),
  );
}
exports.getDistance = getDistance;

/**
 * Checks whether a point is inside of a circle or not.
 *
 * @param {geoPoint} latlng - coordinate to check (e.g. {latitude: 51.5023, longitude: 7.3815})
 * @param {geoPoint} center - coordinate of the circle's center (e.g. {latitude: 51.4812, longitude: 7.4025})
 * @param {number} radius - maximum radius in meters
 * @return {boolean} - true if the coordinate is within the given radius
 */

function isPointInCircle(latlng, center, radius) {
  return new google.maps.Circle({
    center: googlePoint(center),
    radius,
  })
    .getBounds()
    .contains(googlePoint(latlng));
}
exports.isPointInCircle = isPointInCircle;

/**
 * Checks whether a point is inside of a polygon or not. Note: the polygon coords must be in correct order!
 *
 * @param {geoPoint} point
 * @param {geoPoint[]} polygon
 * @returns {boolean} - true if the coordinate is inside the given polygon
 */
function isPointInside(point, polygon) {
  const poly = new google.maps.Polygon({
    paths: polygon.map(v => googlePoint(v)),
  });

  return google.maps.geometry.poly.containsLocation(googlePoint(point), poly);
}
exports.isPointInside = isPointInside;
