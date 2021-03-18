const express = require('express');
const https = require('https');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;
var db = null;

MongoClient.connect('mongodb://localhost:27017/', function(err, client) {
    if (err) {
		console.error(err);
	}
    db = client.db('main');
})

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/weather/city', (req, res) => {
	if (!Object.keys(req.query).includes('q')) {
		res.status(400).send("No city key in query");
	} else {
		https.get(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=34f71b8b89066cd53a354da222c6de0c&units=metric`, (response) => {
			if (response.statusCode === 404) {
				res.status(404).send("City not found");
			} else {
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});
				response.on('end', () => {
					data = JSON.parse(data);
					res.status(200).send(data);
				})
			}
		}).on("error", (err) => {
			res.status(404).send("City not found");
		})
	};
});

app.get('/weather/coordinates', (req, res) => {
	if (!Object.keys(req.query).includes('lat')||!Object.keys(req.query).includes('lon')) {
		res.status(404).send("Not enough keys in query");
	} else {
		https.get(`https://api.openweathermap.org/data/2.5/weather?lon=${req.query.lon}&lat=${req.query.lat}&appid=34f71b8b89066cd53a354da222c6de0c&units=metric`, (response) => {
			if (response.statusCode === 404) {
				res.status(404).send("City not found");
			} else {
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});
				response.on('end', () => {
					data = JSON.parse(data);
					res.status(200).send(data);
				})
			}
		}).on("error", (err) => {
			res.status(404).send("City not found");
		})
	}
});

app.get('/favorites', (req, res) => {
	db.collection('cities').find().toArray(function(e, d) {
        res.status(200).send(d);
    });
})

app.delete('/favorites', (req, res) => {
	https.get(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=34f71b8b89066cd53a354da222c6de0c&units=metric`, (response) => {
		let data = '';
		response.on('data', (chunk) => {
			data += chunk;
		});
		response.on('end', () => {
			data = JSON.parse(data);
			db.collection('cities').remove({_id: data.id}, function(err, result) {
			if (err) {
				res.status(404).send("Error occured");
			} else {
				res.status(200).send("OK");
			}
			});			
		})
	})
})

app.post('/favorites', (req, res) => {
	https.get(`https://api.openweathermap.org/data/2.5/weather?q=${req.query.q}&appid=34f71b8b89066cd53a354da222c6de0c&units=metric`, (response) => {
		if (response.statusCode == 404) {
			res.status(404).send("City not found");
		} else {
			let data = '';
			response.on('data', (chunk) => {
				data += chunk;
			});
			response.on('end', () => {
				data = JSON.parse(data);
				db.collection('cities').find({_id: data.id}).toArray((e, d) => {
					if (d.length > 0) {
						res.status(409).send("Already exist");
					} else {
						db.collection('cities').insertOne({_id: data.id, name: data.name});
						res.status(200).send("OK");
					}
				});
			})
		}
	})
})

app.listen(port, () => console.log(`Weather app listening on port ${port}!`));