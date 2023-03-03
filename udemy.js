class Kanban {
  static getTasks(columnId) {
    const data = read().find((column) => {
      return column.columnId == columnId;
    });

    return data.tasks;
  }

  static insertTask(columnId, content) {
    const data = read();
    const column = data.find((column) => {
      return column.columnId == columnId;
    });
    const task = {
      taskId: Math.floor(Math.random() * 100000),
      content: content,
    };

    column.tasks.push(task);
    console.log(data);
    save(data);

    return task;
  }

  static updateTask(taskId, updatedInformation) {
    const data = read();

    function findColumnTask() {
      for (const column of data) {
        const task = column.tasks.find((item) => {
          return item.taskId == taskId;
        });

        if (task) {
          return [task, column];
        }
      }
    }
    const [task, currentColumn] = findColumnTask();

    const targetColumn = data.find((column) => {
      return column.columnId == updatedInformation.columnId;
    });

    task.content = updatedInformation.content;
    currentColumn.tasks.splice(currentColumn.tasks.indexOf(task), 1);
    targetColumn.tasks.push(task);

    save(data);
  }

  static deleteTask(taskId) {
    const data = read();

    for (const column of data) {
      const task = column.tasks.find((item) => {
        return item.taskId == taskId;
      });

      if (task) {
        column.tasks.splice(column.tasks.indexOf(task), 1);
      }
    }

    save(data);
  }

  static getAllTasks() {
    const data = read();
    columnCount();
    return [data[0].tasks, data[1].tasks, data[2].tasks];
  }
}

function read() {
  const data = localStorage.getItem("data");

  if (!data) {
    return [
      { columnId: 0, tasks: [] },
      { columnId: 1, tasks: [] },
      { columnId: 2, tasks: [] },
    ];
  }

  return JSON.parse(data);
}

function save(data) {
  localStorage.setItem("data", JSON.stringify(data));
  columnCount();
}

function columnCount() {
  const data = read();

  const todo = document.querySelector("span.todo");
  todo.textContent = data[0].tasks.length;

  const pending = document.querySelector("span.pending");
  pending.textContent = data[1].tasks.length;

  const completed = document.querySelector("span.completed");
  completed.textContent = data[2].tasks.length;
}

// console.log(Kanban.getAllTasks());
// console.log(Kanban.getTasks(1));

// console.log(Kanban.getTasks(1));
// console.log(Kanban.insertTask(0, "Record Kanban Lectures"));
// console.log(Kanban.getTasks(1));

// console.log(Kanban.getAllTasks());
// Kanban.deleteTask(11822);
// console.log(Kanban.getAllTasks());

// console.log(Kanban.getAllTasks());
// Kanban.updateTask(97522, {
//     content: "Record JavaScript Preview"
// });
// console.log(Kanban.getAllTasks());

const todo = document.querySelector(".cards.todo");
const pending = document.querySelector(".cards.pending");
const completed = document.querySelector(".cards.completed");
const taskbox = [todo, pending, completed];

function addTaskCard(task, index) {
  const element = document.createElement("form");
  element.className = "card";
  element.draggable = true;
  element.dataset.id = task.taskId;
  element.innerHTML = `
        <input value="${task.content}" type="text" name="task" autocomplete="off" disabled="disabled">
        <div>
            <span class="task-id">#${task.taskId}</span>
            <span>
                <button class="bi bi-pencil edit" data-id="${task.taskId}"></button>
                <button class="bi bi-check-lg update hide" data-id="${task.taskId}" data-column="${index}"></button>
                <button class="bi bi-trash3 delete" data-id="${task.taskId}"></button>
            </span>
        </div>
    `;
  taskbox[index].appendChild(element);
}

Kanban.getAllTasks().forEach((tasks, index) => {
  tasks.forEach((task) => {
    addTaskCard(task, index);
  });
});

const addForm = document.querySelectorAll(".add");
addForm.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.task.value) {
      const task = Kanban.insertTask(
        form.submit.dataset.id,
        form.task.value.trim()
      );
      addTaskCard(task, form.submit.dataset.id);
      form.reset();
    }
  });
});

taskbox.forEach((column) => {
  column.addEventListener("click", (event) => {
    event.preventDefault();

    const formInput =
      event.target.parentElement.parentElement.previousElementSibling;

    if (event.target.classList.contains("edit")) {
      formInput.removeAttribute("disabled");
      event.target.classList.add("hide");
      event.target.nextElementSibling.classList.remove("hide");
    }

    if (event.target.classList.contains("update")) {
      formInput.setAttribute("disabled", "disabled");
      event.target.classList.add("hide");
      event.target.previousElementSibling.classList.remove("hide");

      const taskId = event.target.dataset.id;
      const columnId = event.target.dataset.column;
      const content = formInput.value;
      Kanban.updateTask(taskId, {
        columnId: columnId,
        content: content,
      });
    }

    if (event.target.classList.contains("delete")) {
      formInput.parentElement.remove();
      Kanban.deleteTask(event.target.dataset.id);
    }
  });

  column.addEventListener("dragstart", (event) => {
    if (event.target.classList.contains("card")) {
      event.target.classList.add("dragging");
    }
  });

  column.addEventListener("dragover", (event) => {
    const card = document.querySelector(".dragging");
    column.appendChild(card);
  });

  column.addEventListener("dragend", (event) => {
    if (event.target.classList.contains("card")) {
      event.target.classList.remove("dragging");

      const taskId = event.target.dataset.id;
      const columnId = event.target.parentElement.dataset.id;
      const content = event.target.task.value;
      Kanban.updateTask(taskId, {
        columnId: columnId,
        content: content,
      });
    }
  });
});
