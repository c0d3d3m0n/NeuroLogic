// ===============================
// Production API Base URL
// ===============================
const API_BASE = "https://neurologic.onrender.com";

// ===============================
// Main Solve Function
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

    const requestBody = { puzzle };

    // UI Reset
    runBtn.disabled = true;
    loading.classList.remove("hidden");

    document.getElementById("baselineOutput").textContent = "";
    document.getElementById("neuroOutput").textContent = "";
    document.getElementById("baselineValidation").innerHTML = "";
    document.getElementById("solutionCount").innerHTML = "";
    document.getElementById("seatVisualization").innerHTML = "";

    try {
        // ===============================
        // 🧠 Baseline (LLM only)
        // ===============================
        loadingText.innerText = "LLM is thinking intuitively...";

        const baselineRes = await fetch(`${API_BASE}/baseline`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!baselineRes.ok) {
            throw new Error("Baseline endpoint failed.");
        }

        const baselineData = await baselineRes.json();

        document.getElementById("baselineOutput").textContent =
            baselineData.raw_response || "No response.";

        if (baselineData.validation?.valid) {
            document.getElementById("baselineValidation").innerHTML =
                "<div class='valid'>✅ All constraints satisfied by intuition.</div>";
        } else {
            document.getElementById("baselineValidation").innerHTML =
                `<div class='invalid'>
                    ❌ Intuition failed: 
                    ${baselineData.validation?.violations?.length || 0} violations detected.
                    <br><small>
                    ${(baselineData.validation?.violations || []).join("<br>")}
                    </small>
                </div>`;
        }

        // ===============================
        // ⚙ Neuro-Symbolic
        // ===============================
        loadingText.innerText = "Formalizing logic & solving...";

        const neuroRes = await fetch(`${API_BASE}/neurosymbolic`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!neuroRes.ok) {
            throw new Error("Neuro-symbolic endpoint failed.");
        }

        const neuroData = await neuroRes.json();

        document.getElementById("neuroOutput").textContent =
            JSON.stringify(neuroData.structured_representation, null, 2);

        document.getElementById("solutionCount").innerHTML =
            `<div class='valid'>
                Total Valid Solutions Found: ${neuroData.total_solutions || 0}
            </div>`;

        // ===============================
        // 🎨 Visualize First Solution
        // ===============================
        if (neuroData.solutions && neuroData.solutions.length > 0) {
            visualizeSeats(neuroData.solutions[0]);
        } else {
            document.getElementById("seatVisualization").innerHTML =
                "<div class='invalid'>No valid solution found.</div>";
        }

    } catch (error) {
        console.error("Error:", error);
        alert(
            "Backend connection failed.\n\n" +
            "If this is the first request, Render may be waking up.\n" +
            "Wait 20–30 seconds and try again."
        );
    } finally {
        loading.classList.add("hidden");
        runBtn.disabled = false;
    }
}

// ===============================
// Seat Visualization
// ===============================
function visualizeSeats(solution) {
    const container = document.getElementById("seatVisualization");
    container.innerHTML = "<h3>Proved Seating Arrangement</h3>";

    const seatRow = document.createElement("div");
    seatRow.className = "seat-row";

    const sortedSeats = Object.entries(solution)
        .sort(([, a], [, b]) => a - b);

    sortedSeats.forEach(([person, seatNum]) => {
        const seatBox = document.createElement("div");
        seatBox.className = "seat-box";
        seatBox.innerHTML = `
            <span>Seat ${seatNum}</span>
            <strong>${person}</strong>
        `;
        seatRow.appendChild(seatBox);
    });

    container.appendChild(seatRow);
}
