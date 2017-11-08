const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

let students = require('./data');

const app = express();
const hbs = require('hbs');

app.set('views', './views/');
app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.get('/students', function (request, response) {
  const page = parseInt(request.query.page) || 1;
  const limit = 5;
  let skip = (page - 1) * limit;
  let next = page + 1;
  let previous = page - 1;
  let possibleNext;
  let possiblePrev;
  let pages = [];

  for (let i = 0; i < students.length / limit; i++) {
    pages.push(i + 1);
  }

  if (students.length / 5 > page) {
    possibleNext = true;
  } else {
    possibleNext = false;
  }

  if (page > 1) {
    possiblePrev = true;
  } else {
    possiblePrev = false;
  }

  hbs.registerHelper('currentPage', (pages, page, options) => {
    if (pages === page) {
      return options.fn(page);
    }

    return options.inverse(this);
  });

  response.format({
    'text/html': function () {
      response.render('students/index', {
        students: students.slice(skip, limit + skip),
        next: next,
        previous: previous,
        page: page,
        possibleNext: possibleNext,
        possiblePrev: possiblePrev,
        pages: pages
      });
    },
    'application/json': function () {
      response.json({students: students});
    }
  });
});

app.get('/students/create', function (request, response) {
  response.render('students/create');
});

app.get('/students/:name/update', function (request, response) {
  const student = students.find(student => student.name === request.params.name);
  response.render('students/update', {student: student});
});

app.get('/students/:name', function (request, response) {
  const student = students.find(student => student.name === request.params.name);

  response.format({
    'text/html': function () {
      response.render('students/show', {student: student});
    },
    'application/json': function () {
      response.json({student: student});
    }
  });
});

app.post('/students', function (request, response) {
  const newStudent = {
    name: request.body.name,
    sex: request.body.sex,
    score: request.body.score,
    age: request.body.age
  };

  students.push(newStudent);

  response.format({
    'text/html': function () {
      response.redirect('/students');
    },
    'application/json': function () {
      response.json({student: newStudent});
    }
  });
});

app.delete('/students/:name', function (request, response) {
  students = students.filter(student => student.name !== request.params.name);

  response.format({
    'text/html': function () {
      response.redirect('/students/');
    },
    'application/json': function () {
      response.json({students: students});
    }
  });
});

app.put('/students/:name', function (request, response) {
  const changedStudent = {
    name: request.body.name,
    sex: request.body.sex,
    score: request.body.score,
    age: request.body.age
  };

  let indexOfUpdateStudent = students.indexOf(students.find(student => student.name === request.params.name));
  students.splice(indexOfUpdateStudent, 1);
  students.splice(indexOfUpdateStudent, 0, changedStudent);

  response.format({
    'text/html': function () {
      response.redirect('/students/' + changedStudent.name);
    },
    'application/json': function () {
      response.json({students: changedStudent});
    }
  });
});

app.get('/scores', function (request, response) {
  let min = request.query.min;
  let max = request.query.max;
  const scores = students
    .filter(student => student.sex === request.query.sex)
    .filter(student => student.score >= min && student.score <= max);

  response.json({scores: scores});
});

app.listen(3000);
