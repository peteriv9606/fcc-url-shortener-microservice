# [URL Shortener Microservice](https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/url-shortener-microservice)
[Link to website](https://pivanov-fcc-url-shortener-msrv.herokuapp.com/)
Website might take some time to load, because I'm using heroku to host the app, and it might be "asleep".
Main idea of the website - provide a valid (e.g. https://www google.com/) URL, and if it's not already in the database, a number will be assigned to the POSTed URL. After that, you can access the short url by adding /api/shorturl/:id, where I'd is the number generated from the POST request.
