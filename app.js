const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());
let dbConnectionObj = null;

const initializeDBandServer = async () => {
  try {
    dbConnectionObj = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("at db connection", dbConnectionObj);
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000/ ");
    });
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};

initializeDBandServer();
//API-1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  console.log(status, typeof status);
  console.log(priority, typeof priority);
  console.log(search_q, typeof search_q);

  let getQuery = null;

  if (status !== undefined && priority !== undefined) {
    getQuery = `SELECT * FROM todo 
            WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority =  '${priority}'  ;`;
  } else if (priority !== undefined) {
    getQuery = `SELECT * FROM todo WHERE 
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
  } else if (status !== undefined) {
    getQuery = `SELECT * FROM todo WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}';`;
  } else if (search_q !== undefined) {
    getQuery = `SELECT * FROM todo 
            WHERE todo LIKE '%${search_q}%';`;
  }
  const todoList = await dbConnectionObj.all(getQuery);
  response.send(todoList);
});
//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoByIdQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await dbConnectionObj.get(getTodoByIdQuery);
  response.send(todo);
});
//API-3
app.post("/todos/", async (request, response) => {
  const reqBody = request.body;
  const { id, todo, priority, status } = reqBody;
  const postTodoQuery = `INSERT INTO 
            todo(id,todo,priority,status) 
            VALUES(${id},'${todo}','${priority}','${status}');`;
  await dbConnectionObj.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API-4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let updateKey = null;
  let updateValue = null;
  let responseMsg = "";
  if (status !== undefined) {
    updateKey = "status";
    updateValue = status;
    responseMsg = "Status Updated";
  }
  if (priority !== undefined) {
    updateKey = "priority";
    updateValue = priority;
    responseMsg = "Priority Updated";
  }
  if (todo !== undefined) {
    updateKey = "todo";
    updateValue = todo;
    responseMsg = "Todo Updated";
  }
  console.log(updateKey, updateValue);
  const updateQuery = `UPDATE  todo 
                SET '${updateKey}' = '${updateValue}'
                WHERE id = ${todoId};`;
  await dbConnectionObj.run(updateQuery);
  response.send(responseMsg);
});

//API-5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await dbConnectionObj.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
