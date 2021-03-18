function delete_city(element, city_name) {
	let xhr = new XMLHttpRequest();
	xhr.open("DELETE", `/favorites?q=${city_name}`);
	xhr.send();
	xhr.addEventListener("load", function() {
		if (xhr.status == 200) {
			element.parentNode.parentNode.parentNode.remove();
		} else {
			alert("Error occured");
		}
	})
	xhr.addEventListener("error", function() {
		alert("Error with server, try to reload page");
	})
}

function add_city(city_name, first) {
	document.getElementById("fake_city").style.display = "block";
	if (city_name === '') {
		alert("Ошибка, Вы не ввели город");
		document.getElementById("fake_city").style.display = "none";
		return;
	}
	let xhr = new XMLHttpRequest();
	city_name = city_name.toLowerCase();
	city_name = city_name.charAt(0).toUpperCase() + city_name.slice(1);
	if (!first) {
		xhr.open("POST", `/favorites?q=${city_name}`);
		xhr.send();
		xhr.addEventListener("load", function() {
			if (xhr.status === 404) {
				document.getElementById("fake_city").style.display = "none";
				alert(`Ошибка, ${city_name} не найден!`);
				return;
			} else if (xhr.status === 409) {
				document.getElementById("fake_city").style.display = "none";
				alert(`Ошибка, ${city_name} уже есть!`);
				return;
			} else if (xhr.status === 200) {
				update_another_city_data(city_name);
			}
		})
		xhr.addEventListener("error", function() {
			alert("Error with server, try to reload page");
		})
	} else {
		update_another_city_data(city_name);
	}
}

function update_another_city_data(city_name) {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/weather/city?q=${city_name}`);
	xhr.send();
	xhr.addEventListener("load", function() {
		if (xhr.status === 404) {
			document.getElementById("fake_city").style.display = "none";
			alert(`Ошибка, ${city_name} не найден!`);
		} else if (xhr.status === 409) {
			document.getElementById("fake_city").style.display = "none";
			alert(`Ошибка, ${city_name} уже есть!`);
		} else {
			data = JSON.parse(xhr.response);
			// create list item
			new_city = document.createElement("li");
			new_city.classList.add("another_city");
			// creating div for header
			header = document.createElement("div");
			header.classList.add("another_city_header");
			// creating div for city name
			another_city_name = document.createElement("div");
			another_city_name.classList.add("another_city_name");
			another_city_name.innerHTML = `<h3>${data.name}</h3>`;
			header.appendChild(another_city_name);
			// create div for temperature
			another_city_temp = document.createElement("div");
			another_city_temp.classList.add("another_city_temperature");
			another_city_temp.innerHTML = `<span>${Math.round(data.main.temp)}°C</span>`;
			header.appendChild(another_city_temp);
			// create div for image
			another_city_image = document.createElement("div");
			another_city_image.classList.add("another_city_weather_image");
			another_city_image.innerHTML = `<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" width=50 height=50></img>`;
			header.appendChild(another_city_image);
			// create div for close button
			another_city_button = document.createElement("div");
			another_city_button.classList.add("another_city_close_button");
			another_city_button.innerHTML = `<button class="close_button" onclick="delete_city(this, '${data.name}')">X</button>`;
			header.appendChild(another_city_button);
			// adding header to li
			new_city.appendChild(header);
			// create ul for properties
			another_city_prop = document.createElement("ul");
			another_city_prop.classList.add("another_city_properties");
			another_city_prop.innerHTML = `<li><span class="property">Ветер</span>${data.wind.speed} m/s</li>
<li><span class="property">Облачность</span>${data.weather[0].description}</li>
<li><span class="property">Давление</span>${data.main.pressure} hpa</li>
<li><span class="property">Влажность</span>${data.main.humidity} %</li>
<li><span class="property">Координаты</span>[${data.coord.lon}, ${data.coord.lat}]</li>`;
			new_city.appendChild(another_city_prop);
			// appending child
			document.getElementById("fake_city").style.display = "none";
			document.getElementsByClassName("another_cities")[0].appendChild(new_city);
		}
	})
	xhr.addEventListener("error", function() {
		alert("Error with server, try to reload page");
	})
}

function update_main_city(data) {
	document.getElementsByClassName("main_city_name")[0].innerHTML = data.name;
	document.getElementsByClassName("weather_image")[0].innerHTML = `<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" width=100 height=100></img>`
	document.getElementsByClassName("weather_temperature")[0].innerHTML = `<span class="weather_temperature_main">${Math.round(data.main.temp)}°C</span>`;
	document.getElementsByClassName("weather_properties")[0].innerHTML = `<li><span class="property">Ветер</span>${data.wind.speed} m/s</li>
<li><span class="property">Облачность</span>${data.weather[0].description}</li>
<li><span class="property">Давление</span>${data.main.pressure} hpa</li>
<li><span class="property">Влажность</span>${data.main.humidity} %</li>
<li><span class="property">Координаты</span>[${data.coord.lon}, ${data.coord.lat}]</li>`;
}

function defaultGeo() {
	let xhr = new XMLHttpRequest();
	city_name = "Moscow";
	xhr.open("GET", `/weather/city?q=${city_name}&f=true`);
	xhr.send();
	xhr.addEventListener("load", function() {
		new_data = JSON.parse(xhr.response);
		update_main_city(new_data);
	});
	xhr.addEventListener("error", function() {
		alert("Error with server, try to reload page");
	})
}

function updateGeo(data) {
	let lat = data.coords.latitude;
	let lon = data.coords.longitude;
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/weather/coordinates?lat=${lat}&lon=${lon}`);
	xhr.send();
	xhr.addEventListener("load", function() {
		new_data = JSON.parse(xhr.response);
		update_main_city(new_data);
	});
	xhr.addEventListener("error", function() {
		alert("Error with server, try to reload page");
	})
}

function start_geo() {
	document.getElementsByClassName("main_city_name")[0].innerHTML = `Данные загружаются...`;
	document.getElementsByClassName("weather_image")[0].innerHTML = `<img src="static/images/question_mark.png" width=100 height=100></img>`
	document.getElementsByClassName("weather_temperature")[0].innerHTML = `<span class="weather_temperature_main">???&#160;°C</span>`;
	document.getElementsByClassName("weather_properties")[0].innerHTML = `<li><span class="property">Ветер</span>??? m/s</li>
<li><span class="property">Облачность</span>???</li>
<li><span class="property">Давление</span>??? hpa</li>
<li><span class="property">Влажность</span>??? %</li>
<li><span class="property">Координаты</span>[???, ???]</li>`;
	navigator.geolocation.getCurrentPosition(updateGeo, defaultGeo);
}

function get_fav_cities(_callback) {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/favorites`);
	xhr.send();
	xhr.addEventListener("load", function() {
		data = JSON.parse(xhr.response);
		_callback(data);
	});
	xhr.addEventListener("error", function() {
		alert("Error with server, try to reload page");
	})
}

function main() {
	// add listener for enter
	var input = document.getElementById("input_city");

	input.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("add_city_button").click();
		}
	});
	
	window.addEventListener("offline", function (e) {
		document.getElementById("fake_city").style.display = "none";
		document.getElementsByClassName("update_weather_button")[0].onclick = "";
		document.getElementsByClassName("add_city_button")[0].onclick = "";
		setTimeout(alert("You're went offline, reload page"), 1000);
	});
	
	// get geolocation
	start_geo();
	
	get_fav_cities((data) => {
		console.log(data);
		for (i = 0; i < data.length; i++) {
			add_city(data[i].name, true);
		}
	});
}

	