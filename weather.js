/**
 * Created by Takatathien on 11/8/2016.
 *
 * This is the JavaScript of weather.html
 * This take in weather data from the server and allow the user
 * to call upon it to display both today temperature and
 * the week forecast.
 */

(function() {
    'use strict';
    var times;

    window.onload = function() {
        var request = new XMLHttpRequest();
        request.onload = loadCityList;
        request.open('GET', 'https://webster.cs.washington.edu/cse154/weather.php?mode=cities', true);
        request.send();

        document.getElementById('search').onclick = getCity;
    };

    // load the entire list of city from the server into the input box.
    // if the website is wrong, then print out the error code.
    function loadCityList() {
        if (this.status == 200) {
            var response = this.responseText;
            var cities = response.split('\n');
            var input = document.getElementById('cities');
            for (var i = 0; i < cities.length; i++) {
                var city = document.createElement('option');
                city.value = cities[i];
                city.innerHTML = cities[i];
                input.appendChild(city);
            }
            document.getElementById('loadingnames').style.display = 'none';
        } else {
            document.getElementById('errors').innerHTML = this.responseText;
        }
    }

    // take in what city the user typed in the input box and call the server
    // for information about the city today weather and forecast.
    function getCity() {
        document.getElementById('resultsarea').style.display = 'inline';
        display('none');
        loading('initial');
        var cityInput = document.getElementById('citiesinput').value.replace(/\s+/g, '');

        var request1 = new XMLHttpRequest();
        request1.onload = getWeather;
        request1.open('GET', 'https://webster.cs.washington.edu/cse154/weather.php?mode=oneday&city=' + cityInput, true);
        request1.send();

        var request2 = new XMLHttpRequest();
        request2.onload = getForecast;
        request2.open('GET', 'https://webster.cs.washington.edu/cse154/weather.php?mode=week&city=' + cityInput, true);
        request2.send();

    }

    // set up the entire result area where it will display the city
    // name, time, weather condition and temperature.
    // allow the user to switch between temperature mode to read
    // temperature or precipitate mode to see a graph of chance of rain.

    // if the city is not in the server then let the user know.
    // if the code return other errors, then print out the error.
    function getWeather() {
        if (this.status == 200) {
            document.getElementById('resultsarea').style.display = 'inline';
            document.getElementById('nodata').style.display = 'none';
            display('block');
            loading('none');
            document.getElementById('graph').style.display = 'none';
            document.getElementById('temp').onclick = tempMode;
            document.getElementById('precip').onclick = precipMode;

            var response = this.responseXML;
            document.getElementById('location').innerHTML = '';
            var cityName = document.createElement('p');
            cityName.innerHTML = response.querySelector('name').textContent;
            cityName.className = 'title';
            document.getElementById('location').appendChild(cityName);

            var cityDate = document.createElement('p');
            cityDate.innerHTML = new Date();
            document.getElementById('location').appendChild(cityDate);

            var time = response.querySelector('time');
            var cityDescription = document.createElement('p');
            cityDescription.innerHTML = time.querySelector('symbol').getAttribute('description');
            document.getElementById('location').appendChild(cityDescription);

            var temperature = parseInt(time.querySelector('temperature').textContent);
            document.getElementById('currentTemp').innerHTML = Math.round(temperature) + '&#8457';

            document.getElementById('graph').innerHTML = '';
            times = response.querySelectorAll('time');
            var table = document.getElementById('graph');
            var tr = document.createElement('tr');
            for (var i = 0; i < times.length; i++) {
                var td = document.createElement('td');
                var div = document.createElement('div');
                var precip = times[i].querySelector('clouds').getAttribute('chance');
                div.innerHTML = precip + "%";
                div.style.height = precip + "%";
                td.appendChild(div);
                tr.appendChild(td);

            }
            table.appendChild(tr);

            var slider = document.getElementById('slider');
            slider.value = 0;
            slider.onchange = changeTemp;
        } else if (this.status == 410) {
            document.getElementById('resultsarea').style.display = 'inline';
            document.getElementById('nodata').style.display = 'block';
            display('none');
            loading('none');
        } else {
            document.getElementById('nodata').style.display = 'none';
            document.getElementById('errors').innerHTML = this.responseText;
        }
    }

    // this allow the user to slide the slider to change the display
    // temperature of the city for the interval of 3 hours each.
    function changeTemp() {
        var index = this.value / 3;
        var temperature = parseInt(times[index].querySelector('temperature').textContent);
        document.getElementById('currentTemp').innerHTML = Math.round(temperature) + '&#8457';
    }

    // switch the interface to temperature mode.
    function tempMode() {
        document.getElementById('temps').style.display = 'block';
        document.getElementById('graph').style.display = 'none';
    }

    // switch the interface to precipitate mode.
    function precipMode() {
        document.getElementById('temps').style.display = 'none';
        document.getElementById('graph').style.display = 'block';
    }

    // get the entire week forecast of the city and display them
    // with picture and temp on a table
    function getForecast() {
            var response = JSON.parse(this.responseText);
            document.getElementById('forecast').innerHTML = '';
            var table = document.getElementById('forecast');
            var tr1 = document.createElement('tr');
            var tr2 = document.createElement('tr');

            for (var i = 0; i < response.weather.length; i++) {
                var td1 = document.createElement('td');
                var img = document.createElement('img');
                img.src = 'https://openweathermap.org/img/w/' + response.weather[i].icon + '.png';
                td1.appendChild(img);
                tr1.appendChild(td1);

                var td2 = document.createElement('td');
                td2.innerHTML = Math.round(response.weather[i].temperature) + '&#176';
                tr2.appendChild(td2);
            }
            table.appendChild(tr1);
            table.appendChild(tr2);
    }

    // helper method that switch the display of special location of the interface
    // on special duration during other method call.
    function display(state) {
        document.getElementById('location').style.display = state;
        document.getElementById('buttons').style.display = state;
        document.getElementById('forecast').style.display = state;
        document.getElementById('graph').style.display = state;
        document.getElementById('temps').style.display = state;
        document.getElementById('errors').innerHTML = '';
    }

    // helper method that switch the display of the loading logo on special
    // duration during other method call.
    function loading(state) {
        document.getElementById('loadinglocation').style.display = state;
        document.getElementById('loadinggraph').style.display = state;
        document.getElementById('loadingforecast').style.display = state;
    }

})();