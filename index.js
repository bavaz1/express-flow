const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const app = express();
const hbs = require('hbs');
const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect();

const studentsTable = `CREATE TABLE IF NOT EXISTS students 
              (id int NOT NULL AUTO_INCREMENT, 
              name varchar(100),  
              sex boolean, 
              score int, 
              age int, 
              PRIMARY KEY(id));`;

connection.query(studentsTable, function (err, rows, fields) {
  if (err) throw err;
  console.log('Students table created.');
});

let students = require('./data');

app.set('views', './views/');
app.set('view engine', 'hbs');
app.engine('hbs', require('hbs').__express);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.get('/students', function (request, response) {
  const list = `SELECT * FROM students;`;

  connection.query(list, function (err, rows, fields) {
    if (err) throw err;
    if (rows && rows.length > 0) {
      let students = rows;
      response.format({
        'text/html': function () {
          response.render('students/index', {
            students: students
          });
        },
        'application/json': function () {
          response.json({students: students});
        }
      });
    } else {
      response.format({
        'text/html': function () {
          response.render('students/index', {
            students: []
          });
        },
        'application/json': function () {
          response.json({students: []});
        }
      });
    }
  });
});

app.get('/students/create', function (request, response) {
  response.render('students/create');
});

app.get('/students/:id/update', function (request, response) {
  const studentDatas = `SELECT * FROM students WHERE id='${request.params.id}';`;
  connection.query(studentDatas, function (err, rows, fields) {
    if (err) throw err;
    if (rows && rows.length > 0) {
      const student = rows[0];

      response.format({
        'text/html': function () {
          response.render('students/update', {student: student});
        },
        'application/json': function () {
          response.json({student: student});
        }
      });
    } else {
      response.format({
        'text/html': function () {
          response.render('students/update', {student: []});
        },
        'application/json': function () {
          response.json({student: []});
        }
      });
    }
  });
});

app.get('/students/:id', function (request, response) {
  const studentsName = `SELECT * FROM students WHERE id='${request.params.id}';`;
  connection.query(studentsName, function (err, rows, fields) {
    if (err) throw err;
    if (rows && rows.length > 0) {
      const student = rows[0];

      response.format({
        'text/html': function () {
          response.render('students/show', {student: student});
        },
        'application/json': function () {
          response.json({student: student});
        }
      });
    } else {
      response.format({
        'text/html': function () {
          response.render('students/show', {student: []});
        },
        'application/json': function () {
          response.json({student: []});
        }
      });
    }
  });
});

app.post('/students', function (request, response) {
  const createStudent = `INSERT INTO students (name, sex, score, age) VALUES 
            ('${request.body.name}', '${request.body.sex}',
            '${request.body.score}', '${request.body.age}');`;

  connection.query(createStudent, function (err, rows, fields) {
    if (err) throw err;
    response.format({
      'text/html': function () {
        response.redirect('/students');
      },
      'application/json': function () {
        response.redirect('/students');
      }
    });
  });
});

app.delete('/students/:id', function (request, response) {
  const deleteStudent = `DELETE FROM students WHERE id='${request.params.id}';`;

  connection.query(deleteStudent, function (err, rows, fields) {
    if (err) throw err;
    response.format({
      'text/html': function () {
        response.redirect('/students');
      },
      'application/json': function () {
        response.redirect('/students');
      }
    });
  });
});

app.put('/students/:id', function (request, response) {
  const changedStudent = `UPDATE students SET name='${request.body.name}', sex='${request.body.sex}',
       score='${request.body.score}', age='${request.body.age}' WHERE id='${request.params.id}';`;

  connection.query(changedStudent, function (err, rows, fields) {
    const studentID = request.params.id;
    if (err) throw err;
    response.format({
      'text/html': function () {
        response.redirect('/students/' + studentID);
      },
      'application/json': function () {
        response.json('/students/' + studentID);
      }
    });
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
