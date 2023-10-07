const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use('/public', express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "track"
});

connection.connect(function (error) {
    if (error) throw error;
    else console.log("Connected to database");
});

// Handle POST requests to authenticate users
app.post('/', function (req, res) {
    var user_name = req.body.email;
    var user_pass = req.body.user_pass;

    // Corrected query syntax
    connection.query('SELECT * FROM users WHERE email = ? AND user_pass = ?', [user_name, user_pass], function (errors, results, fields) {
        if (results.length > 0) {
            res.redirect("/dashboard");
        } else {
            res.send('<script>alert("Invalid email or password. Please try again."); window.location.href = "/";</script>');
            
        }
    });
});

// Function to generate a unique user ID in the format "userXXXX"
function generateUserID() {
    // You can query the database to get the latest user ID and increment it
    // For simplicity, let's assume the latest user ID is 1204 initially
    // In a real-world scenario, you should query the database to get the latest ID.
    let latestUserID = 1111;
  
    // Increment the latest user ID for the next user
    latestUserID++;
  
    // Format the user ID as "userXXXX" where XXXX is the incremented number
    const paddedNumber = latestUserID.toString().padStart(4, '0'); // Ensure it's 4 digits
    return 'user' + paddedNumber;
  }
  
  // Handle POST requests to submit profile data
    app.post('/submit-profile', function (req, res) {
      const {
          first_Name,
          last_Name,
          email,
          user_pass,
          dob,
          phone,
          gender,
          address,
          idType,
          proofNo
      } = req.body;
  
      // Generate a unique user ID
      const userID = generateUserID();
  
      // Insert the user's login, profile data, and the generated user ID into the database
      const insertQuery = 'INSERT INTO users (userId, first_Name, last_Name, email, user_pass, dob, phone, gender, address, idType, proofNo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      connection.query
        (
          insertQuery,
          [userID, first_Name, last_Name, email, user_pass, dob, phone, gender, address, idType, proofNo],
          function (error, results, fields) {
            if (error) {
                console.error("Error inserting user data: ", error);
                res.redirect("/"); // Redirect back to the profile form if there's an error
            } else {
                console.log("User data inserted successfully");
                res.redirect("dashboard");
            }
        }
    );
});




// Handle GET requests for the dashboard and profile form
app.get("/dashboard", function (req, res) {
    res.sendFile(__dirname + "/public/dashboard.html");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(5000);
