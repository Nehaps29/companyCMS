require('dotenv').config();
const inquirer = require("inquirer");
const password = process.env.PASSWORD;
const cfonts = require('cfonts');

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
// Adding style
  cfonts.say('Employee Tracker', {
	font: 'simple',              
	align: 'left',              
	colors: ['green'],         
	background: 'transparent',  
	letterSpacing: 1,           
	lineHeight: 1,              
	space: true,                
	maxLength: '0',             
	gradient: false,            
	independentGradient: false, 
	transitionGradient: false,  
	env: 'node'                
});


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
                "Update employee managers",
                "View employees by manager",
                "View employees by department",
                "Delete departments, roles, and employees",
                "View the total utilized budget of a department",
                "Exit",
            ],
        })
        .then((answer) => {
            //adding conditions and function calls as per selection
            console.log(answer);
            if (answer.action == 'View all departments'){
              const sql = `SELECT id as \`Department ID\`, name as \`Department Name\` FROM department order by id` ;
              connection.query(sql, (err, res)=> {
                if (err) throw err; 
                else console.table(res);
                questions();
              })
            }
            if (answer.action == 'View all roles'){
              const sql = `SELECT role.name AS \`Job Title\`, role.id AS \`Role ID\`, department.name AS Department, role.salary AS Salary  FROM role join department on role.department_id = department.id`;
              connection.query(sql, (err, res)=> {
                if (err) throw err; 
                else console.table(res);
                questions();
              })
            } 

            if (answer.action == 'View all employees'){
              const sql = `SELECT employee.id AS \`Employee ID\`, employee.first_name AS \`First Name\`, employee.last_name AS \`Last Name\`, role.name AS \`Job Title\`, department.name AS \`Department\`, role.salary AS SALARY,  e2.first_name AS MANAGER FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS e2 ON employee.manager_id = e2.id`;
              connection.query(sql, (err, res)=> {
                if (err) throw err; 
                else console.table(res);
                questions();
              })
            } 

            if (answer.action == 'add a department'){
              inquirer
                   .prompt({
                       type: "input",
                       name: "name",
                       message: "Enter the name of the new department:",
                    })
                    .then((answer) => {
                      console.log(answer.name);
                      const sql = `INSERT INTO department (name) VALUES ("${answer.name}")`;
                      connection.query(sql, (err, res) => {
                          if (err) throw err;
                          console.log(`Added department ${answer.name} to the database!`);
                          // ask questions again
                          questions();
                          console.log(answer.name);
                      });
                  });
            } 


            if (answer.action == 'add a role'){
              addRole();
            } 

            if (answer.action == 'add an employee'){
              addEmployee();
            } 
           
            if (answer.action == 'update an employee role'){
              updateEmployeeRole();
            } 

            if (answer.action == 'Update employee managers'){
                updateEmployeeManager();
            }
            
            if (answer.action == 'View employees by manager'){
                viewEmployeeByManager();
            }
            
            if (answer.action == 'View employees by department'){
                viewEmployeeByDepartment();
            }

            if (answer.action == 'Delete departments, roles, and employees'){
                deleteRow();
            }

            if (answer.action == 'View the total utilized budget of a department'){
                viewTotalUtilizedBudgetOfDepartment();
            }

      });
}

//function to add role
function addRole() {
  const query = "SELECT * FROM department";
  connection.query(query, (err, res) => {
      if (err) throw err;
      inquirer
          .prompt([
              {
                  type: "input",
                  name: "title",
                  message: "Enter the title of the new role:",
              },
              {
                  type: "input",
                  name: "salary",
                  message: "Enter the salary of the new role:",
              },
              {
                  type: "list",
                  name: "department",
                  message: "Select the department for the new role:",
                  choices: res.map(
                      (department) => department.name
                  ),
              },
          ])
          .then((answers) => {
              const department = res.find(
                  (department) => department.name === answers.department
              );
              const query = "INSERT INTO role SET ?";
              connection.query(
                  query,
                  {
                      name: answers.title,
                      salary: answers.salary,
                      department_id: department.id,
                  },
                  (err, res) => {
                      if (err) throw err;
                      console.log(
                          `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
                      );
                      // ask questions again
                      questions();
                  }
              );
          });
  });
}

// Function to add an employee
function addEmployee() {
 
  connection.query("SELECT id, name FROM role", (error, results) => {
      if (error) {
          console.error(error);
          return;
      }

      const roles = results.map(({ id, name }) => ({
          name: name,
          value: id,
      }));

      
      connection.query(
          'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
          (error, results) => {
              if (error) {
                  console.error(error);
                  return;
              }

              const managers = results.map(({ id, name }) => ({
                  name,
                  value: id,
              }));

              // Prompt the user for employee information
              inquirer
                  .prompt([
                      {
                          type: "input",
                          name: "firstName",
                          message: "Enter the employee's first name:",
                      },
                      {
                          type: "input",
                          name: "lastName",
                          message: "Enter the employee's last name:",
                      },
                      {
                          type: "list",
                          name: "roleId",
                          message: "Select the employee role:",
                          choices: roles,
                      },
                      {
                          type: "list",
                          name: "managerId",
                          message: "Select the employee manager:",
                          choices: [
                              { name: "None", value: null },
                              ...managers,
                          ],
                      },
                  ])
                  .then((answers) => {
                      // Insert the employee 
                      const sql =
                          "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                      const values = [
                          answers.firstName,
                          answers.lastName,
                          answers.roleId,
                          answers.managerId,
                      ];
                      connection.query(sql, values, (error) => {
                          if (error) {
                              console.error(error);
                              return;
                          }

                          console.log("Employee added successfully");
                          questions();
                      });
                  })
                  .catch((error) => {
                      console.error(error);
                  });
          }
      );
  });
}


// function to update an employee role
function updateEmployeeRole() {
  const queryEmployees =
      "SELECT employee.id, employee.first_name, employee.last_name, role.name FROM employee LEFT JOIN role ON employee.role_id = role.id";
  const queryRoles = "SELECT * FROM role";
  connection.query(queryEmployees, (err, resEmployees) => {
      if (err) throw err;
      connection.query(queryRoles, (err, resRoles) => {
          if (err) throw err;
          inquirer
              .prompt([
                  {
                      type: "list",
                      name: "employee",
                      message: "Select the employee to update:",
                      choices: resEmployees.map(
                          (employee) =>
                              `${employee.first_name} ${employee.last_name}`
                      ),
                  },
                  {
                      type: "list",
                      name: "role",
                      message: "Select the new role:",
                      choices: resRoles.map((role) => role.name),
                  },
              ])
              .then((answers) => {
                  const employee = resEmployees.find(
                      (employee) =>
                          `${employee.first_name} ${employee.last_name}` ===
                          answers.employee
                  );
                  const role = resRoles.find(
                      (role) => role.name === answers.role
                  );
                  const query =
                      "UPDATE employee SET role_id = ? WHERE id = ?";
                  connection.query(
                      query,
                      [role.id, employee.id],
                      (err, res) => {
                          if (err) throw err;
                          console.log(
                              `Updated ${employee.first_name} ${employee.last_name}'s role to ${role.name} in the database!`
                          );
                          // ask questions again
                          questions();
                      }
                  );
              });
      });
  });
}

// function to update manager
function updateEmployeeManager() {
   
    const queryEmployees = "SELECT * FROM employee";

    
        connection.query(queryEmployees, (err, resEmployees) => {
            if (err) throw err;
            inquirer
                .prompt([
                   
                    {
                        type: "list",
                        name: "employee",
                        message: "Select the employee to add a manager to:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Select the employee's manager:",
                        choices: resEmployees.map(
                            (employee) =>
                                `${employee.first_name} ${employee.last_name}`
                        ),
                    },
                ])
                .then((answers) => {
                    
                    const employee = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.employee
                    );
                    const manager = resEmployees.find(
                        (employee) =>
                            `${employee.first_name} ${employee.last_name}` ===
                            answers.manager
                    );
                    const query =
                        "UPDATE employee SET manager_id = ? WHERE id = ?";
                    connection.query(
                        query,
                        [manager.id, employee.id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(
                                `Added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name}`
                            );
                            // ask question again
                            questions();
                        }
                    );
                });
        });
    
}


// Function to View Employee By Manager
function  viewEmployeeByManager() {
    const query = `
      SELECT 
        e.id, 
        e.first_name, 
        e.last_name,  
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM 
        employee e
        LEFT JOIN employee m ON e.manager_id = m.id
        INNER JOIN role r ON e.role_id = r.id
        
      ORDER BY 
        manager_name, 
        e.last_name, 
        e.first_name
    `;

    connection.query(query, (err, res) => {
        console.log(res);
        if (err) throw err;

        // group employees by manager
        const employeesByManager = res.reduce((acc, cur) => {
            const managerName = cur.manager_name;
            console.log(managerName)
            if (acc[managerName]) {
                acc[managerName].push(cur);
            } else {
                acc[managerName] = [cur];
            }
            return acc;
        }, {});
         console.log(employeesByManager);
        // display employees by manager
        console.log("Employees by manager:");
        for (const managerName in employeesByManager) {
            //console.log(typeof managerName)
            //const test = managerName === "null" ? managerName : "No Manager"
            // displayManager = managerName??`No Manager`
            //console.log(displayManager, test);
            console.log(`\n${managerName === "null" ? `No Manager`: managerName}:`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                console.table(
                    `  ${employee.first_name} ${employee.last_name}`
                );
            });
        }

        // ask question again
        questions();
    });
}


// Function to view Employee by Department
function viewEmployeeByDepartment() {
    const query =
        "SELECT department.name, employee.first_name, employee.last_name FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department.name ASC";

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("\nEmployees by department:");
        console.table(res);
        // ask question again
        questions();
    });
}


// Function to delete Department, Role, Employee
function deleteRow() {
    inquirer
        .prompt({
            type: "list",
            name: "data",
            message: "What would you like to delete?",
            choices: ["Employee", "Role", "Department"],
        })
        .then((answer) => {
            if (answer.data === "Employee")   {
                deleteEmployee();
            }
            if (answer.data === "Role") {
                deleteRole();
            }
            if (answer.data === "Department") {
                deleteDepartment();
            }
        });
}

// Function to delete Employees
function deleteEmployee() {
    const query = "SELECT * FROM employee";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const employeeList = res.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "Select the employee you want to delete:",
                choices: employeeList,
            })
            .then((answer) => {
                const query = "DELETE FROM employee WHERE id = ?";
                connection.query(query, [answer.id], (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Deleted employee with ID ${answer.id} from the database!`
                        
                    );
                    // ask question again
                    questions();
                });
            });
    });
}


// Function to delete role
function deleteRole() {
    const query = "SELECT * FROM role";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const roleList = res.map((role) => ({
            name: `${role.name}`,
            value: role.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "Select the role you want to delete:",
                choices: roleList,
            })
            .then((answer) => {
                const query = "DELETE FROM role WHERE id = ?";
                connection.query(query, [answer.id], (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Deleted role with ID ${answer.id} from the database!`
                        
                    );
                    // ask questions again
                    questions();
                });
            });
    });
}

// Function to delete department
function deleteDepartment() {
    const query = "SELECT * FROM department";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmetList = res.map((department) => ({
            name: `${department.name}`,
            value: department.id,
        }));
        inquirer
            .prompt({
                type: "list",
                name: "id",
                message: "Select the department you want to delete:",
                choices: departmetList,
            })
            .then((answer) => {
                const query = "DELETE FROM department WHERE id = ?";
                connection.query(query, [answer.id], (err, res) => {
                    if (err) throw err;
                    console.log(
                        `Deleted department with ID ${answer.id} from the database!`
                        
                    );
                    // ask questions again
                    questions();
                });
            });
    });
}

// Function to view Total Utilized Budget of Department
function viewTotalUtilizedBudgetOfDepartment() {
    console.log("inside the function");
    const query = "SELECT * FROM department";
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departmentChoices = res.map((department) => ({
            name: department.name,
            value: department.id,
        }));

        // prompt the user to select a department
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message:
                    "Which department do you want to calculate the total salary for?",
                choices: departmentChoices,
            })
            .then((answer) => {
                // calculate the total salary for the selected department
                const query =
                    `SELECT 
                    department.name AS \`Department Name\`,
                    SUM(role.salary) AS \`Total_Salary\`
                  FROM 
                    department
                    INNER JOIN role ON department.id = role.department_id
                    INNER JOIN employee ON role.id = employee.role_id
                  WHERE 
                    department.id = ?
                  GROUP BY 
                    department.id;`;
                connection.query(query, [answer.departmentId], (err, res) => {
                    if (err) throw err;
                    const totalSalary = res[0].Total_Salary;
                    console.log(
                        `The total salary for employees in this department is $${totalSalary}`
                    );
                    // ask questions again
                    questions();
                });
            });
    });
}

// close the connection when the application exits
process.on("exit", () => {
    connection.end();
});