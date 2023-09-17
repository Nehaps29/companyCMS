INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Service Delivery");

INSERT INTO role (name, salary, department_id)
VALUES ("Sales consultant", 100, 1),
       ("Software Engineer", 200, 2),
       ("Application Engineer", 150, 3);       


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Neha","Sab", 2, NULL ),
       ("Maria", "Ahmed", 3, 1),
       ("Roxana","Fig", 1, 1); 


       
