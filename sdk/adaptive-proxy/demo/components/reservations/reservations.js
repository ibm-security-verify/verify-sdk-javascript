const reservations = [
  {
    'id': '65d8b11e-60eb-4f70-ac3d-2b076816ef98',
    'displayName': 'Bob Smith',
    'pointsBalance': 123456,
    'status': 'Gold',
    'reservations': [
      {
        'depart': 'OOL - Gold Coast',
        'arrive': 'SYD - Sydney',
        'departDate': '6:00am Monday, November 18th 2019',
        'arriveDate': '8:00pm Tuesday, November 19th 2019',
      }],
  },
  {
    'id': '1d6d0f1d-2293-4528-9ddc-2adbe3ca353f',
    'displayName': 'Jane Bob',
    'pointsBalance': 654321,
    'status': 'Platinum',
    'reservations': [
      {
        'depart': 'BNE - Brisbane',
        'arrive': 'MEL - Melbourne',
        'departDate': '2:00am Sunday, November 17th 2019',
        'arriveDate': '4:00pm Wednesday, November 20th 2019',
      }],
  },
];

module.exports = reservations;
