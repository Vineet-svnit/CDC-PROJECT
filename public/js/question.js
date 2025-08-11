// Initialize variables
let index = 0;

// DOM elements
const ques = document.querySelector(".ques");
const options = document.querySelector(".options");
const pallete = document.querySelector("#pallete");
const instruction = document.querySelector("#instruction");
const mark = document.querySelector("#mark");
const prev = document.querySelector("#prev");
const clear = document.querySelector("#clear");
const next = document.querySelector("#next");
const instructionElement = document.getElementById("instruction");

// Initialize submissions array properly
let submissions = Array(questions.length).fill().map(() => ({
    answer: "",
    isMarked: false
}));

// Create navigation palette
for (let i = 1; i <= questions.length; i++) {
    const div = document.createElement("div");
    div.classList.add("navdiv", "unatm");
    div.textContent = i;
    div.addEventListener("click", () => {
        index = i - 1;
        display(index);
    });
    pallete.appendChild(div);
}
const navdivs = document.querySelectorAll(".navdiv");

// Initial display
display(index);

// Button event listeners
prev.addEventListener("click", () => {
    if (index > 0) {
        index--;
        display(index);
    }
});

next.addEventListener("click", () => {
    if (index < questions.length - 1) {
        index++;
        display(index);
    }
});

clear.addEventListener("click", () => {
    submissions[index].answer = "";
    submissions[index].isMarked = false;
    count_atm_unatm_mark();
    display(index); // Refresh current question
});

mark.addEventListener("click", () => {
    submissions[index].isMarked = !submissions[index].isMarked; // Toggle mark
    count_atm_unatm_mark();
});

// Display question function
function display(index) {
    document.querySelector("#quesNum").textContent = index + 1;
    const q = questions[index];
    const sub = submissions[index];

    //Show instructions
    instructionElement.innerHTML = "";
    let instructionHTML = `<h3><u>Instructions</u></h3><ul>`;
    if (q._type === "SCQ") {
        instructionElement.innerHTML += `
                        <li>
                            <strong>SCQ (Single Correct Question)</strong>: 
                            <em>Below is a single correct question with <b>4</b> options — select only one.</em><br>
                            <span style="color:green;">+3 marks</span> for correct, 
                            <span style="color:gray;">0 marks</span> for wrong or unattempted.
                        </li>
                    `;
    }
    else if (q._type === "MCQ") {
        instructionElement.innerHTML += `
                        <li>
                            <strong>MCQ (Multiple Correct Question)</strong>: 
                            <em>Below is a multiple correct question with <b>4</b> options — select all that apply.</em><br>
                            <span style="color:green;">+4 marks</span> for correct, 
                            <span style="color:red;">-2 marks</span> for wrong.
                            <span style="color:gray;">0 marks</span> for unattempted.
                        </li>
                    `;
    }
    instructionElement.innerHTML += `</ul>`;
    // Show question
    ques.innerHTML = `
        ${q.questionImage ? `<img src="${q.questionImage}" alt="Question">` : ""}
        ${q.question ? `<p>${q.question}</p>` : ""}
    `;

    // Generate options HTML
    const inputType = q._type === "SCQ" ? "radio" : "checkbox";
    options.innerHTML = `
        <input type="${inputType}" name="options" id="opt1">
        <label for="opt1">
            ${q.image1 ? `<img src="${q.image1}" alt="Option 1">` : ""}
            ${q.option1 ? `<p>${q.option1}</p>` : ""}
        </label><br>

        <input type="${inputType}" name="options" id="opt2">
        <label for="opt2">
            ${q.image2 ? `<img src="${q.image2}" alt="Option 2">` : ""}
            ${q.option2 ? `<p>${q.option2}</p>` : ""}
        </label><br>

        <input type="${inputType}" name="options" id="opt3">
        <label for="opt3">
            ${q.image3 ? `<img src="${q.image3}" alt="Option 3">` : ""}
            ${q.option3 ? `<p>${q.option3}</p>` : ""}
        </label><br>

        <input type="${inputType}" name="options" id="opt4">
        <label for="opt4">
            ${q.image4 ? `<img src="${q.image4}" alt="Option 4">` : ""}
            ${q.option4 ? `<p>${q.option4}</p>` : ""}
        </label><br>
    `;

    // Restore checked state from submissions
    if (sub.answer) {
        const answers = sub.answer.split('');
        answers.forEach(ans => {
            const optNum = ans.charCodeAt(0) - 64; // A->1, B->2, etc.
            const input = document.querySelector(`#opt${optNum}`);
            if (input) input.checked = true;
        });
    }

    // Attach event listeners to new inputs
    document.querySelectorAll("input[name='options']").forEach(input => {
        input.addEventListener("change", () => updateData(input.id, index));
    });
}

// Update submission data
function updateData(optId, index) {
    const q = questions[index];
    const sub = submissions[index];

    if (q._type === "SCQ") {
        // Single correct answer (radio buttons)
        const answerLetter = String.fromCharCode(64 + parseInt(optId.replace("opt", "")));
        sub.answer = answerLetter;
    } else {
        // Multiple correct answers (checkboxes)
        const currentAnswers = sub.answer || "";
        const answerLetter = String.fromCharCode(64 + parseInt(optId.replace("opt", "")));

        if (currentAnswers.includes(answerLetter)) {
            // Remove if already selected
            sub.answer = currentAnswers.replace(answerLetter, "");
        } else {
            // Add if not selected
            sub.answer = currentAnswers + answerLetter;
        }
    }

    count_atm_unatm_mark();
}

// Update stats counters
function count_atm_unatm_mark() {
    let at = 0, unat = 0, mfr = 0;

    navdivs.forEach((div, i) => {
        // Reset all classes first
        div.classList.remove("atm", "unatm", "mfr");

        if (submissions[i].isMarked) {
            mfr++;
            div.classList.add("mfr");
        } 
        if (submissions[i].answer) {
            at++;
            div.classList.add("atm");
        } else {
            unat++;
            div.classList.add("unatm");
        }
    });

    // Update counters
    document.querySelector(".at").textContent = at;
    document.querySelector(".unat").textContent = unat;
    document.querySelector(".mark").textContent = mfr;
}