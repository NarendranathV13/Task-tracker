$(document).ready(() => {
    var uniqueId = 1; // Initialize a unique ID counter
    const dg = "danger", scs = "success", wr = "warning";
    const saveTasksToLocalStorage = () => {
        const tasks = {
            todo: $("#sortable1").html(),
            inProgress: $("#sortable2").html(),
            listName: $("#sortable3").html()
        };
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };
    const loadTasksFromLocalStorage = () => {
        const tasks = JSON.parse(localStorage.getItem("tasks"));
        if (tasks) {
            $("#sortable1").html(tasks.todo);
            $("#sortable2").html(tasks.inProgress);
            $("#sortable3").html(tasks.listName);
        }
    };
    loadTasksFromLocalStorage();
    // Hide .listName div by default
    $(".listName").hide();
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
    
    // Function to show a toaster
    const showToast = (message, dg) => {
        const toast = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-animation="true" data-bs-delay="3000">
                <div class="toast-body text-white bg-${dg}">
                    ${message}
                </div>
            </div>
        `;
        $("#toastContainer").html(toast); // Replace existing toasts with new toast
        $(".toast").toast('show');
    }
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
        $("#deleteModal").modal('show');
        //delete confirmation
        $("#confirmDelete").click(() => {
            taskItem.remove();
            $("#deleteModal").modal('hide');
            saveTasksToLocalStorage();
        });
        $("#deleteModal").on("hidden.bs.modal", () => {
            $(this).remove();
        });
    }
    const updateListName = () => {
        const updatedListName = $("#listNameInput").val().trim();
        if (updatedListName !== "") {
            $("#listNames").text(updatedListName);
        }
        $("#listNameInput").replaceWith(`<h3 class='bg-info text-center p-3 rounded-3' id='listNames'>${updatedListName}</h3>`);
        enableSortable3();
    };
    const enableSortable3 = () => {
        $("#sortable3").sortable({
            connectWith: "#sortable1, #sortable2"
        }).disableSelection();
    };
    $("#addNewList").click(() => {
        $(".listName").show();
        enableSortable3(); // Enable sorting for sortable3 when a new list is added
    });
    $("#addNewList").click(() => {
        if ($("#listNameInput").length === 0) {
            $(".listName").show();
            const currentListName = $("#listNames").text().trim();
            $("#listNames").replaceWith(`<input type='text' class='form-control' id='listNameInput' placeholder='Enter List Name' value='${currentListName}'>`);
            $("#listNameInput").focus();
        }
        $(this).prop("disabled", true);
    });
    $(document).on("focusout", "#listNameInput", () => {
        updateListName();
        // Enable the "Add New List" button after updating the list name
        $("#addNewList").prop("disabled", false);
    });;
    $(document).on("click", "#listNameInput", () => {
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
            "<span class='taskID fw-bold text-primary'>ID-" + taskId + " </span><h4 class='text-center'>" + taskName + "</h4>" +
            "<span class='delete-task'><i class='fas fa-trash'></i></span>" + // Trash icon
            "</div>"
        );
       taskContent.append("<div class='task-desc text-center'>" + taskDesc + "</div>");
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
    $("#sortable1").sortable({
        connectWith: "#sortable2, #sortable3",
        stop: (event, ui) => {
            saveTasksToLocalStorage();
            if (ui.item.parent().attr("id") === "sortable2") {
                const taskName = ui.item.find("h4").text();
                showToast(`Task "${taskName}" is moved to In-Progress`, wr);
            }
        }
    }).disableSelection();
    $("#sortable2").sortable({
        connectWith: "#sortable1, #sortable3",
        stop: (event, ui) => {
            saveTasksToLocalStorage();
            if (ui.item.parent().attr("id") === "sortable1") {
                const taskName = ui.item.find("h4").text();
                showToast(`Again "${taskName}" is moved back to To-do`, scs);
            }
        }
    }).disableSelection();
    $("#sortable3").sortable({
        connectWith: "#sortable1, #sortable2",
        stop: () => saveTasksToLocalStorage() // Save tasks after sorting
    }).disableSelection();
    $(document).on("click", "#sortable1 li, #sortable2 li, #sortable3 li", (event) => {
        const taskItem = $(event.currentTarget);
        editTask(taskItem);
    });
    const editTask = (taskItem) => {
        $("#deleteModal").modal('hide');
        const taskId = taskItem.find(".taskID").text();
        const taskName = taskItem.find("h4").text();
        const taskDesc = taskItem.find(".task-desc").text();
        $("#editModalLabel").text("Edit Task");
        $("#editTaskID").text(taskId);
        $("#editTaskName").val(taskName);
        $("#editTaskDesc").val(taskDesc);
        const parentList = taskItem.closest(".addTask, .inProgress, .listName").attr("id"); // Get the ID of the parent list
        $("#editModal").data("taskItem", taskItem);
        $("#editModal").data("parentList", parentList); // Store the parent list ID
        $("#editModal").modal('show');
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
        $("#editModal").modal('hide');
        saveTasksToLocalStorage();
    });
    $(document).on("click", ".delete-task", function (event) {
        event.stopPropagation(); // Stop event propagation
        var taskItem = $(this).closest("li");
        deleteTask(taskItem);
    });
});