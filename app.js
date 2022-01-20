const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  "mongodb+srv://pratt:dinesh@cluster0.dvnvk.mongodb.net/timetable",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const userSchema = new mongoose.Schema({
  Username: String,
  Password: String,
});

const teacherSchema = new mongoose.Schema({
  name: String,
  id: Number,
  username: String,
});

const ttSchema = new mongoose.Schema({
  timestamp: Number,
  id: Number,
  subCode: String,
  class: String,
});

const timestampSchema = new mongoose.Schema({
  day: Number,
  hours: Number,
  timestamp: Number,
});

const subjectSchema = new mongoose.Schema({
  subCode: String,
  credits: Number,
  subject: String,
  link: String,
});

const imagesSchema = new mongoose.Schema({
  subCode: String,
  image: String,
});

const User = new mongoose.model("user", userSchema);
const Teacher = new mongoose.model("teacher", teacherSchema);
const Timestamp = new mongoose.model("timestamp", timestampSchema);
const Tt = new mongoose.model("tt", ttSchema);
const Subject = new mongoose.model("subject", subjectSchema);
const Image = new mongoose.model("image", imagesSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/login", (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;

  User.findOne({ Username: Username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.Password === Password) {
          app.set("user", foundUser);
          res.redirect("/timetable");
        } else {
          res.redirect("/incorrectCredentials");
        }
      } else {
        res.send("Dunno you");
      }
    }
  });
});

app.get("/incorrectCredentials", (req, res) => {
  res.sendFile(__dirname + "/error.html");
});

app.get("/timetable", (req, res) => {
  const user = app.get("user");
  Teacher.findOne({ username: user.Username }, (err, foundTeacher) => {
    if (err) {
      console.log(err);
    } else {
      var d = new Date();
      var day = d.getDay();
      var hrs = d.getHours();
      Timestamp.findOne({ day: day, hours: hrs }, (err, foundTimestamp) => {
        if (err) {
          console.log(err);
        } else if (!foundTimestamp) {
          res.render("tt", {
            name: foundTeacher.name,
            course: "no class",
            section: null,
            image: "images/chill.svg",
            link: null,
          });
        } else {
          Tt.findOne(
            { timestamp: foundTimestamp.timestamp, id: foundTeacher.id },
            (err, foundClass) => {
              if (err) {
                console.log(err);
              } else if (!foundClass) {
                res.render("tt", {
                  name: foundTeacher.name,
                  course: "no class",
                  section: null,
                  image: "images/chill.svg",
                  link: null,
                });
              } else {
                Subject.findOne(
                  { subCode: foundClass.subCode },
                  (err, foundSubject) => {
                    if (err) {
                      console.log(err);
                    } else if (!foundSubject) {
                      res.render("tt", {
                        name: foundTeacher.name,
                        course: "no class",
                        section: null,
                        image: "images/chill.svg",
                        link: null,
                      });
                    } else {
                      Image.findOne(
                        { subCode: foundClass.subCode },
                        (err, foundImage) => {
                          if (err) {
                            console.log(err);
                          } else {
                            res.render("tt", {
                              name: foundTeacher.name,
                              course: foundSubject.subject,
                              section: foundClass.class,
                              image: foundImage.image,
                              link: foundSubject.link,
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });

  //   console.log(user.Username);
});
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Im on");
});
