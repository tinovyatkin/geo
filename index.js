/* eslint-disable import/order */
'use strict';

const { latitude, longitude, elevation } = require('./lib/common');

module.exports.latitude = latitude;
module.exports.longitude = longitude;
module.exports.elevation = elevation;

const {
  getDistance,
  isPointInCircle,
  isPointInside,
  getBounds,
  getCenterOfBounds,
} = require('./lib/native');

module.exports.getDistance = getDistance;
module.exports.isPointInCircle = isPointInCircle;
module.exports.isPointInside = isPointInside;
module.exports.getBounds = getBounds;
module.exports.getCenterOfBounds = getCenterOfBounds;

const { orderByDistance } = require('./lib/orderByDistance');
const { findNearest } = require('./lib/findNearest');

module.exports.orderByDistance = orderByDistance;
module.exports.findNearest = findNearest;
