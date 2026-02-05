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
// let submissions = Array(questions.length).fill().map(() => ({
//     answer: "",
//     isMarked: false
// }));

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
    if (q._type === "SCQ") {
        instructionElement.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="fas fa-info-circle"></i>
                <strong class="text-uppercase small fw-bold">Single Correct Question</strong>
            </div>
            <p class="mb-2">Choose the best answer from the 4 options below.</p>
            <div class="d-flex gap-3 small">
                <span class="text-success"><i class="fas fa-plus-circle me-1"></i>+3 Marks</span>
                <span class="text-muted"><i class="fas fa-minus-circle me-1"></i>0 Negative</span>
            </div>
        `;
    } else if (q._type === "MCQ") {
        instructionElement.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="fas fa-info-circle"></i>
                <strong class="text-uppercase small fw-bold">Multiple Correct Question</strong>
            </div>
            <p class="mb-2">Select all correct options. Partial marks awarded if none are wrong.</p>
            <div class="d-flex gap-3 small">
                <span class="text-success"><i class="fas fa-plus-circle me-1"></i>+4 Marks</span>
                <span class="text-muted"><i class="fas fa-dot-circle me-1"></i>Partial Available</span>
            </div>
        `;
    }

    instructionElement.style.display = "block";

    // Show question
    ques.innerHTML = `
        <div class="question-text">
            ${q.question ? `<p>${q.question}</p>` : ""}
            ${q.questionImage ? `<img src="${q.questionImage}" alt="Question" class="img-fluid rounded shadow-sm">` : ""}
        </div>
    `;

    // Generate options HTML
    const inputType = q._type === "SCQ" ? "radio" : "checkbox";
    options.innerHTML = "";

    for (let i = 1; i <= 4; i++) {
        const optText = q[`option${i}`];
        const optImg = q[`image${i}`];
        if (!optText && !optImg) continue;

        const div = document.createElement("div");
        div.className = "option-item";
        div.id = `wrap-opt${i}`;

        div.innerHTML = `
            <input type="${inputType}" name="options" id="opt${i}">
            <label for="opt${i}">
                <div class="d-flex align-items-center gap-3">
                    ${optImg ? `<img src="${optImg}" alt="Option ${i}" style="max-height: 120px; border-radius: 8px;">` : ""}
                    ${optText ? `<span>${optText}</span>` : ""}
                </div>
            </label>
        `;

        div.addEventListener("click", (e) => {
            if (e.target.tagName !== "INPUT") {
                const input = div.querySelector("input");
                input.checked = inputType === "radio" ? true : !input.checked;
                input.dispatchEvent(new Event("change"));
            }
        });

        options.appendChild(div);
    }

    // Restore checked state and highlight
    if (sub.answer) {
        const answers = sub.answer.split('');
        answers.forEach(ans => {
            const optNum = ans.charCodeAt(0) - 64; // A->1, B->2, etc.
            const input = document.querySelector(`#opt${optNum}`);
            const wrap = document.querySelector(`#wrap-opt${optNum}`);
            if (input) {
                input.checked = true;
                if (wrap) wrap.classList.add("selected");
            }
        });
    }

    // Attach event listeners for highlight and data update
    document.querySelectorAll("input[name='options']").forEach(input => {
        input.addEventListener("change", () => {
            // Update highlights
            if (inputType === "radio") {
                document.querySelectorAll(".option-item").forEach(oi => oi.classList.remove("selected"));
            }
            const wrap = input.closest(".option-item");
            if (input.checked) wrap.classList.add("selected");
            else wrap.classList.remove("selected");

            updateData(input.id, index);
        });
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
        div.classList.remove("atm", "unatm", "mfr", "current");

        if (i === index) {
            div.classList.add("current");
        }

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
    document.querySelector(".marked-val").textContent = mfr;
}