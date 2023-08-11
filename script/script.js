$(document).ready(() => {
  var uniqueId = 1; // Initialize a unique ID counter
  const dg = "danger",
    scs = "success",
    wr = "warning";
  let listCounter = parseInt(localStorage.getItem("listCounter")) || 3; // Initialize listCounter
  if (listCounter === 2) {
    listCounter += 1;
    saveListCounter();
  }
  const saveListCounter = () => {
    localStorage.setItem("listCounter", listCounter);
  };
  const saveDropdownItemsToLocalStorage = (dropdownItems) => {
    localStorage.setItem("dropdownItems", JSON.stringify(dropdownItems));
  };
  const loadDropdownItemsFromLocalStorage = () => {
    const dropdownItems = JSON.parse(localStorage.getItem("dropdownItems"));
    if (dropdownItems) {
      $(".dropdown-menu").html(dropdownItems.join(""));
    }
  };
    // Function to update position dropdown
    const updatePositionDropdown = (ulId) => {
        const liCount = $("#" + ulId).children("li").length;
        let positionOptions = "";
        for (let i = 0; i < liCount; i++) {
          positionOptions += `<li><a class="dropdown-item" href="#">${i+1}</a></li>`;
        }
        $("#position").html(positionOptions);
      };
        // When the dropdown button for position is clicked
  $(document).on("click", "#dropdownMenuButton2", function () {
    const taskItem = $("#editModal").data("taskItem");
    const parentUlId = taskItem.parent().attr("id");
    updatePositionDropdown(parentUlId);
  });
  $(document).on("click", "#position .dropdown-item", function () {
    const newPosition = $(this).text();
    const taskItem = $("#editModal").data("taskItem");
    const parentUlId = taskItem.parent().attr("id");
    const targetSortable = $("#" + parentUlId);
    const currentIndex = taskItem.index();
    const targetIndex = parseInt(newPosition)-1;
    if (currentIndex !== targetIndex) {
      if (targetIndex >= targetSortable.children("li").length) {
        targetSortable.append(taskItem);
      } else {
        // targetSortable.children("li").eq(targetIndex).before(taskItem);
           if (targetIndex < currentIndex) {
        targetSortable.children("li").eq(targetIndex).before(taskItem);
      } else {
        targetSortable.children("li").eq(targetIndex).after(taskItem);
      }
      }
      saveTasksToLocalStorage();
    }
  });
  const saveTasksToLocalStorage = () => {
    const allLists = {};
    const dropdownItems = [];
    $(".listContainer").each(function () {
      const listId = $(this).find("ul").attr("id");
      allLists[listId] = $(this).prop("outerHTML");
      const h3Text = $(this).find("h3").text();
      const dropdownItem = `<li><a class="dropdown-item" href="#" data-target="${listId}">${h3Text}</a></li>`;
      dropdownItems.push(dropdownItem);
    });
    localStorage.setItem("allLists", JSON.stringify(allLists));
    saveDropdownItemsToLocalStorage(dropdownItems);
  };
  const loadTasksFromLocalStorage = () => {
    const allLists = JSON.parse(localStorage.getItem("allLists"));
    if (allLists) {
      // Replace existing lists with loaded lists
      $(".lists").html(Object.values(allLists).join(""));
      // Reinitialize sortable for all lists
      $(".sortable")
        .sortable({
          connectWith: ".sortable",
          stop: (event, ui) => {
            saveTasksToLocalStorage();
            const taskName = ui.item.find("h4").text();
            showToast(`Task "${taskName}" is moved successfully`, scs);
          },
        })
        .disableSelection();
    }
    loadDropdownItemsFromLocalStorage();
  };
  loadTasksFromLocalStorage();
  // Hide .listName div by default
  $(".listName").show();
  $(document).off("click", ".dropdown-item");
  $(document).on("click", ".dropdown-item", function (event) {
    event.preventDefault();
    const targetSortable = $(this).data("target");
    const taskItem = $("#editModal").data("taskItem");
    const currentSortable = taskItem.parent().attr("id");
    if (targetSortable !== currentSortable) {
      // Only move the task to the targetSortable when Save is clicked
      taskItem.data("targetSortable", targetSortable);
    }
  });
  // Function to show a toaster$(".sortable
  const showToast = (message, dg) => {
    const toast = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-animation="true" data-bs-delay="3000">
                <div class="toast-body text-white bg-${dg}">
                    ${message}
                </div>
            </div>
        `;
    $("#toastContainer").html(toast); // Replace existing toasts with new toast
    $(".toast").toast("show");
  };
  const deleteTask = (taskItem) => {
    const modal = `
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Are you sure you want to delete this task?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    $("body").append(modal);
    $("#deleteModal").modal("show");
    //delete confirmation
    $("#confirmDelete").click(() => {
      taskItem.remove();
      $("#deleteModal").modal("hide");
      saveTasksToLocalStorage();
    });
    $("#deleteModal").on("hidden.bs.modal", () => {
      $(this).remove();
    });
  };
  let allow = true;
  let newListId = "";
  $("#addNewList").click(() => {
    if (allow == true) {
      // Append the new list container
      newListId = "sortable" + listCounter; // Set the newListId
      const newList = $(`<div class="listName listContainer">
                                <input type='text' class='form-control listNameInput' placeholder='Enter List Name'>
                            <ul id="${newListId}" class="dropfalse sortable"></ul>
                        </div>`);
      $(".lists").append(newList);
      listCounter += 1;
      saveTasksToLocalStorage();
      localStorage.setItem("listCounter", listCounter);
      loadDropdownItemsFromLocalStorage();
    }
    allow = false;
    saveTasksToLocalStorage();
  });
  $(document).on("focusout", ".listNameInput", function () {
    const newName = $(this).val().trim();
    if (newName !== "") {
      $(this).replaceWith(
        `<h3 class="bg-info text-center p-3 rounded-3">${newName}</h3>`
      );
      allow = true;
      $(".listName").show();
      $("#" + newListId).sortable({
        connectWith: ".sortable",
        stop: (event, ui) => {
          const taskName = ui.item.find("h4").text();
          showToast(`Task "${taskName}" is moved successfully`, scs);
        },
      });
      saveTasksToLocalStorage();
    }
    loadDropdownItemsFromLocalStorage();
  });
  $(document).on("click", ".listNameInput", function () {
    $(this).val("");
  });
  // Function to validate and add tasks
  $("#addToList").click(function () {
    var taskName = $("#taskName").val().trim();
    var taskDesc = $("#taskDesc").val().trim();
    // Validate input fields
    if (taskName === "" && taskDesc === "") {
      $("#taskName, #taskDesc").css("border-color", "red");
      $("#taskName").attr("placeholder", "Fill task name");
      $("#taskDesc").attr("placeholder", "Fill the description");
      $("#taskName,#taskDesc").addClass("red-placeholder");
      return;
    } else {
      $("#taskName").css("border-color", "");
      $("#taskName").attr("placeholder", "Task Name");
      $("#taskDesc").attr("placeholder", "Task Description");
      $("#taskName,#taskDesc").removeClass("red-placeholder");
    }
    if (taskDesc === "") {
      $("#taskDesc").css("border-color", "red");
      $("#taskDesc").attr("placeholder", "Fill the description");
      $("#taskDesc").addClass("red-placeholder");
      return;
    } else {
      $("#taskDesc").css("border-color", "");
      $("#taskDesc").attr("placeholder", "Task Description");
      $("#taskName,#taskDesc").removeClass("red-placeholder");
    }
    if (taskName === "") {
      $("#taskName").css("border-color", "red");
      $("#taskName").attr("placeholder", "Fill task name");
      $("#taskName").addClass("red-placeholder");
      return;
    } else {
      $("#taskName").css("border-color", "");
      $("#taskName").attr("placeholder", "Task Name");
      $("#taskName,#taskDesc").removeClass("red-placeholder");
    }
    // Create new task
    var newTask = $("<li class='ui-state-default'></li>");
    var taskContent = $("<div class='task-content'></div>");
    var taskId = uniqueId++; // Generate and assign a unique ID
    taskContent.append(
      "<div class='task-name'>" +
        "<span class='taskID fw-bold text-primary'>ID-" +
        taskId +
        " </span><h4 class='text-center'>" +
        taskName +
        "</h4>" +
        "<span class='delete-task'><i class='fas fa-trash'></i></span>" + // Trash icon
        "</div>"
    );
    taskContent.append(
      "<div class='task-desc text-center'>" + taskDesc + "</div>"
    );
    newTask.append(taskContent);
    // Append the new task item to the To-Do list
    $("#sortable1").append(newTask);
    // Clear input fields
    $("#taskName").val("");
    $("#taskDesc").val("");
    // Show success toast
    showToast("New task is added successfully", dg);
    $(".delete-task").click(function () {
      var taskItem = $(this).closest("li");
      deleteTask(taskItem);
      saveTasksToLocalStorage();
    });
    saveTasksToLocalStorage();
  });
  // Show .listName div on clicking #addNewList
  $("#addNewList").click(function () {
    $(".listName").show();
  });
  // Make the "To-Do" list sortable and droppable in the "In-Progress"
  $(".sortable")
    .sortable({
      connectWith: ".sortable",
      stop: (event, ui) => {
        saveTasksToLocalStorage();
        const taskName = ui.item.find("h4").text();
        showToast(`Task "${taskName}" is moved successfully`, scs);
      },
    })
    .disableSelection();
  $(document).on("click", ".sortable li", (event) => {
    const taskItem = $(event.currentTarget);
    editTask(taskItem);
  });
  const editTask = (taskItem) => {
    $("#deleteModal").modal("hide");
    const taskId = taskItem.find(".taskID").text();
    const taskName = taskItem.find("h4").text();
    const taskDesc = taskItem.find(".task-desc").text();
    $("#editModalLabel").text("Edit Task");
    $("#editTaskID").text(taskId);
    $("#editTaskName").val(taskName);
    $("#editTaskDesc").val(taskDesc);
    const parentList = taskItem
      .closest(".addTask, .inProgress, .listName")
      .attr("id"); // Get the ID of the parent list
    $("#editModal").data("taskItem", taskItem);
    $("#editModal").data("parentList", parentList); // Store the parent list ID
    $("#editModal").modal("show");
  };
  $(document).on("click", ".edit-task", function (event) {
    event.stopPropagation();
    const taskItem = $(this).closest("li");
    editTask(taskItem);
  });
  $("#saveEditTask").click(function () {
    const editedName = $("#editTaskName").val().trim();
    const editedDesc = $("#editTaskDesc").val().trim();
    const taskItem = $("#editModal").data("taskItem");
    const parentList = $("#editModal").data("parentList");
    const targetSortable = taskItem.data("targetSortable");
    if (targetSortable && targetSortable !== taskItem.parent().attr("id")) {
      $("#" + targetSortable).append(taskItem);
    }
    if (editedName !== "") {
      taskItem.find("h4").text(editedName);
    }
    taskItem.find(".task-desc").text(editedDesc);
    // Move the task to the appropriate list if needed
    if (parentList !== taskItem.parent().attr("id")) {
      $("#" + parentList).append(taskItem);
    }
    $("#editModal").modal("hide");
    saveTasksToLocalStorage();
  });
  $(document).on("click", ".delete-task", function (event) {
    event.stopPropagation(); // Stop event propagation
    var taskItem = $(this).closest("li");
    deleteTask(taskItem);
  });
});