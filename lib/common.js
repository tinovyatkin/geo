'use strict';

/**
 * @typedef {number[] | {lat: number, lng: number} | {longitude: number, latitude: number, elevation: number}} geoPoint
 */

/**
 * Converts point object into canonical format
 *
 * @param {geoPoint} point
 * @returns {{ longitude: string | number, latitude: string | number, elevation: string | number }} - return key index or name
 */
function getKeys(point) {
  // GeoJSON Array [longitude, latitude(, elevation)]
  if (Array.isArray(point)) {
    return {
      longitude: point.length >= 1 ? 0 : undefined,
      latitude: point.length >= 2 ? 1 : undefined,
      elevation: point.length >= 3 ? 2 : undefined,
    };
  }
  if (typeof point !== 'object') return undefined;

  const getKey = possibleValues =>
    possibleValues.find(key =>
      Object.prototype.hasOwnProperty.call(point, key),
    );

  const lng = getKey(['lng', 'lon', 'longitude']);
  const lat = getKey(['lat', 'latitude']);
  const elev = getKey(['alt', 'altitude', 'elevation', 'elev']);

  // return undefined if not at least one valid property was found
  if (
    typeof lat === 'undefined' &&
    typeof lng === 'undefined' &&
    typeof elev === 'undefined'
  ) {
    return undefined;
  }

  return {
    latitude: lat,
    longitude: lng,
    elevation: elev,
  };
}

/**
 * Returns longitude
 *
 * @param {geoPoint} point
 * @returns {number}
 */
function longitude(point) {
  return point[getKeys(point).longitude];
}
exports.longitude = longitude;

/**
 * Returns latitude
 *
 * @param {geoPoint} point
 * @returns {number}
 */
function latitude(point) {
  return point[getKeys(point).latitude];
}
exports.latitude = latitude;

/**
 * Return elevation
 *
 * @param {geoPoint} point
 */
function elevation(point) {
  return point[getKeys(point).elevation];
}
exports.elevation = elevation;

function coords(point) {
  const retval = {
    latitude: point[getKeys(point).latitude],
    longitude: point[getKeys(point).longitude],
  };

  const elev = point[getKeys(point).elevation];

  if (typeof elev !== 'undefined') {
    retval.elevation = elev;
  }

  return retval;
}
exports.coords = coords;
