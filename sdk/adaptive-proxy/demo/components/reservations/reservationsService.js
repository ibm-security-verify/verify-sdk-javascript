const {v4: uuid} = require('uuid');

const reservationDAL = require('./reservationsDAL');


/**
 * Get all reservations through the data access layer.
 * @return {Object[]} The array of reservations.
 */
function getAllReservations() {
  return reservationDAL.readAllReservations();
}

/**
 * Get a specific reservation through the data access layer.
 * @param {string} id The identifier of the reservation.
 * @return {Object} The retrieved reservation.
 */
function getReservation(id) {
  return reservationDAL.readReservation(id);
}

/**
 * Create and add a new reservation through the data access layer.
 * @param {Object} reservation The reservation object to add.
 * @return {Object} The stored reservation.
 */
function createReservation(reservation) {
  reservation.id = uuid();
  reservationDAL.storeReservation(reservation);
  return reservation;
}

/**
 * Update an existing reservation through the data access layer.
 * @param {Object} oldReservation The old reservation to update.
 * @param {Object} newReservation The new updated reservation.
 * @return {Object} The updated reservation.
 */
function updateReservation(oldReservation, newReservation) {
  oldReservation.displayName = newReservation.displayName;
  oldReservation.pointsBalance = newReservation.pointsBalance;
  oldReservation.status = newReservation.status;
  oldReservation.reservations = newReservation.reservations;

  return oldReservation;
}

/**
 * Delete an existing reservation through the data access layer.
 * @param {Object} reservation The reservation to delete.
 */
function deleteReservation(reservation) {
  reservationDAL.deleteReservation(reservation);
}

module.exports = {createReservation, getAllReservations, getReservation,
  updateReservation, deleteReservation};
