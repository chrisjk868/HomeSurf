# HomeSurf API Documentation
This api allows clients to get different hotel reservation information according to their preferences. It allows different people to sign up to our service, browse different hotels within a given location.

## Automatic database update
**Request Format:** /

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** This endpoint automatically updates the database for our service before the user has access to anything.

**Example Request:** /

**Example Response:**
```
All up to date.
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## Login to website
**Request Format:** /login

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** This endpoint allows users to login to our service. A request to this endpoint should take parameters of username and password.

**Example Request:** /login

**Example Response:**
```
Hi Christopher! Please make a reservation.
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If any of the required parameters aren't filled out.
  - If any of the given parameters don't match or exist in the database.
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## Get all hotels available in the database
**Request Format:** /get-available-hotels

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** For this endpoint it basically gets all of the available hotels open for reservation within the database. This endpoint is only accessed if the user didn't any search bar queries. Depending on the filtering options given to the user, they could filter by either room size and price in ascending or descending order.

**Example Request 1:** /get-available-hotels

**Example Response 1:**
``` json
{
  "hotels": [
    {
      "hotel_id": 2,
      "name": "The Sound Hotel Seattle Belltown, Tapestry Collection by Hilton",
      "location": "2120 4th Ave, Seattle, WA 98121",
      "amenities": "Wi-Fi, Air conditioning, Gym",
      "room_size": 4,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 157,
      "images": "sound-hotel1.jpg, sound-hotel2.jpg, sound-hotel3.jpg",
      "reserved": 0,
      "lat": 47.61453413131376,
      "lng": -122.34198024808725
    },
    {
      "hotel_id": 3,
      "name": "Warwick Seattle",
      "location": "401 Lenora St, Seattle, WA 98121",
      "amenities": "Wi-Fi, Air conditioning, Pool, Hot tub",
      "room_size": 2,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 78,
      "images": "warwick1.jpg, warwick2.jpg, warwick3.jpg",
      "reserved": 0,
      "lat": 47.61416162743643,
      "lng": -122.34083203090104
    },
    {
      "hotel_id": 4,
      "name": "Hyatt Regency Seattle",
      "location": "808 Howell St, Seattle, WA 98101",
      "amenities": "Wi-Fi, Air conditioning, Spa",
      "room_size": 3,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 118,
      "images": "hyatt-regency1.jpg, hyatt-regency2.jpg, hyatt-regency3.jpg",
      "reserved": 0,
      "lat": 47.614741698368114s,
      "lng": -122.33454591740634
    }
    ...
  ]
}
```

**Example Request 2:** localhost:8000/get-available-hotels?people=2&sort=ASC

**Example Response 2:**
``` json
{
  "hotels": [
    {
      "hotel_id": 25,
      "name": "Rosedale Hotel Kowloon",
      "location": "86 Tai Kok Tsui Rd, Tai Kok Tsui, Hong Kong 00000",
      "amenities": "Wi-Fi, Air conditioning, Pool, Hot tub",
      "room_size": 2,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 27,
      "images": "rosedale1.jpg, rosedale2.jpg, rosedale3.jpg",
      "reserved": 0,
      "lat": 22.321315708852925,
      "lng": 114.16214791361864
    },
    {
      "hotel_id": 3,
      "name": "Warwick Seattle",
      "location": "401 Lenora St, Seattle, WA 98121",
      "amenities": "Wi-Fi, Air conditioning, Pool, Hot tub",
      "room_size": 2,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 78,
      "images": "warwick1.jpg, warwick2.jpg, warwick3.jpg",
      "reserved": 0,
      "lat": 47.61416162743643,
      "lng": -122.34083203090104
    },
    {
      "hotel_id": 21,
      "name": "The Pottinger Hong Kong",
      "location": "74 Queen's Road Central, 21 Stanley St, Central, Hong Kong 00000",
      "amenities": "Wi-Fi, Air conditioning, Parking",
      "room_size": 2,
      "checkin_time": null,
      "checkout_time": null,
      "rate_per_day": 88,
      "images": "pottinger1.jpg, pottinger2.jpg, pottinger3.jpg",
      "reserved": 0,
      "lat": 22.283108708671396,
      "lng": 114.15532577481844
    }
    ...
  ]
}
```

## Get different hotels available in a certain location
**Request Format:** /search

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** For this endpoint it contains 3 different parameters and they are location, checkin, and checkout. When a request is sent to this endpoint it would return a list of all available locations, and information about each available place of staying that matches the given query parameter values in the form of a JSON object. Here the user could also choose filter options of room size in the parameter of people and sorting by price in the parameter sort.

**Example Request:** /search?location=98101&checkin=12-12-2021 12:00:00&checkout=12-13-2021 12:00:00&people&sort

**Example Response:**
``` json
{
  "hotels": [
    {
      "hotel_id": 4,
      "name": "Hyatt Regency Seattle",
      "location": "808 Howell St, Seattle, WA 98101",
      "amenities": "Wi-Fi, Air conditioning, Spa",
      "room_size": 3,
      "rate_per_day": 118,
      "images": "hyatt-regency1.jpg, hyatt-regency2.jpg, hyatt-regency3.jpg",
      "match": 28
    },
    {
      "hotel_id": 5,
      "name": "W Seattle",
      "location": "1112 4th Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Air conditioning, Parking",
      "room_size": 4,
      "rate_per_day": 146,
      "images": "W1.jpg, W2.jpg, W3.jpg",
      "match": 27
    },
    {
      "hotel_id": 7,
      "name": "Hotel Theodore",
      "location": "1531 7th Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Room service",
      "room_size": 2,
      "rate_per_day": 105,
      "images": "hotel-theodore1.jpg, hotel-theodore2.jpg, hotel-theodore3.jpg",
      "match": 27
    },
    {
      "hotel_id": 8,
      "name": "Hilton Seattle",
      "location": "1301 6th Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Room service",
      "room_size": 3,
      "rate_per_day": 99,
      "images": "HS1.jpg, HS2.jpg, HS3.jpg",
      "match": 27
    },
    {
      "hotel_id": 9,
      "name": "Motif Seattle",
      "location": "1415 5th Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Pets Allowed, Room service",
      "room_size": 4,
      "rate_per_day": 127,
      "images": "motifsea1.jpg, motifsea2.jpg, motifsea3.jpg",
      "match": 27
    },
    {
      "hotel_id": 10,
      "name": "The Westin Seattle",
      "location": "1900 5th Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Pets Allowed, Room service",
      "room_size": 2,
      "rate_per_day": 111,
      "images": "westin1.jpg, westin2.jpg, westin3.jpg",
      "match": 27
    }
  ]
}
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If any of the required parameters aren't filled out.
  - If any of the given parameters don't exist in the database.
  - If check in date is smaller than the current time.
  - If check in date is larger than the check out date.
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## View a hotel that's available
**Request Format:** /view-hotel

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint allows users to view a hotel of their liking and a request to this endpoint should contain the hotel-id query parameter.

**Example Request:** /view-hotel

**Example Response:**
``` json
{
  "hotel_id": 2,
  "name": "The Sound Hotel Seattle Belltown, Tapestry Collection by Hilton",
  "location": "2120 4th Ave, Seattle, WA 98121",
  "amenities": "Wi-Fi, Air conditioning, Gym",
  "room_size": 4,
  "checkin_time": null,
  "checkout_time": null,
  "rate_per_day": 157,
  "images": "sound-hotel1.jpg, sound-hotel2.jpg, sound-hotel3.jpg",
  "reserved": 0,
  "lat": 47.61453413131376,
  "lng": -122.34198024808725
}
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If hotel is already reserved.
  - If hotel doesn't exist in the database.
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## Register and add a new user to the database - maybe add possible email verification or email sign in option
**Request Format:** /signup

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** This endpoint allows users to sign up as an exisiting memember to our service and adds them to our existing database, which is the first step a client must take in order to browse, make reservations etc. on our website. The request should contain 5 different body parameters in the form of first-name, last-name, email, username and password.

**Example Request:** /signup

**Example Response:**
```
  Thanks for joining us! You have signed up successfully. Please login to your account to make reservations.
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If first or last or username doesn't match required regex format.
  - If email doesn't match required regex format.
  - If email already exists in the database.
  - If password doesn't match required regex format.
  - If password doens't match re-enterd password.
  - If any of the body parameters are missing.
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## Reserve a hotel for a specific user
**Request Format:** /reserve

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** This endpoint allows clients to reserve a specific hotel of their choice, and adds the reserved hotel to the client's current list of reservations made. The request to this endpoint should only contain the body paramter of hotel-id.

**Example Request:** /reserve


**Example Response:**
```
Your reservation for The Charter Hotel Seattle, Curio Collection by Hilton from 2021-12-01 16:00:00 to 2021-12-03 16:00:00 has been confirmed!
```

**Error Handling:**
- Possible 400 errors (all plain text):
  - If hotel doesn't exist in database
  - If hotel is already reserved
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## View the previous reservations made by the user
**Request Format:** /previous-reservations

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** This endpoint allows clients to view the previous reservations they have made on the website. A previous reservations is only added when the user has checked out of their current place of stay.

**Example Request:** /previous-reservations

**Example Response:**
``` json
{
  "previous-reservations": [
    {
      "hotel_id": 1,
      "name": "The Charter Hotel Seattle, Curio Collection by Hilton",
      "location": "1610 2nd Ave, Seattle, WA 98101",
      "amenities": "Wi-Fi, Air conditioning, Parking",
      "room_size": 3,
      "checkin_time": "2021-12-01 16:06:01",
      "checkout_time": "2021-12-02 16:06:01",
      "rate_per_day": 158,
      "images": "charter-hotel1.jpg, charter-hotel2.jpg, charter-hotel3.jpg",
      "reserved": 1,
      "lat": 47.6109744440073,
      "lng": -122.340155132747
    },
    {
      "hotel_id": 3,
      "name": "Warwick Seattle",
      "location": "401 Lenora St, Seattle, WA 98121",
      "amenities": "Wi-Fi, Air conditioning, Pool, Hot tub",
      "room_size": 2,
      "checkin_time": "2021-12-03 16:06:01",
      "checkout_time": "2021-12-04 16:06:01",
      "rate_per_day": 78,
      "images": "warwick1.jpg, warwick2.jpg, warwick3.jpg",
      "reserved": 1,
      "lat": 47.6145341313138,
      "lng": -122.341980248087
    }
    ...
  ]
}
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.

## Logout of account
**Request Format:** /logout

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** This endpoint allows users to logout of their accounts.

**Example Request:** /logout

**Example Response:**

```
You have logged out.
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If internal server is experiencing an issue.