'use strict';

/* global google */

/**
 * @typedef {number[] | {lat: number, lng: number} | {longitude: number, latitude: number, elevation: number}} geoPoint
 */

// Constants
const TO_RAD = Math.PI / 180;
const TO_DEG = 180 / Math.PI;
const PI_X2 = Math.PI * 2;
const PI_DIV4 = Math.PI / 4;

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

function googlePoint(point) {
  // support for {placeId: 'bb'} as point type
  // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-directions
  if (typeof point === 'object' && 'placeId' in point) return point;
  return new google.maps.LatLng({
    lat: latitude(point),
    lng: longitude(point),
  });
}
exports.googlePoint = googlePoint;

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

/**
 * Calculates geodetic distance between two points specified by latitude/longitude using
 * Vincenty inverse formula for ellipsoids
 * Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010
 * (Licensed under CC BY 3.0)
 *
 * @param {geoPoint} start - Start position {latitude: 123, longitude: 123}
 * @param {geoPoint} end - End position {latitude: 123, longitude: 123}
 * @param {number} accuracy -  Accuracy (in meters)
 * @param {number} precision -  Precision (in decimal cases)
 * @returns {number} - Distance (in meters)
 */
// eslint-disable-next-line max-statements
function getDistance(start, end, accuracy, precision) {
  if (typeof google === 'object') {
    return google.maps.geometry.spherical.computeDistanceBetween(
      googlePoint(start),
      googlePoint(end),
    );
  }

  accuracy = Math.floor(accuracy) || 1;
  precision = Math.floor(precision) || 0;

  const s = coords(start);
  const e = coords(end);

  const a = 6378137;
  const b = 6356752.314245;
  const f = 1 / 298.257223563;
  const L = (e.longitude - s.longitude) * TO_RAD;

  let cos2SigmaM;
  let cosSigma;
  let cosSqAlpha;
  let sigma;
  let sinAlpha;
  let sinSigma;

  const U1 = Math.atan((1 - f) * Math.tan(parseFloat(s.latitude) * TO_RAD));
  const U2 = Math.atan((1 - f) * Math.tan(parseFloat(e.latitude) * TO_RAD));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);

  let lambda = L;
  let lambdaP;
  let iterLimit = 100;
  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      cosU2 * sinLambda * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) *
          (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda),
    );
    if (sinSigma === 0) return 0; // co-incident points

    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

    if (isNaN(cos2SigmaM)) {
      cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
    }
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda =
      L +
      (1 - C) *
        f *
        sinAlpha *
        (sigma +
          C *
            sinSigma *
            (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

  if (iterLimit === 0) {
    return NaN; // formula failed to converge
  }

  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);

  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));

  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

  const deltaSigma =
    B *
    sinSigma *
    (cos2SigmaM +
      B /
        4 *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
          B /
            6 *
            cos2SigmaM *
            (-3 + 4 * sinSigma * sinSigma) *
            (-3 + 4 * cos2SigmaM * cos2SigmaM)));

  let distance = b * A * (sigma - deltaSigma);

  distance = distance.toFixed(precision); // round to 1mm precision

  // if (start.hasOwnProperty(elevation) && end.hasOwnProperty(elevation)) {
  if (
    typeof elevation(start) !== 'undefined' &&
    typeof elevation(end) !== 'undefined'
  ) {
    const climb = Math.abs(elevation(start) - elevation(end));
    distance = Math.sqrt(distance * distance + climb * climb);
  }

  return (
    Math.round(distance * 10 ** precision / accuracy) *
    accuracy /
    10 ** precision
  );

  /*
  // note: to return initial/final bearings in addition to distance, use something like:
  var fwdAz = Math.atan2(cosU2*sinLambda,  cosU1*sinU2-sinU1*cosU2*cosLambda);
  var revAz = Math.atan2(cosU1*sinLambda, -sinU1*cosU2+cosU1*sinU2*cosLambda);
  return { distance: s, initialBearing: fwdAz.toDeg(), finalBearing: revAz.toDeg() };
  */
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
  return getDistance(latlng, center) < radius;
}
exports.isPointInCircle = isPointInCircle;
