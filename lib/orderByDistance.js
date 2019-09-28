'use strict';

const { getDistance } = require('./native');

/**
 * Sorts an array of coords by distance from a reference coordinate
 *
 */
function orderByDistance(point, coords) {
  return coords
    .slice()
    .sort((a, b) => getDistance(point, a) - getDistance(point, b));
}
exports.orderByDistance = orderByDistance;
