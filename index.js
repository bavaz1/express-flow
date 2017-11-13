const Model = require('./model');
const Student = new Model();
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const app = express();
const hbs = require('hbs');

Student.connect();
Student.init();

app.set('views', './views/');
app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.get('/students/count', function (request, response) {
  Student.count(function (error, students) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.json({count: students});
    }
  });
});

app.get('/students', function (request, response) {
  Student.findAll(function (error, students) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.render('students/index', {students: students});
    }
  });
});

app.get('/students/create', function (request, response) {
  response.render('students/create');
});

app.get('/students/:id/update', function (request, response) {
  Student.findOne({id: request.params.id}, function (error, student) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.render('students/update', {student: student});
    }
  });
});

app.get('/students/:id', function (request, response) {
  Student.findOne({id: request.params.id}, function (error, student) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.render('students/show', {student: student});
    }
  });
});

app.post('/students', function (request, response) {
  Student.create(request.body, function (error, student) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.redirect('/students');
    }
  });
});

app.delete('/students/:id', function (request, response) {
  Student.delete(request.params.id, function (error, student) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.redirect('/students');
    }
  });
});

app.put('/students/:id', function (request, response) {
  Student.update(request.body, request.params.id, function (error, student) {
    if (error) {
      response.render('errors/500', {error: error});
    } else {
      response.redirect('/students/' + request.params.id);
    }
  });
});

app.listen(3000);
