'use strict';
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(distance, duration, cords) {
    this.distance = distance;
    this.duration = duration;
    this.cords = cords;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  setclicks() {
    this.clicks++;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(distance, duration, cords, cadence) {
    super(distance, duration, cords);
    this.cadence = cadence;
    this.calPace();
    this._setDescription();
  }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(distance, duration, cords, elevation) {
    super(distance, duration, cords);
    this.elevation = elevation;
    this._setDescription();
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// APPLICATION ARCHITECTURE
let formtype = 'nw';
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const deleteWorkOut = document.querySelector('.btn-delete');
const viewWorkOut = document.querySelector('.btn-view');
const editWorkoutbtn = document.querySelector('.btn-edit');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    this.getlocalstorage();
    form.addEventListener('submit', this.newWorkOut.bind(this));
    inputType.addEventListener('change', this.changeWorkout.bind(this));
    containerWorkouts.addEventListener('click', this.moveToPopUp.bind(this));
    containerWorkouts.addEventListener(
      'click',
      this.deleteSingleWorkout.bind(this)
    );
    containerWorkouts.addEventListener('click', this.editWorkout.bind(this));
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._displayMap.bind(this),
      function (arr) {
        alert('Something went wrong');
      }
    );
  }
  _displayMap(position) {
    const { latitude, longitude } = position.coords;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, this.#mapZoomLevel);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this.renderingForm.bind(this));
    this.#workouts.forEach(work => {
      this._displaymarker(work);
    });
  }
  renderingForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  changeWorkout() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  newWorkOut(e, workoutpass) {
    e.preventDefault();
    console.log(formtype);
    // Retrieve the form da
    // Perform different actions based on the purpose parameter
    const validInput = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    if (formtype === 'nw') {
      // Handle new workout creation
      console.log(formtype);
      const { lat, lng } = this.#mapEvent.latlng;
      // ...
      //n Get data from the form
      // check if activivty is running create a running object
      if (type === 'running') {
        const cadence = +inputCadence.value;
        // check data validation
        if (
          !validInput(distance, duration, cadence) ||
          !allPositive(distance, duration, cadence)
        ) {
          return alert('Input has to be a positive number');
        }
        workout = new Running(distance, duration, [lat, lng], cadence);
      }
      // check if cycling then create a cycling object
      if (type === 'cycling') {
        const elevation = +inputElevation.value;
        // check data validation
        if (
          !validInput(distance, duration, elevation) ||
          !allPositive(distance, duration)
        ) {
          return alert('Input has to be a positive number');
        }
        workout = new Cycling(distance, duration, [lat, lng], elevation);
      }
      // add new workout to workout array
      this.#workouts.push(workout);
      // display the workout on map through marker
      this._displaymarker(workout);
      // display the workout in the list
      this._displaylsit(workout);
      // clear input feilds
      inputDistance.value =
        inputDuration.value =
        inputCadence.value =
        inputElevation.value =
          ' ';
      //Hide  the form
      form.style.display = 'none';
      form.classList.add('hidden');
      setTimeout(() => (form.style.display = 'grid'), 1000);
      // local storage
      this.setlocalstorage();
    } else if (formtype === 'ew') {
      console.log(formtype);
      // Handle workout editing
      // ...
      inputDistance.value = this.#workouts[workoutpass].distance;
      inputDuration.value = this.#workouts[workoutpass].duration;
      inputCadence.value = this.#workouts[workoutpass].elevation;
      inputElevation.value = this.#workouts[workoutpass].pace;
    }
  }
  _displaymarker(workout) {
    L.marker(workout.cords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeButton: false,
          maxWidth: 200,
          minWidth: 50,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _displaylsit(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class= "workout-align">
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
        </div>
        <div class="workout__details">
          <button class="workout__title button btn-delete">Delete</button>
          <button class="workout__title button btn-edit">Edit</button>
          <button class="workout__title button btn-view">View</button>
      </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevation}</span>
          <span class="workout__unit">m</span>
        </div>
        </div>
        <div class="workout__details">
          <button class="workout__title button btn-delete">Delete</button>
          <button class="workout__title button btn-edit">Edit</button>
          <button class="workout__title button btn-view">View</button>
      </div>
      </li>
      `;
    form.insertAdjacentHTML('afterend', html);
  }
  moveToPopUp(e) {
    const target = e.target.parentNode.parentNode.dataset.id;
    if (!target || !e.target.classList.contains('btn-view')) return;
    const workout = this.#workouts.find(work => work.id === target);
    this.#map.setView(workout.cords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  deleteSingleWorkout(e) {
    const target = e.target.parentNode.parentNode.dataset.id;
    if (!target || !e.target.classList.contains('btn-delete')) return;
    const workout = this.#workouts.findIndex(work => work.id === target);
    this.#workouts.splice(workout, 1);
    e.target.parentNode.parentNode.remove();
    location.reload();
    this.setlocalstorage();
  }
  editWorkout(e) {
    //
    // manage event handler and get id from it
    const target = e.target.parentNode.parentNode.dataset.id;
    if (!target || !e.target.classList.contains('btn-edit')) return;
    //loop through array to find the id
    // Check which id matches the id generated through edit event handler
    const workout = this.#workouts.findIndex(work => work.id === target);
    // display some sort of form to get input for edits
    this.renderingForm();
    this.changeWorkout();
    formtype = 'ew';
    this.newWorkOut(e, workout);
    // newworkout function can be used to validate (either through click event or passing a para meter such as type if type == edit then fill the form with original values and on submit it will edit a form instead of creating new one)
    console.log(this.#workouts[workout]);
    // update that inputs in the original array
    // update the ui
  }
  setlocalstorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  getlocalstorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._displaylsit(work);
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new App();
