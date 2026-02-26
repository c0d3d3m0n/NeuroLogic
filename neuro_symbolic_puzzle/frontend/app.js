// ===============================
// CONFIG
// ===============================
const BASE_URL = "https://neurologic.onrender.com";


// ===============================
// CLEAR INPUT
// ===============================
function clearInput() {
    document.getElementById("puzzleInput").value = "";
    document.getElementById("baselineOutput").textContent = "";
    document.getElementById("neuroOutput").textContent = "";
    document.getElementById("baselineValidation").innerHTML = "";
    document.getElementById("solutionCount").innerHTML = "";
    document.getElementById("seatVisualization").innerHTML = "";
}


// ===============================
// LOAD EXAMPLE (TYPEWRITER EFFECT)
// ===============================
function loadExample() {
    const example = `Alice, Bob, Carol, David, Emma, and Frank sit in 6 seats.
1. Alice is not at either end.
2. Bob sits immediately to the left of Carol.
3. David sits somewhere to the right of Alice.
4. Emma is not next to Bob.
5. Frank is not at seat 1 or seat 6.
6. Carol is not next to Frank.`;

    const textarea = document.getElementById("puzzleInput");
    textarea.value = "";

    let i = 0;
    const speed = 20;

    function typeWriter() {
        if (i < example.length) {
            textarea.value += example.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();
}


// ===============================
// SOLVE PUZZLE
// ===============================
async function solvePuzzle() {

    const puzzle = document.getElementById("puzzleInput").value;
    const runBtn = document.getElementById("runBtn");
    const loading = document.getElementById("loading");
    const loadingText = document.getElementById("loadingText");

    if (!puzzle.trim()) {
        alert("Please enter a puzzle description.");
        return;
    }

    runBtn.disabled = true;
    loading.classList.remove("hidden");

    // Reset UI
    clearInput();
    document.getElementById("puzzleInput").value = puzzle;

    const requestBody = { puzzle };

    try {

        // ===============================
        // BASELINE CALL
        // ===============================
        loadingText.innerText = "LLM is thinking intuitively...";

        const baselineRes = await fetch(`${BASE_URL}/baseline`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!baselineRes.ok) {
            throw new Error("Baseline API failed");
        }

        const baselineData = await baselineRes.json();

        document.getElementById("baselineOutput").textContent =
            baselineData.raw_response || "No response.";

        if (baselineData.validation?.valid) {
            document.getElementById("baselineValidation").innerHTML =
                `<div class='valid'>✅ All constraints satisfied.</div>`;
        } else {
            document.getElementById("baselineValidation").innerHTML =
                `<div class='invalid'>
                    ❌ Intuition failed: ${baselineData.validation?.violations?.length || 0} violations detected.
                    <br><small>${(baselineData.validation?.violations || []).join("<br>")}</small>
                </div>`;
        }


        // ===============================
        // NEURO-SYMBOLIC CALL
        // ===============================
        loadingText.innerText = "Formalizing logic & solving...";

        const neuroRes = await fetch(`${BASE_URL}/neurosymbolic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!neuroRes.ok) {
            throw new Error("NeuroSymbolic API failed");
        }

        const neuroData = await neuroRes.json();

        document.getElementById("neuroOutput").textContent =
            JSON.stringify(neuroData.structured_representation, null, 2);

        document.getElementById("solutionCount").innerHTML =
            `<div class='valid'>
                Total Valid Solutions Found: ${neuroData.total_solutions}
            </div>`;

        if (neuroData.solutions?.length > 0) {
            visualizeSeats(neuroData.solutions[0]);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Backend connection failed. Render may be waking up (cold start). Try again in 10–20 seconds.");
    } finally {
        loading.classList.add("hidden");
        runBtn.disabled = false;
    }
}


// ===============================
// VISUALIZE SEATS
// ===============================
function visualizeSeats(solution) {

    const container = document.getElementById("seatVisualization");
    container.innerHTML = "<h3>Proved Seating Arrangement</h3>";

    const seatRow = document.createElement("div");
    seatRow.className = "seat-row";

    const seatMap = {};
    Object.entries(solution).forEach(([person, seat]) => {
        seatMap[seat] = person;
    });

    const maxSeat = Math.max(...Object.values(solution));

    for (let i = 1; i <= maxSeat; i++) {

        const person = seatMap[i];
        const seatBox = document.createElement("div");
        seatBox.className = `seat-box ${person ? "occupied" : "empty"}`;

        const avatarColor = person ? stringToColor(person) : "#475569";

        const avatar = person
            ? `<div class="avatar" style="background:${avatarColor}">${person[0]}</div>`
            : `<div class="avatar empty">?</div>`;

        const name = person
            ? `<strong>${person}</strong>`
            : `<span class="empty-text">Empty</span>`;

        seatBox.innerHTML = `
            <span>Seat ${i}</span>
            ${avatar}
            ${name}
        `;

        seatRow.appendChild(seatBox);
    }

    container.appendChild(seatRow);
}


// ===============================
// STRING TO COLOR
// ===============================
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
}
