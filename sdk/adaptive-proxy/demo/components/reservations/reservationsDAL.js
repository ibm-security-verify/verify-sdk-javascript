const reservations = require('./reservations');

/**
 * Get all reservations from the reservations array.
 * @return {Object[]} The array of reservations.
 */
function readAllReservations() {
  return reservations;
}

/**
 * Get a specific reservation from the reservations array.
 * @param {string} id The identifier of the specific reservation.
 * @return {Object} The specific reservation.
 */
function readReservation(id) {
  return reservations.find((reservation) => reservation.id === id);
}

/**
 * Store a new reservation in the reservations array.
 * @param {Object} reservation The reservation to store.
 */
function storeReservation(reservation) {
  reservations.push(reservation);
}

/**
 * Delete a reservation from the reservations array.
 * @param {Object} reservation The reservation to delete.
 */
function deleteReservation(reservation) {
  const index = reservations.indexOf(reservation);
  reservations.splice(index, 1);
}

module.exports = {storeReservation, readAllReservations, readReservation,
  deleteReservation};
