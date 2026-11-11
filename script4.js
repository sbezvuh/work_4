// Описуємо характеристики кожної сутності
const schemas = {
    students: {
        title: "Додавання учня",
        bodyId: "studentsBody",
        fields: [
            { name: "Прізвище", type: "text" },
            { name: "Ім'я", type: "text" },
            { name: "Дата народження", type: "date" },
            { name: "Клас", type: "text" },
            { name: "Email", type: "email" },
            {
                name: "Середній бал",
                type: "number",
                min: 0,
                max: 12,
                step: 0.1
            }
        ]
    },

    teachers: {
        title: "Додавання вчителя",
        bodyId: "teachersBody",
        fields: [
            { name: "Прізвище", type: "text" },
            { name: "Ім'я", type: "text" },
            { name: "Предмет", type: "text" },
            { name: "Категорія", type: "text" },
            {
                name: "Стаж роботи (років)",
                type: "number",
                min: 0,
                step: 1
            },
            { name: "Email", type: "email" }
        ]
    },

    subjects: {
        title: "Додавання предмета",
        bodyId: "subjectsBody",
        fields: [
            { name: "Назва предмета", type: "text" },
            {
                name: "Годин на тиждень",
                type: "number",
                min: 1,
                step: 1
            },
            {
                name: "Кабінет",
                type: "number",
                min: 1,
                step: 1
            },
            { name: "Клас", type: "text" },
            {
                name: "ID учителя",
                type: "number",
                min: 1,
                step: 1
            },
            { name: "Тип оцінювання", type: "text" }
        ]
    }
};


// Отримуємо всі вкладки та секції
const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".table-section");


// Перемикання вкладок
tabs.forEach(function(tab) {
    tab.addEventListener("click", function() {

        tabs.forEach(function(item) {
            item.classList.remove("active");
        });

        sections.forEach(function(section) {
            section.classList.remove("active");
        });

        tab.classList.add("active");

        const tableId = tab.dataset.table;
        const selectedSection = document.getElementById(tableId);

        if (selectedSection) {
            selectedSection.classList.add("active");
        }
    });
});


// Створюємо форми для всіх трьох сутностей
sections.forEach(function(section) {

    const addButton = section.querySelector(".add-button");
    const formContainer = section.querySelector(".form-container");

    // Визначаємо тип сутності за ID секції
    const schema = schemas[section.id];

    // Обробляємо натискання кнопки додавання
    addButton.addEventListener("click", function() {

        // Якщо форма вже відкрита, повторно її не створюємо
        if (formContainer.querySelector("form")) {
            return;
        }

        // Створюємо форму
        const form = document.createElement("form");

        const title = document.createElement("h3");
        title.textContent = schema.title;

        form.appendChild(title);

        // Створюємо поля форми
        schema.fields.forEach(function(field, index) {

            const label = document.createElement("label");
            label.textContent = field.name;

            let input;

            if (section.id === "subjects" && field.name === "ID учителя") {
                input = document.createElement("select");
                input.name = "field" + index;
                input.required = true;
                // Позначаємо список учителів
                input.dataset.teacherSelect = "true";

                fillTeacherSelect(input);

            } else {
                input = document.createElement("input");
                input.type = field.type;
                input.name = "field" + index;
                input.required = true;
            }

            // Додаткові обмеження для числових полів
            if (field.min !== undefined) {
                input.min = field.min;
            }

            if (field.max !== undefined) {
                input.max = field.max;
            }

            if (field.step !== undefined) {
                input.step = field.step;
            }

            label.appendChild(input);
            form.appendChild(label);
        });

        // Кнопка збереження
        const saveButton = document.createElement("button");
        saveButton.type = "submit";
        saveButton.textContent = "Зберегти";

        form.appendChild(saveButton);

        // Кнопка скасування
        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Скасувати";

        form.appendChild(cancelButton);

        // Додаємо форму на сторінку
        formContainer.appendChild(form);

        // Обробляємо скасування
        cancelButton.addEventListener("click", function() {
            form.remove();
        });

        // Обробляємо відправлення форми
        form.addEventListener("submit", function(event) {

            // Забороняємо перезавантаження сторінки
            event.preventDefault();

            // Перевіряємо правильність заповнення
            if (!form.reportValidity()) {
                return;
            }

            // Отримуємо всі введені значення
            const values = schema.fields.map(function(field, index) {
                return form.elements["field" + index].value.trim();
            });

            // Додатково перевіряємо, чи немає порожніх значень
            if (values.some(function(value) {
                return value === "";
            })) {
                alert("Заповніть усі поля!");
                return;
            }

            // Перевіряємо ID учителя для нового предмета
            if (section.id === "subjects") {
                if (!teacherExists(values[4])) {
                    alert("Учителя з таким ID не існує!");
                    return;
                }
            }

            // Знаходимо таблицю, до якої додаємо запис
            const tbody = document.getElementById(schema.bodyId);

            // Створюємо новий рядок
            const row = document.createElement("tr");

            // Автоматично визначаємо наступний ID
            const idCell = document.createElement("td");
            idCell.textContent = getNextId(tbody);

            row.appendChild(idCell);

            // Додаємо введені дані до рядка
            values.forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            // Створюємо комірку для кнопки видалення
            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-button";
            deleteButton.textContent = "✖";

            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);

            // Додаємо рядок у таблицю
            tbody.appendChild(row);
            saveData();

            // Оновлюємо відкриті списки вчителів
            refreshTeacherSelects();

            // Очищаємо та закриваємо форму
            form.reset();
            form.remove();

            alert("Запис успішно додано!");
        });
    });
});


// Функція визначення наступного ID
function getNextId(tbody) {

    const rows = tbody.querySelectorAll("tr");

    let maxId = 0;

    rows.forEach(function(row) {

        const id = Number(row.cells[0].textContent);

        if (Number.isInteger(id) && id > maxId) {
            maxId = id;
        }
    });

    return maxId + 1;
}


// Функція перевірки існування вчителя
function teacherExists(teacherId) {
    const teachersBody = document.getElementById("teachersBody");

    const teachers = teachersBody.querySelectorAll("tr");

    return Array.from(teachers).some(function(row) {

        return Number(row.cells[0].textContent) === Number(teacherId);

    });
}


// Функція перевірки можливості видалення вчителя
function canDeleteTeacher(teacherId) {

    const subjectsBody = document.getElementById("subjectsBody");

    const subjects = subjectsBody.querySelectorAll("tr");

    // Перевіряємо всі навчальні предмети
    for (const subject of subjects) {

        // ID учителя знаходиться у шостій комірці
        const subjectTeacherId = subject.cells[5].textContent;

        if (Number(subjectTeacherId) === Number(teacherId)) {
            return false;
        }
    }

    return true;
}


// Функція видалення записів
function deleteRecord(section, row) {

    const recordId = row.cells[0].textContent;

    // Перевіряємо, чи видаляємо вчителя
    if (section.id === "teachers") {

        if (!canDeleteTeacher(recordId)) {

            alert(
                "Неможливо видалити вчителя!\n" +
                "Він використовується в таблиці навчальних предметів."
            );

            return;
        }
    }

    // Підтвердження видалення
    const confirmed = confirm(
        "Ви дійсно хочете видалити запис ID " + recordId + "?"
    );

    if (!confirmed) {
        return;
    }

    // Видаляємо рядок таблиці
    row.remove();
    saveData();

    // Оновлюємо відкриті списки вчителів
    refreshTeacherSelects();

    alert("Запис успішно видалено!");
}


// Функція створення кнопок видалення
function initializeDeleteButtons() {

    sections.forEach(function(section) {

        const tbody = section.querySelector("tbody");

        // Перевіряємо всі рядки таблиці
        const rows = tbody.querySelectorAll("tr");

        rows.forEach(function(row) {

            // Якщо комірки для дій ще немає, створюємо її
            if (row.cells.length === schemas[section.id].fields.length + 1) {

                const actionCell = document.createElement("td");
                row.appendChild(actionCell);
            }

            // Знаходимо комірку дій
            const actionCell = row.cells[row.cells.length - 1];

            // Якщо кнопки ще немає, створюємо її
            if (!actionCell.querySelector(".delete-button")) {

                const button = document.createElement("button");

                button.type = "button";
                button.className = "delete-button";
                button.textContent = "✖";

                actionCell.appendChild(button);
            }
        });

        // Один обробник для всіх кнопок цієї таблиці
        tbody.addEventListener("click", function(event) {

            if (event.target.classList.contains("delete-button")) {

                const row = event.target.closest("tr");

                deleteRecord(section, row);
            }
        });
    });
}


// Функція редагування комірки
function editCell(cell, section) {

    // Визначаємо індекс комірки
    const cellIndex = cell.cellIndex;

    // Отримуємо опис потрібної сутності
    const schema = schemas[section.id];

    // ID та остання комірка (Дії) не редагуються
    if (cellIndex === 0 || cellIndex === cell.parentElement.cells.length - 1) {
        return;
    }

    // Отримуємо опис поля
    const field = schema.fields[cellIndex - 1];

    // Зберігаємо початкове значення
    const oldValue = cell.textContent;

    // Створюємо поле введення
    let input;
    if (section.id === "subjects" && field.name === "ID учителя") {
        input = document.createElement("select");
        // Позначаємо список учителів
        input.dataset.teacherSelect = "true";

        fillTeacherSelect(input);
        input.value = oldValue;
    } else {
        input = document.createElement("input");
        input.type = field.type;
        input.value = oldValue;
    }
    input.required = true;

    // Встановлюємо обмеження для числових полів
    if (field.min !== undefined) {
        input.min = field.min;
    }

    if (field.max !== undefined) {
        input.max = field.max;
    }

    if (field.step !== undefined) {
        input.step = field.step;
    }

    // Очищаємо комірку та додаємо поле введення
    cell.textContent = "";
    cell.appendChild(input);

    // Фокусуємо поле
    input.focus();

    // Функція збереження
    function saveValue() {

        // Перевіряємо, чи поле ще існує
        if (!input.isConnected) {
            return;
        }

        const newValue = input.value.trim();

        // Перевіряємо правильність введення
        if (!input.reportValidity()) {
            input.focus();
            return;
        }

        // Не дозволяємо залишати поле порожнім
        if (newValue === "") {
            alert("Значення не може бути порожнім!");
            input.focus();
            return;
        }

        // Перевіряємо зв'язок предмета з учителем
        if (section.id === "subjects" && field.name === "ID учителя") {

            const teachersBody = document.getElementById("teachersBody");

            const teachers = teachersBody.querySelectorAll("tr");

            const teacherExists = Array.from(teachers).some(function(row) {
                return Number(row.cells[0].textContent) === Number(newValue);
            });

            if (!teacherExists) {
                alert("Учителя з таким ID не існує!");
                input.focus();
                return;
            }
        }

        // Зберігаємо нове значення
        cell.textContent = newValue;
        saveData();

        // Оновлюємо відкриті списки вчителів
        refreshTeacherSelects();
    }

    // Зберігаємо зміни при натисканні Enter
    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            saveValue();
        }

        // Скасовуємо редагування при Escape
        if (event.key === "Escape") {
            cell.textContent = oldValue;
        }
    });

    // Зберігаємо зміни при втраті фокуса
    input.addEventListener("blur", saveValue);
}


// Функція обробки натискання на комірку
function initializeEditing() {

    sections.forEach(function(section) {

        const tbody = section.querySelector("tbody");

        tbody.addEventListener("click", function(event) {

            // Знаходимо комірку, по якій натиснув користувач
            const cell = event.target.closest("td");

            // Перевіряємо, чи натискання було всередині комірки
            if (!cell || !tbody.contains(cell)) {
                return;
            }

            // Не редагуємо комірку з кнопкою видалення
            if (cell.cellIndex === cell.parentElement.cells.length - 1) {
                return;
            }

            // Не запускаємо повторне редагування
            if (cell.querySelector("input, select")) {
                return;
            }

            // Запускаємо редагування
            editCell(cell, section);
        });
    });
}


// Функція збереження таблиць
function saveData() {

    const data = {};

    document.querySelectorAll(".table-section").forEach(section => {

        const tbody = section.querySelector("tbody");

        data[section.id] = Array.from(tbody.rows).map(row => {

            return Array.from(row.cells)
                .slice(0, -1)
                .map(cell => {

                    // Перевіряємо, чи комірка зараз редагується
                    const editor = cell.querySelector("input, select");

                    // Якщо редагується — беремо значення з поля
                    if (editor) {
                        return editor.value.trim();
                    }

                    // Якщо не редагується — беремо текст комірки
                    return cell.textContent.trim();
                });
        });
    });

    localStorage.setItem("schoolData", JSON.stringify(data));
}


// Функція завантаження інформації з localStorage
function loadData() {
    const savedData = localStorage.getItem("schoolData");

    if (!savedData) {
        return;
    }

    let data;
    try {
        data = JSON.parse(savedData);
    } catch (error) {
        console.error("Помилка завантаження даних:", error);
        alert("Не вдалося завантажити збережені дані!");
        return;
    }

    Object.keys(data).forEach(tableName => {
        const tbody = document.getElementById(tableName + "Body");

        if (!tbody) {
            return;
        }

        tbody.innerHTML = "";

        data[tableName].forEach(rowData => {
            const row = document.createElement("tr");

            rowData.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "✖";
            deleteButton.classList.add("delete-button");
            deleteButton.type = "button";

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });
    });
}


// Автоматична синхронізація між вкладками браузера
window.addEventListener("storage", function(event) {

    if (event.key === "schoolData") {

        // Завантажуємо актуальні дані
        loadData();

        // Оновлюємо відкриті списки вчителів
        refreshTeacherSelects();
    }
});


function fillTeacherSelect(select) {
    const teachersBody = document.getElementById("teachersBody");

    select.innerHTML = '<option value="">Оберіть учителя</option>';

    Array.from(teachersBody.rows).forEach(row => {
        const id = row.cells[0].textContent;
        const surname = row.cells[1].textContent;
        const name = row.cells[2].textContent;

        const option = document.createElement("option");

        option.value = id;
        option.textContent = surname + " " + name;

        select.appendChild(option);
    });
}


// Оновлення всіх відкритих списків учителів
function refreshTeacherSelects() {

    // Знаходимо всі списки учителів
    const selects = document.querySelectorAll(
        'select[data-teacher-select="true"]'
    );

    selects.forEach(function(select) {

        // Запам'ятовуємо вибраний ID учителя
        const selectedValue = select.value;

        // Оновлюємо список
        fillTeacherSelect(select);

        // Перевіряємо, чи існує попередньо вибраний учитель
        const teacherExists = Array.from(select.options).some(function(option) {
            return option.value === selectedValue;
        });

        // Відновлюємо вибір, якщо такий учитель існує
        if (teacherExists) {
            select.value = selectedValue;
        }
    });
}


// Відновлення даних
loadData()


// Ініціалізація програми
initializeDeleteButtons();
initializeEditing();