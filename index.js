require('dotenv').config();
const inquirer = require("inquirer");
const password = process.env.PASSWORD;

// Import and require mysql2
const mysql = require('mysql2');

// Connect to database
const connection = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password here
      password: `${password}`,
      database: 'company_db'
    },
  );

  //check the connection to database
  connection.connect((err)=> {
    if (err) {
      console.error('Error connecting to the database: ',err);
      return;
    }
    
    console.log("Connected to company_db");
    questions();
    
  })

function questions() {
  inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "add a department",
                "add a role",
                "add an employee",
                "update an employee role",
                "Exit",
            ],
        })
        .then((answer) => {
            console.log(answer);
            if (answer.action == 'View all departments'){
              const sql = `SELECT * FROM department`;
              connection.query(sql, (err, res)=> {
                if (err) throw err; 
                else console.log(res);
                questions();
              })
            }
        });
}

