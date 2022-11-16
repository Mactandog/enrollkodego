const mysql = require("mysql2");
const encrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
});

// Register
exports.addAccount = (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  db.query(
    "SELECT email FROM user WHERE email = ?",
    email,
    async function (err, result) {
      if (err) {
        console.log("Error" + err);
      } else {
        if (
          !email ||
          !password ||
          !first_name ||
          !password ||
          !confirm_password
        ) {
          return res.render("register", {
            errorMessage: "All fields are required!",
          });
        } else if (result.length > 0) {
          console.log("Email already exists!");
          return res.render("register", {
            errorMessage: `Email ${email} already exists!`,
          });
        } else if (confirm_password != password) {
          console.log("Password doesn't match!");
          return res.render("register", {
            errorMessage: `Password doesn't match!`,
          });
        } else {
          const hashPassword = await encrypt.hash(password, 8);
          console.log(hashPassword);
          db.query(
            "INSERT INTO user SET ?",
            {
              first_name: first_name,
              last_name: last_name,
              email: email,
              password: hashPassword,
            },

            function (err, result) {
              if (err) {
                console.log("Error" + err);
              } else {
                console.log("Account created");
                return res.render("register", {
                  message: `Welcome, ${first_name} ${last_name}! Account has been created successfully.`,
                });
              }
            }
          );
        }
      }
    }
  );
};

// Login
exports.loginAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("index", {
        errorMessage: "Email and password is required!",
      });
    } else {
      db.query(
        "SELECT * FROM user WHERE email = ?",
        email,
        async function (err, result) {
          if (!result) {
            console.log("Email is incorrect!");
            return res.render("index", {
              errorMessage: "Email not found!",
            });
          } else {
            if (!(await encrypt.compare(password, result[0].password))) {
              console.log("Password is incorrect!");
              return res.render("index", {
                errorMessage: "Password is incorrect!",
              });
            } else {
              const id = result[0].user_id;
              const token = jwt.sign(id, process.env.JWT_SECRET);
              const cookieOption = {
                expires:
                  new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES) *
                  24 *
                  60 *
                  1000,
                HttpOnly: true,
              };
              res.cookie("cookie_access_token", token, cookieOption);
              console.log(token, cookieOption);
              db.query(
                "SELECT s.stud_id, s.first_name, s.last_name, s.email, c.course_title FROM student s INNER JOIN course c ON s.course_id = c.course_id ",
                function (err, results) {
                  if (err) {
                    console.log("Error fetching data" + err);
                    return res.render("studentsList", {
                      errorMessage: "Error fetching data",
                    });
                  } else if (!results) {
                    return res.render("studentsList", {
                      errorMessage: "No data availbale",
                    });
                  } else {
                    res.render("studentsList", {
                      title: "List of Students",
                      data: results,
                    });
                  }
                }
              );
            }
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
};

// Add Student
exports.addStudent = (req, res) => {
  const { first_name, last_name, email, course_id } = req.body;

  db.query(
    "SELECT email FROM student WHERE email = ?",
    email,
    async function (err, result) {
      if (err) {
        console.log("Error" + err);
      } else {
        if (!first_name || !last_name || !email || !course_id) {
          return res.render("addStudent", {
            errorMessage: "All fields are required!",
          });
        } else if (result.length > 0) {
          console.log("Email already exists!");
          return res.render("addStudent", {
            errorMessage: `Email ${email} already exists!`,
          });
        } else {
          db.query(
            "INSERT INTO student SET ?",
            {
              first_name: first_name,
              last_name: last_name,
              email: email,
              course_id: course_id,
            },
            function (err, result) {
              if (err) {
                console.log("Error" + err);
              } else {
                console.log("Student added successfully!");
                db.query(
                  "SELECT s.stud_id, s.first_name, s.last_name, s.email, c.course_title FROM student s INNER JOIN course c ON s.course_id = c.course_id ORDER BY s.stud_id",
                  function (err, results) {
                    if (err) {
                      console.log("Error fetching data" + err);
                      return res.render("studentsList", {
                        errorMessage: "Error fetching data",
                      });
                    } else if (!results) {
                      return res.render("studentsList", {
                        errorMessage: "No data availbale",
                      });
                    } else {
                      res.render("studentsList", {
                        title: "List of Students",
                        data: results,
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

// Populate Student's Data
exports.updateStudentForm = (req, res) => {
  const email = req.params.email;
  db.query(
    `SELECT s.first_name, s.last_name, s.email, s.course_id, c.course_title FROM student s INNER JOIN course c ON s.course_id = c.course_id WHERE email = "${email}"`,
    (err, result) => {
      if (err) throw err;
      else {
        res.render("updateStudentForm", {
          title: "Update Student",
          student: result[0],
        });
        console.log(result[0]);
      }
    }
  );
};

exports.updateStudent = (req, res) => {
  const { first_name, last_name, email, course_id } = req.body;
  db.query(
    `UPDATE student SET first_name = "${first_name}", last_name = "${last_name}", email ="${email}", course_id ="${course_id}" WHERE email = "${email}"`,
    (err) => {
      if (err) throw err;
      else {
        console.log("Student updated successfully!");
        db.query(
          "SELECT s.stud_id, s.first_name, s.last_name, s.email, c.course_title FROM student s INNER JOIN course c ON s.course_id = c.course_id",
          function (err, results) {
            if (err) {
              console.log("Error fetching data" + err);
              return res.render("studentsList", {
                errorMessage: "Error fetching data",
              });
            } else if (!results) {
              return res.render("studentsList", {
                errorMessage: "No data availbale",
              });
            } else {
              res.render("studentsList", {
                title: "List of Students",
                data: results,
              });
            }
          }
        );
      }
    }
  );
};

exports.deleteStudent = (req, res) => {
  const email = req.params.email;
  db.query(`DELETE FROM student WHERE email ="${email}"`, (err) => {
    if (err) throw err;
    else {
      db.query(
        "SELECT s.stud_id, s.first_name, s.last_name, s.email, c.course_title FROM student s INNER JOIN course c ON s.course_id = c.course_id",
        function (err, results) {
          if (err) {
            console.log("Error fetching data" + err);
            return res.render("studentsList", {
              errorMessage: "Error fetching data",
            });
          } else if (!results) {
            return res.render("studentsList", {
              errorMessage: "No data availbale",
            });
          } else {
            console.log("Student deleted successfully!");
            res.render("studentsList", {
              title: "List of Students",
              data: results,
            });
          }
        }
      );
    }
  });
};

// LOGOUT ACCOUNT
exports.logoutAccount = (req, res) => {
  res.clearCookie("cookie_access_token");
  res.render("index");
};
