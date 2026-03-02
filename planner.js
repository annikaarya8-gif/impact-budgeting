const minutesAvailable = document.getElementById("minutesAvailable");
const suggestBtn = document.getElementById("suggestBtn");
const suggestions = document.getElementById("suggestions");

// simple task bank (edit these!!)
const TASKS = [
  { name: "Send a text to 2 friends asking about campus fundraisers", min: 5 },
  { name: "Notion cleanup: organize your week’s priorities", min: 10 },
  { name: "Research summer service trips", min: 30 },
  { name: "Reach out to 1 donor", min: 10 },
  { name: "Find 1 local volunteer opportunity and bookmark it", min: 20 },
  { name: "Plan a donation / fundraiser post (draft only)", min: 15 },
];

function pickSuggestions(totalMins) {
  // tasks that fit
  const fits = TASKS.filter(t => t.min <= totalMins);

  // shuffle
  for (let i = fits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fits[i], fits[j]] = [fits[j], fits[i]];
  }

  // pick up to 5
  return fits.slice(0, 5);
}

suggestBtn.addEventListener("click", () => {
  const m = Number(minutesAvailable.value);

  if (!m || m <= 0) {
    alert("Enter how many minutes you have today 💗");
    return;
  }

  suggestions.innerHTML = "";

  const picks = pickSuggestions(m);

  if (picks.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks fit that time—try a bigger number!";
    suggestions.appendChild(li);
    return;
  }

  for (const t of picks) {
    const li = document.createElement("li");
    li.textContent = `${t.name} — ${t.min} min`;
    suggestions.appendChild(li);
  }
});