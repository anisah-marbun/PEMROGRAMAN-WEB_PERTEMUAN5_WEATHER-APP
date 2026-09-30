//OPENWEATHERMAP API

const API_KEY = "c6e33c006037c5e94bd2e10293f3bde8"
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

//ELEMENT HTML

const weatherForm = document.getElementById("weatherForm");
console.log("JavaScript berhasil terhubung");
const cityInput = document.getElementById("cityInput");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feelsLike");
const windSpeed = document.getElementById("windSpeed");

const historyList = document.getElementById("historyList");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

//STATE 

let currentWeather = null;
let currentUnit = "C";

// EVENT LISTENER 

weatherForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showError("silahkan masukkan nama kota.");
        return;
    }
    await getWeather(city); 
})

// GET WEATHER 

const getWeather = async (city) => {
    showLoading();
    hideError();

    try{
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`
        );
        
        // error 404
        if (response.status === 404) {
            throw new Error(
                "kota tidak ditemukan. periksa kembali nama kota."
            );
        }
        // error API lainnya 
        if (!response.ok) {
            throw new Error(
                "terjadi masalah saat mengambil data cuaca."
            );
        }

        const data = await response.json();

    
        currentWeather = data;

        displayWeather(data);

        saveHistory(data.name);

        displayHistory();
    } catch (error) {

        // network error 
        if (error instanceof TypeError) {

            showError(
                "tidak dapat terhubung keserver, periksa koneksi internet kamu."
            );

        } else {
            showError(error.message);
        }

        weatherResult.classList.add("hidden");
        
    } finally {

        hideLoading();

    }

};

// DISPLAY WEATHER

const displayWeather = (data) => {

    cityName.textContent = data.name;
    countryName.textContent = data.sys.country;

    description.textContent = data.weather[0].description;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;

    updateTemperature();

    weatherResult.classList.remove("hidden");
};

//UPDATE TEMPERATURE

const updateTemperature = () => {

    if (!currentWeather) {
        return;
    }

    const tempCelsius = currentWeather.main.temp;
    const feelsCelsius = currentWeather.main.feels_like;

    if (currentUnit === "C") {

        temperature.textContent =
            `${Math.round(tempCelsius)}°C`;

        feelsLike.textContent =
            `${Math.round(feelsCelsius)}°C`;

    } else {

        const tempFahrenheit =
            (tempCelsius * 9 / 5) + 32;

        const feelsFahrenheit =
            (feelsCelsius * 9 / 5) + 32;

        temperature.textContent =
            `${Math.round(tempFahrenheit)}°F`;

        feelsLike.textContent =
            `${Math.round(feelsFahrenheit)}°F`;
    }

};

// TEMPERATURE BUTTON 

celsiusBtn.addEventListener("click", () => {

    currentUnit = "C";

    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");

    updateTemperature();

});

fahrenheitBtn.addEventListener("click", () => {

    currentUnit = "F";

    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");

    updateTemperature();

});

//LOADING 

const showLoading = () => {

    loading.classList.remove("hidden");

};

const hideLoading = () => {

    loading.classList.add("hidden");

};

// ERROR HANDLING

const showError = (message) => {

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");

};

const hideError = () => {

    errorMessage.classList.add("hidden");

};

// LOCAL STORAGE

const saveHistory = (city) => {

    let history =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    // Tambahkan kota baru
    history.unshift(city);

    // Hilangkan duplikat menggunakan Set
    history = [...new Set(history)];

    // Maksimal 5 riwayat
    history = history.slice(0, 5);

    localStorage.setItem(
        "weatherHistory",
        JSON.stringify(history)
    );

};

// DISPLAY HISTORY

const displayHistory = () => {

    const history =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (history.length === 0) {

        historyList.innerHTML =
            `<p class="empty-history">
                Belum ada riwayat pencarian.
            </p>`;

        return;
    }

    // Requirement array method: map()
    historyList.innerHTML = history
        .map(city => {

             return `
                <div
                    class="history-item"
                    data-city="${city}"
                >
                    ${city}
                </div>
            `;

        })
        .join("");

    // Event click riwayat
    document
        .querySelectorAll(".history-item")
        .forEach(item => {
            item.addEventListener("click", async () => {

                const city = item.dataset.city;

                cityInput.value = city;

                await getWeather(city);

            });

        });

};

// ARRAY METHOD: REDUCE()

// Contoh penggunaan reduce untuk menghitung
// jumlah karakter seluruh riwayat pencarian.

const calculateHistoryCharacters = () => {

    const history =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    const totalCharacters = history.reduce(
        (total, city) => total + city.length,
        0
    );

    console.log(
        `Total karakter riwayat: ${totalCharacters}`
    );

};

// LOAD HISTORY WHEN PAGE OPENS

displayHistory();

calculateHistoryCharacters();