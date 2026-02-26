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

    document.getElementById("baselineOutput").textContent = "";
    document.getElementById("neuroOutput").textContent = "";
    document.getElementById("baselineValidation").innerHTML = "";
    document.getElementById("solutionCount").innerHTML = "";
    document.getElementById("seatVisualization").innerHTML = "";

    const requestBody = { puzzle };

    try {
        // 🧠 Baseline
        loadingText.innerText = "LLM is thinking intuitively...";
        const baselineRes = await fetch("http://127.0.0.1:8000/baseline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const baselineData = await baselineRes.json();

        document.getElementById("baselineOutput").textContent =
            baselineData.raw_response;

        if (baselineData.validation.valid) {
            document.getElementById("baselineValidation").innerHTML =
                "<div class='valid'>✅ All constraints successfully satisfied by intuition.</div>";
        } else {
            document.getElementById("baselineValidation").innerHTML =
                "<div class='invalid'>❌ Intuition failed: " +
                baselineData.validation.violations.length + " violations detected.<br><small>" +
                baselineData.validation.violations.join("<br>") +
                "</small></div>";
        }

        // ⚙ Neuro-Symbolic
        loadingText.innerText = "Formalizing logic & solving...";
        const neuroRes = await fetch("http://127.0.0.1:8000/neurosymbolic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const neuroData = await neuroRes.json();

        document.getElementById("neuroOutput").textContent =
            JSON.stringify(neuroData.structured_representation, null, 2);

        document.getElementById("solutionCount").innerHTML =
            "<div class='valid'>Total Valid Solutions Found: " +
            neuroData.total_solutions +
            "</div>";

        // 🎨 Seat Visualization (first solution only)
        if (neuroData.solutions.length > 0) {
            const firstSolution = neuroData.solutions[0];
            visualizeSeats(firstSolution);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Backend connection failed. Make sure the server is running at http://127.0.0.1:8000");
    } finally {
        loading.classList.add("hidden");
        runBtn.disabled = false;
    }
}


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
        seatBox.innerHTML = `<span>Seat ${seatNum}</span><strong>${person}</strong>`;
        seatRow.appendChild(seatBox);
    });

    container.appendChild(seatRow);
}