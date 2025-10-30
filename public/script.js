const analyzeBtn = document.getElementById("analyzeBtn");
const adTextInput = document.getElementById("adText");
const goalSelect = document.getElementById("goalSelect");
const errorMsg = document.getElementById("errorMsg");

const resultsCard = document.getElementById("resultsCard");
const scoreValue = document.getElementById("scoreValue");
const goalDisplay = document.getElementById("goalDisplay");
const aiSummaryText = document.getElementById("aiSummaryText");
const breakdownList = document.getElementById("breakdownList");
const suggestionsList = document.getElementById("suggestionsList");

const rewriteText = document.getElementById("rewriteText");

analyzeBtn.addEventListener("click", async () => {
  const adText = adTextInput.value.trim();
  const goal = goalSelect.value;

  // basic validation
  if (!adText) {
    showError("Please paste some ad text first.");
    return;
  }

  hideError();

  try {
    // send request to backend
    const response = await fetch("/analyzeAd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adText,
        goal
      })
    });

    if (!response.ok) {
      showError("Server error. Check if 'npm start' is running.");
      return;
    }

    const data = await response.json();

    // if backend returns error format
    if (data.error) {
      showError(data.error);
      return;
    }

    // fill UI with response
    renderResults(data);

  } catch (err) {
    console.error(err);
    showError("Could not connect to backend at http://localhost:3000");
  }
});

function renderResults(data) {
  // unhide results card
  resultsCard.style.display = "block";

  // score
  scoreValue.textContent = data.score ?? "--";

  // goal
  goalDisplay.textContent = data.goalAnalyzed ?? "--";

  // AI summary paragraph
  aiSummaryText.textContent = data.aiSummary || "No summary generated.";
  
  // rewrite suggestion
  rewriteText.textContent = data.rewrite || "No rewrite generated.";

  // breakdown (object like { CTA: 50, Urgency: 100, Curiosity: 0 })
  breakdownList.innerHTML = ""; // clear previous
  if (data.breakdown) {
    Object.entries(data.breakdown).forEach(([key, val]) => {
      const item = document.createElement("div");
      item.className = "breakdown-item";

      const k = document.createElement("div");
      k.className = "breakdown-key";
      k.textContent = key;

      const v = document.createElement("div");
      v.className = "breakdown-val";
      v.textContent = val + " / 100";

      item.appendChild(k);
      item.appendChild(v);
      breakdownList.appendChild(item);
    });
  }

  // suggestions array
  suggestionsList.innerHTML = "";
  if (Array.isArray(data.suggestions)) {
    data.suggestions.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      suggestionsList.appendChild(li);
    });
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

function hideError() {
  errorMsg.style.display = "none";
}
