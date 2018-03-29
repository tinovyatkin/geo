'use strict';

const { latitude, longitude, elevation } = require('./lib/common');

exports.latitude = latitude;
exports.longitude = longitude;
exports.elevation = elevation;

const { getDistance, isPointInCircle } = require('./lib/native');

exports.getDistance = getDistance;
exports.isPointInCircle = isPointInCircle;
