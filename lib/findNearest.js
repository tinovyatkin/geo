'use strict';

const { orderByDistance } = require('./orderByDistance');

// Finds the nearest coordinate to a reference coordinate
const findNearest = (point, coords) => orderByDistance(point, coords)[0];

module.exports.findNearest = findNearest;
