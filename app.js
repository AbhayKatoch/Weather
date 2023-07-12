const express = require('express');
const https = require('https');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res) {
  const cityNames = req.body.cityNames;
  const apiKey = '8994dd498257a940b7e10b05fa8937ec&units=metric';
  const unit = 'metric';
  const weatherData = {};

  // Fetch weather data for each city in parallel using Promise.all
  Promise.all(
    cityNames.map((city) => {
      return new Promise((resolve, reject) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${apiKey}&units=${unit}`;

        https.get(url, function (response) {
          if (response.statusCode === 200) {
            response.on('data', function (data) {
              const cityWeatherData = JSON.parse(data);
              const temp = cityWeatherData.main.temp;
              const weatherDescription = cityWeatherData.weather[0].description;
              const icon = cityWeatherData.weather[0].icon;
              const imageURL =
                'https://openweathermap.org/img/wn/' + icon + '@2x.png';
              weatherData[city] = {
                temp: temp,
                weatherDescription: weatherDescription,
                imageURL: imageURL,
              };
              resolve();
            });
          } else {
            console.error(
              `Error fetching weather for ${city}: ${response.statusCode}`
            );
            weatherData[city] = {
              temp: 'N/A',
              weatherDescription: 'N/A',
              imageURL: '',
            };
            resolve();
          }
        });
      });
    })
  )
    .then(() => {
      res.json(weatherData);
    })
    .catch((error) => {
      console.error(`Error processing request: ${error.message}`);
      res.status(500).json({ error: 'An error occurred' });
    });
});

app.listen(3000, function () {
  console.log('The server is running on port 3000...');
});
