const express = require('express');
const bodyParser = require('body-parser');

let students = require('./data');

const app = express();

app.set('views', './views/');
app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/students', function (request, response) {
  const page = parseInt(request.query.page) || 1;
  const limit = 5;
  let skip = (page - 1) * limit;
  let next = page + 1;
  let previous = page - 1;

  response.format({
    'text/html': function () {
      response.render('students/index', {
        students: students.slice(skip, limit + skip),
        next: next,
        previous: previous,
        page: page
      });
    },
    'application/json': function () {
      response.json({students: students});
    }
  });

  //response.json({students: students.slice(skip, limit + skip)});
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

  //response.json({student: student});
});

app.post('/students', function (request, response) {
  const newStudent = {
    name: request.body.name,
    sex: request.body.sex,
    score: request.body.score,
    age: request.body.age
  };

  students.push(newStudent);

  response.json({student: newStudent});
});

app.delete('/students/:name', function (request, response) {
  students = students.filter(student => student.name !== request.params.name);

  response.json({students: students});
});

app.put('/students/:name', function (request, response) {
  const student = students.find(student => student.name === request.params.name);
  let index = students.indexOf(student);
  const changedStudent = {
    name: request.body.name,
    sex: request.body.sex,
    score: request.body.score,
    age: request.body.age
  };

  students[index] = changedStudent;

  response.json({students: changedStudent});
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
