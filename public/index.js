/**
 * Names: Yanjie Niu, Christopher Ku
 * Date: Nov. 26st, 2021
 * Section: CSE 154 AA, SAITAWDEKAR,SONIA
 *
 * This is the JS to implement the homesurf hotel reservation website.
 * It allows a user to sign up or login to the account,
 * displays the hotels on a main view
 * page, enables user to search and filter the available hotels through search
 * bar and drop down list filters. In addition, it enables users to click on any
 * individual hotel view to provide more detailed information about the hotel.
 * From the detailed hotel page, users can see the google map to show the things
 * to do around the hotel. Through this page, users can also reserve the hotel
 * and check their previous reservation records through the nav bar.
 * This index.js file fetches data from the backend HomeSurf API and returns
 * the corresponding data based on users' request.
 */
'use strict';

(function() {
  const LOGIN_DELAY_TIME = 2000;
  const RESERVE_DELAY_TIME = 5000;
  const API_KEY = 'AIzaSyCdxURNXLSVRo4pV1w0LW8U-3yGGgKv_so';
  let TIMER_ONE = undefined;
  let TIMER_TWO = undefined;
  let TIMER_THREE = undefined;
  let TIMER_FOUR = undefined;

  /**
   * Add the init() function that will be called when the window is loaded.
   * @param {string} 'load' - The 'load' event type.
   * @param {object} init - The init() function is used to initialize the whole
   * webpage.
   */
  window.addEventListener('load', init);

  /**
   * When the webpage window is loaded, this function updates the display of the
   * search tool (calendar) based on the date of today. It also gets the
   * username saved in the browser to let the user have the username saved in
   * the login page across browser sessions.
   * The initial stage also triggers the update of the database and loads the
   * page to users.
   */
  function init() {
    let today = new Date();
    let tomorrow = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' +
    (today.getDate() + 1);
    document.getElementsByName("checkin")[0].setAttribute('min', tomorrow);
    document.getElementsByName("checkout")[0].setAttribute('min', tomorrow);
    id('username').value = localStorage.getItem('storedUser');
    id('error').classList.add('hidden');
    initialDbUpdate();
    initialPageLoad();
  }

  /**
   * Update the availability status of all the hotels based on the current time
   * when the user enters the hotel reservation website.
   */
  function initialDbUpdate() {
    let initialUrl = '/';
    fetch(initialUrl, {method: 'POST'})
      .then(statusCheck)
      .catch(handleError);
  }

  /**
   * During the page loading stage, this function displays the login in page. It
   * also makes sure all the fields in the log in form are clear at the initial
   * stage. The function sets up the UIs for users to login, register,
   * and check the past reservation records once they login.
   */
  function initialPageLoad() {
    id('user').classList.remove('hidden');
    id('register-form').classList.add('hidden');
    id('login-form').classList.remove('hidden');
    id('login-corner-btn').classList.add('hidden');
    id('login-corner-btn').addEventListener('click', initialPageLoad);
    id('logout-corner-btn').classList.add('hidden');
    id('login-form').addEventListener('submit', function(event) {
      event.preventDefault();
      submitLoginForm();
    });
    id('register-form-btn').addEventListener('click', () => {
      id('register-result').textContent = '';
      showRegistration();
    });
    id('register-form').addEventListener('submit', function(event) {
      event.preventDefault();
      registerUser();
    });
    id('logout-corner-btn').addEventListener('click', logOut);
    id('register-username').value = '';
    id('register-password').value = '';
    id('confirm-password').value = '';
    id('register-first-name').value = '';
    id('register-last-name').value = '';
    id('email').value = '';
    id('home-nav').addEventListener('click', displayCleanMainPage);
    id('view-past-reservations').addEventListener('click', pastReservationsView);
  }

  /**
   * Allows the user to login to their account after the user provides a valid
   * username and password. Also, it allows the browser to save the
   */
  function submitLoginForm() {
    id('login-error').textContent = '';
    let username = id('username').value;
    window.localStorage.setItem('storedUser', username);
    id('login-success').classList.remove('hidden');
    let data = new FormData(id('login-form'));
    let loginUrl = '/login';
    fetch(loginUrl, {method: 'POST', body: data})
      .then(statusCheck)
      .then(resp => resp.text())
      .then((resp) => {
        TIMER_ONE = setTimeout(() => {
          loginMain(resp);
          clearTimeout(TIMER_ONE);
        }, LOGIN_DELAY_TIME);
      })
      .then(() => {
        TIMER_TWO = setTimeout(() => {
          id('login-success').classList.add('hidden');
          clearTimeout(TIMER_TWO);
        }, LOGIN_DELAY_TIME);
      })
      .catch(handleLoginError);
  }

  /**
   * Shows the login error message if the user fails to login.
   * @param {Object} response - Data in the format of text fetched through
   * the HomeSurf API /login endpoint POST request.
   */
  function handleLoginError(response) {
    id('login-success').classList.add('hidden');
    id('login-error').textContent = response;
  }

  /**
   * Shows the main view page after users login. It clears all the filled in
   * login info in the form, displays the main view UI, and sends the GET
   * request to the HomeSurf API to get all the hotels to the main page.
   * @param {Object} resp - Data in the format of text fetched through
   * the HomeSurf API /login endpoint POST request.
   */
  function loginMain(resp) {
    id('brand').classList.remove('hidden');
    id('username').value = '';
    id('password').value = '';
    id('home').classList.remove('hidden');
    id('home-nav').classList.remove('hidden');
    id('home-nav').classList.add('inline-nav');
    id('about-nav').classList.add('inline-nav');
    id('contact-nav').classList.add('inline-nav');
    id('view-past-reservations').classList.remove('hidden');
    id('view-past-reservations').classList.add('inline-nav');
    id('welcome').textContent = resp;
    id('login-form').classList.add('hidden');
    id('logout-corner-btn').classList.remove('hidden');
    id('error').classList.add('hidden');
    id('hotel-detail-page').classList.add('hidden');
    id('past-reservations').classList.add('hidden');
    id('hotel-detail-page-list').innerHTML = '';
    id('reservation-success').textContent = '';
    updateSearchUIs();
    let url = '/get-available-hotels';
    fetch(url)
      .then(statusCheck)
      .then(output => output.json())
      .then((response) => {
        qs('#item-list').innerHTML = '';
        createCards(response, '#item-list');
      })
      .catch(handleError);
  }

  /**
   * Displays the UIs in the main page for search usage, including the search
   * text bar, the check-in and check-out search calenders, the two dropdown
   * list filters, and the search button.
   */
  function updateSearchUIs() {
    id('location').value = '';
    id('checkin').value = '';
    id('checkout').value = '';
    id('list-btn').addEventListener('click', showListView);
    id('grid-btn').addEventListener('click', showGridView);
    id('people').addEventListener('change', () => {
      qs('#item-list').innerHTML = '';
      if (id('location').value !== '') {
        searchHotels();
      } else {
        filterWithoutSearch();
      }
    });
    id('sort').addEventListener('change', () => {
      qs('#item-list').innerHTML = '';
      if (id('location').value !== '') {
        searchHotels();
      } else {
        filterWithoutSearch();
      }
    });
    id('search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      searchHotels();
    });
  }

  /**
   * Enables users to search for hotels through the text search bar, the checkin
   * and checkout calenders options, the Room Size and the price ordering
   * filters.
   */
  function searchHotels() {
    let searchData = new FormData(id('search-form'));
    let queryObj = {};
    for (let pair of searchData.entries()) {
      queryObj[pair[0]] = pair[1];
    }
    let people = id('people').value;
    let sort = id('sort').value;
    fetch('/search' +
          '?location=' + queryObj['location'] +
          '&checkin=' + queryObj['checkin'] + ' 12:00:00' +
          '&checkout=' + queryObj['checkout'] + ' 12:00:00' +
          '&people=' + people +
          '&sort=' + sort)
      .then(statusCheck)
      .then(resp => resp.json())
      .then((resp) => {
        qs('#item-list').innerHTML = '';
        createCards(resp, '#item-list');
      })
      .catch(handleError);
  }

  /**
   * Enables user to search the hotels when they don't put any search
   * information into the text search bar and the checkin and checkout calendar
   * fields.
   */
  function filterWithoutSearch() {
    fetch('/get-available-hotels' +
          '?people=' + id('people').value +
          '&sort=' + id('sort').value)
      .then(statusCheck)
      .then(output => output.json())
      .then((output) => {
        createCards(output, '#item-list');
      })
      .catch(handleError);
  }

  /**
   * Enables user to reserve a hotel once the user click an individual hotel to
   * use the reserve button to reserve it.
   * @param {number} hotelId - The hotel Id of the individual hotel that the
   * user plans to reserve.
   */
  function reserveRoom(hotelId) {
    let hotelData = new FormData();
    hotelData.append('hotel-id', hotelId);
    fetch('/reserve', {method: 'POST', body: hotelData})
      .then(statusCheck)
      .then(resp => resp.text())
      .then((resp) => {
        id('hotel-detail-page').classList.add('hidden');
        id('reservation-success').textContent = resp;
        id('reservation-success').classList.remove('hidden');
        id('success-message').classList.remove('hidden');
        TIMER_THREE = setTimeout(() => {
          displayCleanMainPage();
          id('reservation-success').classList.add('hidden');
          id('reservation-success').textContent = '';
          id('success-message').classList.add('hidden');
          clearTimeout(TIMER_THREE);
        }, RESERVE_DELAY_TIME);
      })
      .catch(handleError);
  }

  /**
   * Enables user to view the past reservation records.
   */
  function pastReservationsView() {
    id('home').classList.add('hidden');
    id('hotel-detail-page').classList.add('hidden');
    id('brand').classList.remove('hidden');
    id('past-reservations').classList.remove('hidden');
    id('hotel-detail-page-list').innerHTML = '';
    id('reservation-success').textContent = '';
    qs('#past-reservations #items-list').innerHTML = '';
    fetch('/previous-reservations', {method: 'POST'})
      .then(statusCheck)
      .then(resp => resp.json())
      .then((resp) => {
        createCards(resp, '#past-reservations #items-list');
      })
      .catch(handleError);
  }

  /**
   * Once users click the home navigation button, or after the reservation is
   * done, this function redirects users to the home page with the main view of
   * a list of hotels.
   */
  function displayCleanMainPage() {
    id('location').value = '';
    id('checkin').value = '';
    id('checkout').value = '';
    id('people').value = '';
    id('sort').value = '';
    id('item-list').innerHTML = '';
    id('error').classList.add('hidden');
    id('brand').classList.remove('hidden');
    id('home').classList.remove('hidden');
    id('hotel-detail-page').classList.add('hidden');
    id('past-reservations').classList.add('hidden');
    id('hotel-detail-page-list').innerHTML = '';
    id('reservation-success').textContent = '';
    let url = '/get-available-hotels';
    fetch(url)
      .then(statusCheck)
      .then(output => output.json())
      .then((output) => {
        qs('#item-list').innerHTML = '';
        createCards(output, '#item-list');
      })
      .catch(handleError);
  }

  /**
   * This function is used to display the registration page in order
   * to let users sign up to our website.
   */
  function showRegistration() {
    id('logout-corner-btn').classList.add('hidden');
    id('register-form').classList.remove('hidden');
    id('login-form').classList.add('hidden');
    id('login-corner-btn').classList.remove('hidden');
  }

  /**
   * This function is used to register users to the our service and
   * add to them to our database.
   */
  function registerUser() {
    let data = new FormData(id('register-form'));
    let signupUrl = '/signup';
    fetch(signupUrl, {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.text())
      .then(processRegistrationSubmission)
      .catch(handleRegisError);
  }

  /**
   * This function is used to handle errors that may come up within
   * the registration page.
   * @param {object} response - this is an object that is a response from a
   * server.
   */
  function handleRegisError(response) {
    id('register-result').textContent = response;
  }

  /**
   * This function is used for enabling users to sign up to our service as a
   * new user in the database
   * @param {object} response - a reponse from a server that contains
   *                            infomration
   *                            about the newly registered user.
   */
  function processRegistrationSubmission(response) {
    id('logout-corner-btn').classList.add('hidden');
    id('register-form').classList.remove('hidden');
    id('register-result').textContent = response;
    if (response) {
      TIMER_FOUR = setTimeout(() => {
        initialPageLoad();
        clearTimeout(TIMER_FOUR);
      }, LOGIN_DELAY_TIME);
    }
  }

  /**
   * This function enables users to logout and clears all the field values.
   */
  function logOut() {
    id('error').classList.add('hidden');
    id('welcome').textContent = '';
    id('home').classList.add('hidden');
    id('brand').classList.remove('hidden');
    id('register-form').classList.add('hidden');
    id('user').classList.remove('hidden');
    id('login-form').classList.remove('hidden');
    id('username').value = localStorage.getItem('storedUser');
    id('home-nav').classList.add('hidden');
    id('home-nav').classList.remove('inline-nav');
    id('view-past-reservations').classList.add('hidden');
    id('view-past-reservations').classList.remove('inline-nav');
    id('past-reservations').classList.add('hidden');
    id('hotel-detail-page-list').innerHTML = '';
    id('hotel-detail-page').classList.add('hidden');
    id('item-list').innerHTML = '';
    fetch('/logout', {method: 'POST'})
      .then(statusCheck)
      .catch(handleError);
  }

  /**
   * Creates the hotel cards to include hotel image, hotel name,
   * hotel amenities, and hotel price,
   * @param {Object} list - A list of information about hotels, including image,
   * name, amenities, and price.
   * @param {String} selector - A selector for a specific dom element.
   */
  function createCards(list, selector) {
    for (let i = 0; i < list.hotels.length; i++) {
      let hotelCard = createLiHelper(list.hotels[i]);
      let hotelImg = createImgHelper(list.hotels[i]);
      hotelCard.appendChild(hotelImg);
      qs(selector).appendChild(hotelCard);
      let hotelDivOne = gen('div');
      let pOne = createIndPHelper(list.hotels[i]);
      hotelDivOne.appendChild(pOne);
      let pTwo = createAmenPHelper(list.hotels[i]);
      hotelDivOne.appendChild(pTwo);
      hotelCard.appendChild(hotelDivOne);
      let priceDivTwo = gen('div');
      priceDivTwo.classList.add('price-tag');
      hotelCard.appendChild(priceDivTwo);
      let pPrice = createPricePHelper(list.hotels[i]);
      priceDivTwo.appendChild(pPrice);
      if (selector === '#past-reservations #items-list') {
        let reservationDiv = gen('div');
        let pReservationId = createIdHelper(list.hotels[i]);
        reservationDiv.appendChild(pReservationId[0]);
        reservationDiv.appendChild(pReservationId[1]);
        hotelDivOne.appendChild(reservationDiv);
      } else {
        id(list.hotels[i].hotel_id).addEventListener('click', () => {
          showHotelDetails(list.hotels[i].hotel_id);
        });
      }
    }
  }

  /**
   * Display the detail of a specific hotel on the page once the user clicks
   * the hotel.
   * @param {Number} hotelId - An id of the selected hotel.
   */
  function showHotelDetails(hotelId) {
    id('home').classList.add('hidden');
    id('user').classList.add('hidden');
    id('hotel-detail-page').classList.remove('hidden');
    id('hotel-detail-page-list').innerHTML = '';
    let url = '/view-hotel?hotel-id=' + hotelId;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then((resp) => {
        processHotelData(resp, resp['hotel_id']);
        return resp;
      })
      .then(loadMap)
      .catch(handleError);
  }

  /**
   * Loads a map in the detailed hotel page for users to look for things to do.
   * @param {Object} resp - A list of information about a specific, including
   * latitude, longitude of the hotel.
   * @returns {object} a response object.
   */
  function loadMap(resp) {
    let script = gen('script');
    qs('head').appendChild(script);
    script.addEventListener('load', () => {
      let hotel = {lat: resp['lat'], lng: resp['lng']};
      let map = new window.google.maps.Map(id("map"), {
        zoom: 16,
        center: hotel,
        mapTypeId: window.google.maps.MapTypeId.HYBRID
      });
      let marker = new window.google.maps.Marker({position: hotel, map: map});
      marker.setMap(map);
    });
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY;
    return resp;
  }

  /**
   * Creates a detailed hotel card to include hotel image, hotel name,
   * hotel amenities, and hotel price, availability, reservation button,
   * room size.
   * @param {Object} response - A list of information about a selected hotel,
   * including image, name, amenities, and price, availability, reservation
   * button, room size.
   * @param {Number} hotelId - An id of the selected hotel.
   */
  function processHotelData(response, hotelId) {
    let hotelCard = createLiHelper(response);
    let hotelImg = createImgHelper(response);
    hotelCard.appendChild(hotelImg);
    id('hotel-detail-page-list').appendChild(hotelCard);
    let hotelDivOne = gen('div');
    let pOne = createIndPHelper(response);
    hotelDivOne.appendChild(pOne);
    let pTwo = createAmenPHelper(response);
    hotelDivOne.appendChild(pTwo);
    hotelCard.appendChild(hotelDivOne);
    let roomSize = createRoomSizePHelper(response);
    hotelDivOne.appendChild(roomSize);
    let hotelDivTwo = gen('div');
    let availability = createReservedPHelper(response);
    hotelDivTwo.appendChild(availability);
    let reserveButton = gen('button');
    reserveButton.textContent = 'Reserve a room';
    reserveButton.id = 'reserve-btn';
    reserveButton.addEventListener('click', () => {
      reserveRoom(hotelId);
    });
    hotelDivTwo.appendChild(reserveButton);
    hotelCard.appendChild(hotelDivTwo);
    let priceDivTwo = gen('div');
    priceDivTwo.classList.add('price-tag');
    hotelCard.appendChild(priceDivTwo);
    let pPrice = createPricePHelper(response);
    priceDivTwo.appendChild(pPrice);
  }

  /**
   * Creates the hotel paragraph to include hotel room capacity.
   * @param {Object} response - A list of information about hotels, including
   * image, name, amenities, and price.
   * @return {Object} roomSize - A p container to show a hotel room capacity.
   */
  function createRoomSizePHelper(response) {
    let roomSize = gen('p');
    roomSize.textContent = 'Room Capacity: ' + response['room_size'];
    return roomSize;
  }

  /**
   * Creates the hotel paragraph to include hotel reservation status.
   * @param {Object} response - A list of information about hotels, including
   * image, name, amenities, and price.
   * @return {Object} reserveP - A p container to show a hotel room available.
   */
  function createReservedPHelper(response) {
    let reserveP = gen('p');
    if (response.reserved === 0) {
      reserveP.textContent = 'Available';
    } else {
      reserveP.textContent = 'Not Available';
    }
    return reserveP;
  }

  /**
   * Creates a li container to display a hotel.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} hotelCard - A li container to show a hotel.
   */
  function createLiHelper(element) {
    let hotelCard = gen('li');
    hotelCard.setAttribute('id', element.hotel_id);
    hotelCard.classList.add('item');
    return hotelCard;
  }

  /**
   * Creates a hotel image in a hotel card and populate it on the page.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} hotelImg - A hotel image.
   */
  function createImgHelper(element) {
    let hotelImg = gen('img');
    let imgSrcName = element.images.split(',');
    let imgSrc = 'images/' + imgSrcName[0];
    hotelImg.src = imgSrc;
    hotelImg.alt = imgSrcName[0];
    return hotelImg;
  }

  /**
   * Creates a hotel paragraph in a hotel card to include the hotel name and
   * populate it on the page.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} pOne - A hotel user paragraph.
   */
  function createIndPHelper(element) {
    let pOne = gen('p');
    pOne.textContent = element.name;
    pOne.classList.add('item-name');
    return pOne;
  }

  /**
   * Creates a hotel paragraph in a hotel card to include the amenities of the
   * hotel and populate it on the page.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} pTwo - A hotel amenities paragraph.
   */
  function createAmenPHelper(element) {
    let pTwo = gen('p');
    pTwo.textContent = element.amenities;
    pTwo.classList.add('item-category');
    return pTwo;
  }

  /**
   * Creates a hotel paragraph in a hotel card to include the price of the
   * hotel and populate it on the page.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} p - A hotel price paragraph.
   */
  function createPricePHelper(element) {
    let pThree = gen('p');
    let price = element.rate_per_day;
    pThree.textContent = '$' + price + '/ night';
    return pThree;
  }

  /**
   * Creates a hotel paragraph in a hotel card to include the reservation ID and
   * the the checkin and checkout time, and populate it on the page.
   * @param {Object} element - A list of information about each hotel, including
   * the hotel id, image, name, amenities, and price, and so forth.
   * @return {Object} result - Two paragraphs. One paragraph is about the
   * reservation ID of the hotel, while the other paragraph is the checkin and
   * checkout time of a specific reservation.
   */
  function createIdHelper(element) {
    let pFour = gen('p');
    let pFive = gen('p');
    pFour.textContent = 'Reservation ID: ' + element['reservation_id'];
    pFive.textContent = 'From ' + element['checkin_time'] + ' to ' +
    element['checkout_time'];
    let result = [pFour, pFive];
    return result;
  }

  /**
   * Shows the view of the main list of all hotels in the list view mode.
   */
  function showListView() {
    id('item-list').classList.remove('grid-container');
    let allItems = qsa('#item-list li');
    for (let i = 0; i < allItems.length; i++) {
      allItems[i].classList.remove('grid-item');
    }
  }

  /**
   * Shows the view of the main list of all hotels in the grid view mode.
   */
  function showGridView() {
    id('item-list').classList.add('grid-container');
    let allItems = qsa('#item-list li');
    for (let i = 0; i < allItems.length; i++) {
      allItems[i].classList.add('grid-item');
    }
  }

  /**
   * Handles any errors caused in the fetch request/response process from
   * the HomeSurf API.
   * If there is an error, it displays a helpful error page to the user.
   * @param {String} err - The error message returned from the HomeSurf API.
   */
  function handleError(err) {
    id('error').classList.remove('hidden');
    id('error').textContent = err;
    id('user').classList.add('hidden');
    id('home').classList.add('hidden');
    id('hotel-detail-page').classList.add('hidden');
    id('past-reservations').classList.add('hidden');
  }

  /**
   * Checks whether data is fetched through the URL based on the HomeSurf API
   * and the user request successfully.
   * @param {Object} res - An object representing the response of the eventual
   * completion or failure of fetching data from a url.
   * @returns {Object} res or Error object - If the data is fetched
   * successfully, the return value is the passed in response object.
   * If the data is not fetched successfully,
   * the return value is a new Error object.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();
