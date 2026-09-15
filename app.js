const STORAGE_KEY = "finance-tracker-v1";
const RATES_STORAGE_KEY = "finance-tracker-rates-v1";
const BASE_CURRENCY = "USD";
const DEFAULT_CURRENCY = "MYR";
const CURRENCY_OPTIONS = [
  ["MYR", "Malaysian Ringgit"], ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"],
  ["SGD", "Singapore Dollar"], ["AUD", "Australian Dollar"], ["JPY", "Japanese Yen"], ["CNY", "Chinese Yuan"],
  ["HKD", "Hong Kong Dollar"], ["THB", "Thai Baht"], ["INR", "Indian Rupee"], ["KRW", "South Korean Won"],
  ["CAD", "Canadian Dollar"], ["NZD", "New Zealand Dollar"], ["CHF", "Swiss Franc"]
];
const CURRENCY_FLAGS = {
  MYR: "MY",
  USD: "US",
  EUR: "EU",
  GBP: "GB",
  SGD: "SG",
  AUD: "AU",
  JPY: "JP",
  CNY: "CN",
  HKD: "HK",
  THB: "TH",
  INR: "IN",
  KRW: "KR",
  CAD: "CA",
  NZD: "NZ",
  CHF: "CH"
};
const FALLBACK_RATES = { USD: 1, MYR: 4.25, EUR: 0.92, GBP: 0.78, SGD: 1.34, AUD: 1.53, JPY: 149, CNY: 7.24, HKD: 7.82, THB: 35.5, INR: 83.1, KRW: 1330, CAD: 1.36, NZD: 1.64, CHF: 0.88 };
const COLORS = ["#5eead4", "#60a5fa", "#a78bfa", "#f59e0b", "#fb7185", "#34d399", "#f472b6", "#38bdf8"];
const EXPENSE_CATEGORIES = [
  "Education",
  "Entertainment",
  "Gifts & Donations",
  "Housing",
  "Insurance",
  "Miscellaneous",
  "Pets",
  "Shopping",
  "Travel",
  "Transportation",
  "Utilities"
];

const defaultState = {
  budgets: {
    Food: 300,
    Entertainment: 100
  },
  monthlyBudgets: {},
  monthlyTotals: {},
  spendings: [],
  incomes: [],
  goals: [],
  events: []
};

const state = loadState();
let rates = loadRates();
let rateSource = "backup rates";

const refs = {
  budgetForm: document.getElementById("budgetForm"),
  budgetCategory: document.getElementById("budgetCategory"),
  budgetAmount: document.getElementById("budgetAmount"),
  budgetMonth: document.getElementById("budgetMonth"),
  monthlyBudgetForm: document.getElementById("monthlyBudgetForm"),
  monthlyBudgetMonth: document.getElementById("monthlyBudgetMonth"),
  monthlyBudgetAmount: document.getElementById("monthlyBudgetAmount"),
  monthlyBudgetStatus: document.getElementById("monthlyBudgetStatus"),
  budgetList: document.getElementById("budgetList"),
  spendingForm: document.getElementById("spendingForm"),
  spendingDate: document.getElementById("spendingDate"),
  spendingCategory: document.getElementById("spendingCategory"),
  spendingAmount: document.getElementById("spendingAmount"),
  spendingNote: document.getElementById("spendingNote"),
  spendingList: document.getElementById("spendingList"),
  incomeForm: document.getElementById("incomeForm"),
  incomeDate: document.getElementById("incomeDate"),
  incomeSource: document.getElementById("incomeSource"),
  incomeAmount: document.getElementById("incomeAmount"),
  incomeNote: document.getElementById("incomeNote"),
  entryTypeButton: document.getElementById("entryTypeButton"),
  entryTypeLabel: document.getElementById("entryTypeLabel"),
  entryTypeDescription: document.getElementById("entryTypeDescription"),
  goalForm: document.getElementById("goalForm"),
  goalName: document.getElementById("goalName"),
  goalTarget: document.getElementById("goalTarget"),
  goalSaved: document.getElementById("goalSaved"),
  goalDeadline: document.getElementById("goalDeadline"),
  goalSubmitButton: document.getElementById("goalSubmitButton"),
  goalList: document.getElementById("goalList"),
  createGoalButton: document.getElementById("createGoalButton"),
  cancelGoalButton: document.getElementById("cancelGoalButton"),
  historyMonthFilter: document.getElementById("historyMonthFilter"),
  historyYearFilter: document.getElementById("historyYearFilter"),
  categoryOptions: document.getElementById("categoryOptions"),
  spendingChart: document.getElementById("spendingChart"),
  chartLegend: document.getElementById("chartLegend"),
  spentTotal: document.getElementById("spentTotal"),
  budgetTotal: document.getElementById("budgetTotal"),
  dashboardMonth: document.getElementById("dashboardMonth"),
  pageTitle: document.getElementById("pageTitle"),
  currencyControl: document.getElementById("currencyControl"),
  viewButtons: document.querySelectorAll("[data-view]"),
  viewPanels: document.querySelectorAll("[data-view-panel]"),
  eventForm: document.getElementById("eventForm"),
  eventSubmitButton: document.getElementById("eventSubmitButton"),
  createEventButton: document.getElementById("createEventButton"),
  cancelEventButton: document.getElementById("cancelEventButton"),
  eventName: document.getElementById("eventName"),
  eventBudget: document.getElementById("eventBudget"),
  eventMonthLabel: document.getElementById("eventMonthLabel"),
  eventYearLabel: document.getElementById("eventYearLabel"),
  previousEventMonth: document.getElementById("previousEventMonth"),
  nextEventMonth: document.getElementById("nextEventMonth"),
  eventDatePicker: document.getElementById("eventDatePicker"),
  eventMonthPicker: document.getElementById("eventMonthPicker"),
  eventYearPicker: document.getElementById("eventYearPicker"),
  eventCalendar: document.getElementById("eventCalendar"),
  selectedDayCount: document.getElementById("selectedDayCount"),
  eventList: document.getElementById("eventList"),
  eventSummaryTitle: document.getElementById("eventSummaryTitle"),
  eventSummarySubtitle: document.getElementById("eventSummarySubtitle"),
  eventStats: document.getElementById("eventStats"),
  eventChart: document.getElementById("eventChart"),
  eventChartLegend: document.getElementById("eventChartLegend"),
  eventTransactions: document.getElementById("eventTransactions"),
  eventSummaryContent: document.getElementById("eventSummaryContent"),
  currencyButton: document.getElementById("currencyButton"),
  currencyFlag: document.getElementById("currencyFlag"),
  currencyLabel: document.getElementById("currencyLabel"),
  currencyMenu: document.getElementById("currencyMenu"),
  confirmationToast: document.getElementById("confirmationToast"),
  exitModal: document.getElementById("exitModal"),
  cancelExit: document.getElementById("cancelExit"),
  confirmExit: document.getElementById("confirmExit")
  ,deleteModal: document.getElementById("deleteModal")
  ,deleteModalTitle: document.getElementById("deleteModalTitle")
  ,deleteModalDescription: document.getElementById("deleteModalDescription")
  ,cancelDelete: document.getElementById("cancelDelete")
  ,confirmDelete: document.getElementById("confirmDelete"),
  deleteNoteDetail: document.getElementById("deleteNoteDetail")
};

let selectedEventId = null;
let selectedEventDays = new Set();
let eventRangeStart = null;
let eventMonthValue = todayValue().slice(0, 7);
let activeView = "dashboard";
let pendingDeleteId = null;
let pendingDeleteType = null;
let editingGoalId = null;
let editingEventId = null;
let historyReady = false;
let exitRequested = false;

refs.spendingDate.value = todayValue();
refs.incomeDate.value = todayValue();
setEntryType("expense");
refs.budgetMonth.value = todayValue().slice(0, 7);
refs.monthlyBudgetMonth.value = todayValue().slice(0, 7);
populateCurrencyOptions();
updateCurrencyButton();
closeEventDatePicker();
renderEventCalendar();

refs.viewButtons.forEach((button) => {
  button.addEventListener("click", () => navigateToView(button.dataset.view));
  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    navigateToView(button.dataset.view);
  });
});

refs.entryTypeButton.addEventListener("click", () => {
  setEntryType(refs.entryTypeLabel.textContent === "Expense" ? "income" : "expense");
});

initializeViewHistory();
showView(activeView);

window.addEventListener("pageshow", syncLocalData);
window.addEventListener("pagehide", syncLocalData);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") syncLocalData();
});
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  Object.assign(state, loadState());
  updateCurrencyButton();
  render();
});

refs.cancelExit.addEventListener("click", closeExitModal);
refs.confirmExit.addEventListener("click", () => {
  exitRequested = true;
  closeExitModal();
  history.back();
});
refs.exitModal.addEventListener("click", (event) => {
  if (event.target === refs.exitModal) closeExitModal();
});

window.addEventListener("popstate", (event) => {
  if (event.state?.exitBoundary) {
    if (exitRequested) return;
    history.pushState({ view: "dashboard" }, "", window.location.href);
    refs.exitModal.hidden = false;
    return;
  }

  const viewName = event.state?.view;
  if (viewName) {
    showView(viewName);
    return;
  }

  if (activeView !== "dashboard") {
    showView("dashboard");
    return;
  }

  history.pushState({ view: "dashboard" }, "", window.location.href);
  refs.exitModal.hidden = false;
});

refs.currencyButton.addEventListener("click", () => {
  const opening = refs.currencyMenu.hidden;
  refs.currencyMenu.hidden = !opening;
  refs.currencyButton.setAttribute("aria-expanded", String(opening));
  refs.currencyButton.setAttribute("aria-pressed", String(opening));
  refs.currencyButton.classList.toggle("active", opening);
});

refs.currencyMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-currency]");
  if (!option) return;
  state.currency = option.dataset.currency;
  updateCurrencyButton();
  refs.currencyMenu.hidden = true;
  refs.currencyButton.setAttribute("aria-expanded", "false");
  refs.currencyButton.setAttribute("aria-pressed", "false");
  refs.currencyButton.classList.remove("active");
  saveState();
  render();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".currency-control")) {
    refs.currencyMenu.hidden = true;
    refs.currencyButton.setAttribute("aria-expanded", "false");
    refs.currencyButton.setAttribute("aria-pressed", "false");
    refs.currencyButton.classList.remove("active");
  }
});

refs.budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = refs.budgetCategory.value.trim();
  const amount = Number(refs.budgetAmount.value);
  const month = refs.budgetMonth.value;

  if (!category || !month || !Number.isFinite(amount) || amount < 0) return;

  if (!state.monthlyBudgets[month]) state.monthlyBudgets[month] = { ...getBudgetsForMonth(month) };
  state.monthlyBudgets[month][category] = toBaseAmount(amount);
  refs.budgetForm.reset();
  refs.budgetMonth.value = month;
  saveState();
  render();
});

refs.budgetMonth.addEventListener("change", render);

refs.monthlyBudgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const month = refs.monthlyBudgetMonth.value;
  const amount = Number(refs.monthlyBudgetAmount.value);
  if (!month || !Number.isFinite(amount) || amount < 0) return;

  state.monthlyTotals[month] = toBaseAmount(amount);
  refs.monthlyBudgetAmount.value = "";
  saveState();
  render();
});

refs.spendingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const category = refs.spendingCategory.value.trim();
  const amount = Number(refs.spendingAmount.value);
  const date = refs.spendingDate.value;
  const note = refs.spendingNote.value.trim();

  if (!category || !date || !Number.isFinite(amount) || amount <= 0) return;

  state.spendings.unshift({
    id: createId(),
    category,
    amount: toBaseAmount(amount),
    date,
    note
  });

  refs.spendingForm.reset();
  refs.spendingDate.value = todayValue();
  saveState();
  render();
  showConfirmation("Expense added successfully");
});

refs.spendingList.addEventListener("click", (event) => {
  const expenseButton = event.target.closest("[data-delete-id]");
  const incomeButton = event.target.closest("[data-delete-income]");
  const button = expenseButton || incomeButton;
  if (!button) return;

  pendingDeleteId = button.dataset.deleteId || button.dataset.deleteIncome;
  pendingDeleteType = incomeButton ? "income" : "expense";
  if (pendingDeleteType === "income") {
    refs.deleteModalTitle.textContent = "Delete income?";
    refs.deleteModalDescription.textContent = "This income entry will be permanently removed.";
  } else {
    const spending = state.spendings.find((item) => item.id === pendingDeleteId);
    refs.deleteModalTitle.textContent = "Delete expense?";
    refs.deleteModalDescription.innerHTML = '<span id="deleteNoteDetail" class="delete-note-detail"></span> will be permanently removed from your history.';
    refs.deleteNoteDetail = document.getElementById("deleteNoteDetail");
    refs.deleteNoteDetail.textContent = spending?.note?.trim() || "This expense";
  }
  refs.deleteModal.hidden = false;
});

refs.incomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const source = refs.incomeSource.value.trim();
  const amount = Number(refs.incomeAmount.value);
  if (!source || !refs.incomeDate.value || !Number.isFinite(amount) || amount <= 0) return;

  state.incomes.unshift({
    id: createId(),
    source,
    amount: toBaseAmount(amount),
    date: refs.incomeDate.value,
    note: refs.incomeNote.value.trim()
  });
  refs.incomeForm.reset();
  refs.incomeDate.value = todayValue();
  saveState();
  render();
  showConfirmation("Income added successfully");
});

refs.goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = refs.goalName.value.trim();
  const target = Number(refs.goalTarget.value);
  const saved = Number(refs.goalSaved.value);
  if (!name || !Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0) return;

  const wasEditing = Boolean(editingGoalId);
  const goalData = {
    name,
    target: toBaseAmount(target),
    saved: toBaseAmount(saved),
    deadline: refs.goalDeadline.value
  };
  if (wasEditing) {
    const goal = state.goals.find((item) => item.id === editingGoalId);
    if (goal) Object.assign(goal, goalData);
  } else {
    state.goals.unshift({ id: createId(), ...goalData });
  }
  editingGoalId = null;
  refs.goalForm.reset();
  refs.goalList.hidden = false;
  refs.goalForm.hidden = true;
  refs.createGoalButton.hidden = false;
  refs.goalSubmitButton.textContent = "Create goal";
  saveState();
  render();
  showConfirmation(wasEditing ? "Goal updated successfully" : "Goal created successfully");
});

refs.createGoalButton.addEventListener("click", () => {
  editingGoalId = null;
  refs.goalForm.reset();
  refs.goalSubmitButton.textContent = "Create goal";
  refs.goalList.hidden = true;
  refs.goalForm.hidden = false;
  refs.createGoalButton.hidden = true;
  refs.goalName.focus();
});

refs.cancelGoalButton.addEventListener("click", () => {
  editingGoalId = null;
  refs.goalForm.reset();
  refs.goalList.hidden = false;
  refs.goalForm.hidden = true;
  refs.createGoalButton.hidden = false;
  refs.goalSubmitButton.textContent = "Create goal";
});

refs.goalList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-goal]");
  const button = event.target.closest("[data-delete-goal]");
  if (editButton) {
    const goal = state.goals.find((item) => item.id === editButton.dataset.editGoal);
    if (!goal) return;
    editingGoalId = goal.id;
    refs.goalName.value = goal.name;
    refs.goalTarget.value = fromBaseAmount(goal.target);
    refs.goalSaved.value = fromBaseAmount(goal.saved);
    refs.goalDeadline.value = goal.deadline || "";
    refs.goalSubmitButton.textContent = "Save changes";
    refs.goalList.hidden = true;
    refs.goalForm.hidden = false;
    refs.createGoalButton.hidden = true;
    refs.goalName.focus();
    return;
  }
  if (!button) return;
  pendingDeleteId = button.dataset.deleteGoal;
  pendingDeleteType = "goal";
  refs.deleteModalTitle.textContent = "Delete goal?";
  refs.deleteModalDescription.textContent = "This savings goal will be permanently removed.";
  refs.deleteModal.hidden = false;
});

refs.historyMonthFilter.addEventListener("change", render);
refs.historyYearFilter.addEventListener("change", render);

refs.cancelDelete.addEventListener("click", closeDeleteModal);
refs.deleteModal.addEventListener("click", (event) => {
  if (event.target === refs.deleteModal) closeDeleteModal();
});
refs.confirmDelete.addEventListener("click", () => {
  if (!pendingDeleteId) return;
  const deletingEvent = pendingDeleteType === "event";
  if (deletingEvent) {
    state.events = state.events.filter((savedEvent) => savedEvent.id !== pendingDeleteId);
    if (selectedEventId === pendingDeleteId) selectedEventId = state.events[0]?.id || null;
  } else if (pendingDeleteType === "expense") {
    state.spendings = state.spendings.filter((spending) => spending.id !== pendingDeleteId);
  } else if (pendingDeleteType === "income") {
    state.incomes = state.incomes.filter((income) => income.id !== pendingDeleteId);
  } else if (pendingDeleteType === "goal") {
    state.goals = state.goals.filter((goal) => goal.id !== pendingDeleteId);
  }
  saveState();
  closeDeleteModal();
  render();
  const deletedLabel = deletingEvent ? "Event" : pendingDeleteType === "income" ? "Income" : pendingDeleteType === "goal" ? "Goal" : "Expense";
  showConfirmation(`${deletedLabel} deleted`);
});

refs.previousEventMonth.addEventListener("click", () => shiftEventMonth(-1));
refs.nextEventMonth.addEventListener("click", () => shiftEventMonth(1));
refs.eventMonthLabel.addEventListener("click", () => toggleDatePicker("month"));
refs.eventYearLabel.addEventListener("click", () => toggleDatePicker("year"));
refs.eventMonthPicker.addEventListener("click", handleDatePickerClick);
refs.eventYearPicker.addEventListener("click", handleDatePickerClick);

refs.createEventButton.addEventListener("click", () => {
  editingEventId = null;
  refs.eventForm.reset();
  selectedEventDays = new Set();
  eventRangeStart = null;
  eventMonthValue = todayValue().slice(0, 7);
  refs.eventSubmitButton.textContent = "Add Event";
  closeEventDatePicker();
  renderEventCalendar();
  setEventFormMode(true);
  refs.eventName.focus();
});

refs.cancelEventButton.addEventListener("click", () => {
  editingEventId = null;
  refs.eventForm.reset();
  selectedEventDays = new Set();
  eventRangeStart = null;
  eventMonthValue = todayValue().slice(0, 7);
  closeEventDatePicker();
  renderEventCalendar();
  setEventFormMode(false);
  refs.eventSubmitButton.textContent = "Add Event";
});

refs.eventCalendar.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-event-date]");
  if (!dayButton || dayButton.disabled) return;
  const date = dayButton.dataset.eventDate;

  if (!eventRangeStart || selectedEventDays.size > 1) {
    eventRangeStart = date;
    selectedEventDays = new Set([date]);
  } else {
    const rangeStart = eventRangeStart < date ? eventRangeStart : date;
    const rangeEnd = eventRangeStart < date ? date : eventRangeStart;
    selectedEventDays = datesBetween(rangeStart, rangeEnd);
  }
  renderEventCalendar();
});

refs.eventForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = refs.eventName.value.trim();
  const budget = Number(refs.eventBudget.value);
  const month = eventMonthValue;
  const dates = [...selectedEventDays].sort();
  if (!name || !month || !dates.length || !Number.isFinite(budget) || budget < 0) return;

  const eventData = { name, budget: toBaseAmount(budget), month, dates };
  const wasEditing = Boolean(editingEventId);
  if (wasEditing) {
    const savedEvent = state.events.find((item) => item.id === editingEventId);
    if (savedEvent) Object.assign(savedEvent, eventData);
    selectedEventId = editingEventId;
  } else {
    const newEvent = { id: createId(), ...eventData };
    state.events.unshift(newEvent);
    selectedEventId = newEvent.id;
  }
  editingEventId = null;
  selectedEventDays = new Set();
  eventRangeStart = null;
  refs.eventForm.reset();
  eventMonthValue = todayValue().slice(0, 7);
  saveState();
  renderEventCalendar();
  render();
  setEventFormMode(false);
  refs.eventSubmitButton.textContent = "Add Event";
  showConfirmation(wasEditing ? "Event updated successfully" : "Event added successfully");
});

refs.eventList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-event]");
  const selectButton = event.target.closest("[data-select-event]");
  const deleteButton = event.target.closest("[data-delete-event]");
  if (editButton) {
    const savedEvent = state.events.find((item) => item.id === editButton.dataset.editEvent);
    if (!savedEvent) return;
    editingEventId = savedEvent.id;
    refs.eventName.value = savedEvent.name;
    refs.eventBudget.value = fromBaseAmount(savedEvent.budget);
    eventMonthValue = savedEvent.month;
    selectedEventDays = new Set(savedEvent.dates);
    eventRangeStart = null;
    refs.eventSubmitButton.textContent = "Save Changes";
    closeEventDatePicker();
    renderEventCalendar();
    setEventFormMode(true);
    refs.eventName.focus();
    return;
  }
  if (deleteButton) {
    pendingDeleteId = deleteButton.dataset.deleteEvent;
    pendingDeleteType = "event";
    const savedEvent = state.events.find((item) => item.id === pendingDeleteId);
    refs.deleteModalTitle.textContent = "Delete event?";
    refs.deleteModalDescription.innerHTML = '<span id="deleteNoteDetail" class="delete-note-detail"></span> will be permanently removed from your events.';
    refs.deleteNoteDetail = document.getElementById("deleteNoteDetail");
    refs.deleteNoteDetail.textContent = savedEvent?.name || "This event";
    refs.deleteModal.hidden = false;
    return;
  }
  if (selectButton) {
    selectedEventId = selectButton.dataset.selectEvent;
    render();
  }
});

function setEventFormMode(isFormVisible) {
  refs.eventForm.hidden = !isFormVisible;
  refs.eventSummaryContent.hidden = isFormVisible;
}

render();
registerServiceWorker();
refreshRates();

function render() {
  const currentMonth = todayValue().slice(0, 7);
  const monthSpendings = state.spendings.filter((spending) => spending.date.startsWith(`${currentMonth}-`));
  const totalsByCategory = groupTotals(monthSpendings);
  const currentBudgets = getBudgetsForMonth(currentMonth);
  const budgetTotal = getBudgetTotalForMonth(currentMonth);
  const spentTotal = sum(monthSpendings.map((spending) => spending.amount));

  refs.spentTotal.textContent = formatMoney(spentTotal);
  refs.spentTotal.className = getBudgetStatusClass(spentTotal, budgetTotal);
  refs.budgetTotal.textContent = formatMoney(budgetTotal);
  refs.dashboardMonth.textContent = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date());

  const budgetMonth = refs.budgetMonth.value || currentMonth;
  const budgetMonthSpendings = state.spendings.filter((spending) => spending.date.startsWith(`${budgetMonth}-`));
  const budgetMonthTotals = groupTotals(budgetMonthSpendings);
  renderBudgets(budgetMonthTotals, getBudgetsForMonth(budgetMonth));
  const selectedMonthlyTotal = state.monthlyTotals[refs.monthlyBudgetMonth.value];
  refs.monthlyBudgetStatus.textContent = selectedMonthlyTotal === undefined
    ? "No monthly total saved for this month."
    : `Monthly total: ${formatMoney(selectedMonthlyTotal)}`;
  renderHistoryFilters();
  renderSpendings();
  renderGoals();
  renderChart(totalsByCategory);
  renderCategories();
  renderEvents();
}

function showView(viewName) {
  const titles = {
    dashboard: "Overview",
    expense: "Add",
    budget: "Set Budget",
    history: "History",
    events: "Events",
    goals: "Goals"
  };
  activeView = titles[viewName] ? viewName : "dashboard";
  refs.pageTitle.textContent = titles[activeView];
  refs.viewPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.viewPanel === activeView));
  refs.viewButtons.forEach((button) => {
    const isActive = button.dataset.view === activeView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const isDashboard = activeView === "dashboard";
  refs.currencyControl.hidden = !isDashboard;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeViewHistory() {
  history.replaceState({ view: "dashboard", exitBoundary: true }, "", window.location.href);
  history.pushState({ view: "dashboard" }, "", window.location.href);
  historyReady = true;
}

function navigateToView(viewName) {
  if (!historyReady || viewName === activeView) return;
  history.pushState({ view: viewName }, "", window.location.href);
  showView(viewName);
}

function closeExitModal() {
  refs.exitModal.hidden = true;
}

function syncLocalData() {
  saveState();
}

async function importDataFromCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const rows = parseCsv(await file.text());
    const importedState = stateFromCsvRows(rows);
    Object.assign(state, importedState);
    saveState();
    updateCurrencyButton();
    render();
    showConfirmation("CSV data imported successfully");
  } catch (error) {
    showConfirmation(error.message || "Could not import CSV data");
  } finally {
    event.target.value = "";
  }
}

function stateFromCsvRows(rows) {
  if (!rows.length || !Object.hasOwn(rows[0], "record_type")) {
    throw new Error("This CSV is missing the record_type column");
  }

  const importedState = cloneDefaultState();
  importedState.budgets = {};
  importedState.currency = CURRENCY_OPTIONS.some(([code]) => code === rows.find((row) => CURRENCY_OPTIONS.some(([option]) => option === row.currency))?.currency)
    ? rows.find((row) => row.currency)?.currency
    : DEFAULT_CURRENCY;
  let importedRecords = 0;

  rows.forEach((row) => {
    const type = row.record_type?.trim();
    const amount = getImportedAmount(row, "amount");
    const budget = getImportedAmount(row, "budget");
    const target = getImportedAmount(row, "target");
    const saved = getImportedAmount(row, "saved");

    if (type === "expense" && row.category && row.date && amount !== null) {
      importedState.spendings.push({ id: row.id || createId(), category: row.category, amount, date: row.date, note: row.note || "" });
      importedRecords += 1;
    } else if (type === "income" && row.category && row.date && amount !== null) {
      importedState.incomes.push({ id: row.id || createId(), source: row.category, amount, date: row.date, note: row.note || "" });
      importedRecords += 1;
    } else if (type === "budget" && row.category && budget !== null) {
      importedState.budgets[row.category] = budget;
      importedRecords += 1;
    } else if (type === "monthly_budget" && row.month && row.category && budget !== null) {
      if (!importedState.monthlyBudgets[row.month]) importedState.monthlyBudgets[row.month] = {};
      importedState.monthlyBudgets[row.month][row.category] = budget;
      importedRecords += 1;
    } else if (type === "monthly_total" && row.month && budget !== null) {
      importedState.monthlyTotals[row.month] = budget;
      importedRecords += 1;
    } else if (type === "goal" && row.description && target !== null && saved !== null) {
      importedState.goals.push({ id: row.id || createId(), name: row.description, target, saved, deadline: row.deadline || "" });
      importedRecords += 1;
    } else if (type === "event" && row.description && row.month && budget !== null) {
      importedState.events.push({
        id: row.id || createId(),
        name: row.description,
        month: row.month,
        budget,
        dates: (row.selected_dates || "").split(";").map((date) => date.trim()).filter(Boolean)
      });
      importedRecords += 1;
    }
  });

  if (!importedRecords) throw new Error("No supported finance records were found");
  return importedState;
}

function getImportedAmount(row, field) {
  const baseValue = Number(row[`${field}_base_usd`]);
  if (Number.isFinite(baseValue)) return baseValue;
  const displayValue = Number(row[field]);
  if (!Number.isFinite(displayValue)) return null;
  const currency = CURRENCY_OPTIONS.some(([code]) => code === row.currency) ? row.currency : DEFAULT_CURRENCY;
  return displayValue / (rates[currency] || FALLBACK_RATES[currency] || 1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);

  const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, "").trim()) || [];
  return rows.map((cells) => headers.reduce((record, header, index) => {
    record[header] = cells[index] || "";
    return record;
  }, {}));
}

function setEntryType(type) {
  const isIncome = type === "income";
  refs.entryTypeLabel.textContent = isIncome ? "Income" : "Expense";
  refs.entryTypeButton.classList.toggle("income", isIncome);
  refs.entryTypeButton.classList.toggle("expense", !isIncome);
  refs.entryTypeButton.setAttribute("aria-label", `Switch to ${isIncome ? "expense" : "income"}`);
  refs.entryTypeDescription.textContent = isIncome
    ? "Record money received so your cash flow stays complete."
    : "Record daily expenses with a date and category.";
  refs.spendingForm.hidden = isIncome;
  refs.incomeForm.hidden = !isIncome;
  refs.entryTypeButton.classList.remove("is-switching");
  requestAnimationFrame(() => refs.entryTypeButton.classList.add("is-switching"));
  const activeForm = isIncome ? refs.incomeForm : refs.spendingForm;
  activeForm.classList.remove("entry-form-switching");
  requestAnimationFrame(() => activeForm.classList.add("entry-form-switching"));
}

function showConfirmation(message) {
  refs.confirmationToast.textContent = message;
  refs.confirmationToast.hidden = false;
  refs.confirmationToast.classList.remove("visible");
  requestAnimationFrame(() => refs.confirmationToast.classList.add("visible"));
  window.setTimeout(() => {
    refs.confirmationToast.classList.remove("visible");
    window.setTimeout(() => {
      refs.confirmationToast.hidden = true;
    }, 180);
  }, 2600);
}

function renderBudgets(totalsByCategory, budgetsForMonth) {
  const budgets = Object.entries(budgetsForMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, amount]) => {
      const spent = totalsByCategory[category] || 0;
      const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
      const statusClass = getBudgetStatusClass(spent, amount);
      return `
        <article class="budget-card">
          <div class="budget-top">
            <div>
              <div class="transaction-title">${escapeHtml(category)}</div>
              <div class="budget-meta ${statusClass}">${formatMoney(spent)} spent of ${formatMoney(amount)}</div>
            </div>
            <strong class="${statusClass}">${Math.round(percent)}%</strong>
          </div>
          <div class="budget-progress ${statusClass}"><span style="width:${percent}%"></span></div>
          <div class="budget-actions">
            <button class="ghost" type="button" data-remove-budget="${escapeHtml(category)}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  refs.budgetList.innerHTML = budgets || `<p class="budget-meta">No budgets yet. Add one above.</p>`;

  refs.budgetList.querySelectorAll("[data-remove-budget]").forEach((button) => {
    button.addEventListener("click", () => {
      const month = refs.budgetMonth.value;
      if (state.monthlyBudgets[month]) {
        delete state.monthlyBudgets[month][button.dataset.removeBudget];
      } else {
        delete state.budgets[button.dataset.removeBudget];
      }
      saveState();
      render();
    });
  });
}

function renderSpendings() {
  const currentBudgets = getBudgetsForMonth(todayValue().slice(0, 7));
  const totalsByCategory = groupTotals(state.spendings.filter((spending) => spending.date.startsWith(`${todayValue().slice(0, 7)}-`)));
  const selectedMonth = refs.historyMonthFilter.value;
  const selectedYear = refs.historyYearFilter.value;
  const entries = [
    ...state.spendings.map((spending) => ({ ...spending, type: "expense", title: spending.category })),
    ...state.incomes.map((income) => ({ ...income, type: "income", title: income.source }))
  ];
  const filteredEntries = entries.filter((entry) => {
    const [year, month] = entry.date.split("-");
    return (selectedMonth === "all" || month === selectedMonth) && (selectedYear === "all" || year === selectedYear);
  });
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const month = entry.date.slice(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(entry);
    return groups;
  }, {});
  refs.spendingList.innerHTML = filteredEntries.length
    ? Object.entries(groupedEntries)
        .sort(([firstMonth], [secondMonth]) => secondMonth.localeCompare(firstMonth))
        .map(([month, monthEntries]) => `
          <section class="history-month">
            <h3>${formatMonth(month)}</h3>
            <div class="transaction-list">
              ${monthEntries.map((entry) => `
            <article class="transaction-item history-transaction ${entry.type === "income" ? "history-income" : "history-expense"}">
              <div class="transaction-top">
                <div class="history-transaction-details">
                  <div class="transaction-title">${escapeHtml(entry.title)}</div>
                  <div class="transaction-meta">${entry.type === "income" ? "Income" : "Expense"} • ${formatDate(entry.date)}${entry.note ? ` • ${escapeHtml(entry.note)}` : ""}</div>
                </div>
                <div class="history-transaction-end">
                  <div class="transaction-amount ${entry.type === "income" ? "income-amount" : `expense-amount ${getBudgetStatusClass(totalsByCategory[entry.category] || 0, currentBudgets[entry.category])}`}\">${entry.type === "income" ? "+" : "-"}${formatMoney(entry.amount)}</div>
                  <button class="icon-button delete-icon" type="button" ${entry.type === "income" ? `data-delete-income="${entry.id}" aria-label="Delete income" title="Delete income"` : `data-delete-id="${entry.id}" aria-label="Delete expense" title="Delete expense"`}>&#128465;</button>
                </div>
              </div>
            </article>
              `).join("")}
            </div>
          </section>
        `)
        .join("")
    : `<p class="budget-meta">No expenses or income recorded yet.</p>`;
}

function renderGoals() {
  refs.goalList.innerHTML = state.goals.length
    ? state.goals.map((goal) => {
      const progress = Math.min(Math.max(goal.saved / goal.target, 0), 1);
      return `
        <article class="goal-item">
          <div class="transaction-top">
            <div>
              <div class="transaction-title">${escapeHtml(goal.name)}</div>
              <div class="transaction-meta">${goal.deadline ? `Target: ${formatDate(goal.deadline)}` : "No target date"}</div>
            </div>
            <strong>${Math.round(progress * 100)}%</strong>
          </div>
          <div class="progress-track"><span style="width: ${progress * 100}%"></span></div>
          <div class="goal-summary"><span>${formatMoney(goal.saved)} saved</span><span>${formatMoney(Math.max(goal.target - goal.saved, 0))} remaining</span></div>
          <div class="budget-actions">
            <button class="ghost" type="button" data-edit-goal="${goal.id}">Edit</button>
            <button class="icon-button delete-icon" type="button" data-delete-goal="${goal.id}" aria-label="Delete goal" title="Delete goal">&#128465;</button>
          </div>
        </article>
      `;
    }).join("")
    : `<p class="budget-meta">No goals created yet.</p>`;
}

function renderHistoryFilters() {
  const selectedMonth = refs.historyMonthFilter.value || "all";
  const selectedYear = refs.historyYearFilter.value || "all";
  const historyEntries = [...state.spendings, ...state.incomes];
  const months = [...new Set(historyEntries.map((entry) => entry.date.slice(5, 7)))].sort();
  const years = [...new Set(historyEntries.map((entry) => entry.date.slice(0, 4)))].sort().reverse();
  refs.historyMonthFilter.innerHTML = `<option value="all">All months</option>${months.map((month) => `<option value="${month}">${new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(2020, Number(month) - 1, 1))}</option>`).join("")}`;
  refs.historyYearFilter.innerHTML = `<option value="all">All years</option>${years.map((year) => `<option value="${year}">${year}</option>`).join("")}`;
  refs.historyMonthFilter.value = months.includes(selectedMonth) ? selectedMonth : "all";
  refs.historyYearFilter.value = years.includes(selectedYear) ? selectedYear : "all";
}

function closeDeleteModal() {
  pendingDeleteId = null;
  pendingDeleteType = null;
  refs.deleteModal.hidden = true;
}

function renderChart(totalsByCategory) {
  const entries = Object.entries(totalsByCategory).filter(([, value]) => value > 0);
  const canvas = refs.spendingChart;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.38;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(center, center, radius + 14, 0, Math.PI * 2);
  ctx.fill();

  if (!entries.length) {
    ctx.fillStyle = "#95a3bf";
    ctx.font = "600 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("No spending yet", center, center);
    refs.chartLegend.innerHTML = `<p class="budget-meta">Add spending to see the chart.</p>`;
    return;
  }

  const total = sum(entries.map(([, value]) => value));
  let start = -Math.PI / 2;

  entries.forEach(([category, value], index) => {
    const slice = (value / total) * Math.PI * 2;
    const end = start + slice;
    const color = COLORS[index % COLORS.length];

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.fillStyle = color;
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fill();
    start = end;
  });

  ctx.fillStyle = "#0b1120";
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.56, 0, Math.PI * 2);
  ctx.fill();

  refs.chartLegend.innerHTML = entries
    .map((entry, index) => {
      const [category, value] = entry;
      return `
        <div class="legend-item">
          <div class="legend-row">
            <div style="display:flex;align-items:center;gap:.65rem;">
              <span class="legend-swatch" style="background:${COLORS[index % COLORS.length]}"></span>
              <strong>${escapeHtml(category)}</strong>
            </div>
            <span>${formatMoney(value)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderEventCalendar() {
  const month = eventMonthValue;
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const firstDay = (new Date(year, monthNumber - 1, 1).getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) cells.push(`<span class="calendar-empty"></span>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    const selected = selectedEventDays.has(date) ? " selected" : "";
    cells.push(`<button class="calendar-day${selected}" type="button" data-event-date="${date}" aria-pressed="${selected ? "true" : "false"}">${day}</button>`);
  }

  refs.eventCalendar.innerHTML = cells.join("");
  refs.selectedDayCount.textContent = `${selectedEventDays.size} selected`;
  refs.eventMonthLabel.textContent = new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(year, monthNumber - 1, 1));
  refs.eventYearLabel.textContent = String(year);
  renderDatePickers(year, monthNumber);
}

function shiftEventMonth(amount) {
  const [year, month] = eventMonthValue.split("-").map(Number);
  const next = new Date(year, month - 1 + amount, 1);
  setEventMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
}

function setEventMonth(month) {
  if (month === eventMonthValue) return;
  eventMonthValue = month;
  selectedEventDays = new Set();
  eventRangeStart = null;
  renderEventCalendar();
}

function renderDatePickers(year, monthNumber) {
  const monthNames = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date(2020, index, 1)));
  refs.eventMonthPicker.innerHTML = monthNames.map((name, index) => `<button class="picker-option${index + 1 === monthNumber ? " selected" : ""}" type="button" data-picker-month="${index + 1}" role="option" aria-selected="${index + 1 === monthNumber}">${name}</button>`).join("");
  refs.eventYearPicker.innerHTML = Array.from({ length: 21 }, (_, index) => year - 10 + index).map((item) => `<button class="picker-option${item === year ? " selected" : ""}" type="button" data-picker-year="${item}" role="option" aria-selected="${item === year}">${item}</button>`).join("");
  requestAnimationFrame(() => {
    refs.eventMonthPicker.querySelector(".selected")?.scrollIntoView({ block: "center" });
    refs.eventYearPicker.querySelector(".selected")?.scrollIntoView({ block: "center" });
  });
}

function toggleDatePicker(column) {
  const opening = refs.eventDatePicker.hidden;
  const activeColumn = column === "month" ? refs.eventMonthLabel : refs.eventYearLabel;
  const isActiveColumn = activeColumn.getAttribute("aria-expanded") === "true";
  refs.eventDatePicker.hidden = !opening && isActiveColumn;
  refs.eventMonthLabel.setAttribute("aria-expanded", !refs.eventDatePicker.hidden && column === "month");
  refs.eventYearLabel.setAttribute("aria-expanded", !refs.eventDatePicker.hidden && column === "year");
  refs.eventDatePicker.querySelector('[data-picker-column="month"]').hidden = refs.eventDatePicker.hidden || column !== "month";
  refs.eventDatePicker.querySelector('[data-picker-column="year"]').hidden = refs.eventDatePicker.hidden || column !== "year";
  if (!refs.eventDatePicker.hidden) document.getElementById(column === "month" ? "eventMonthPicker" : "eventYearPicker").querySelector(".selected")?.scrollIntoView({ block: "center" });
}

function closeEventDatePicker() {
  refs.eventDatePicker.hidden = true;
  refs.eventMonthLabel.setAttribute("aria-expanded", "false");
  refs.eventYearLabel.setAttribute("aria-expanded", "false");
  refs.eventDatePicker.querySelector('[data-picker-column="month"]').hidden = true;
  refs.eventDatePicker.querySelector('[data-picker-column="year"]').hidden = true;
}

function handleDatePickerClick(event) {
  const monthButton = event.target.closest("[data-picker-month]");
  const yearButton = event.target.closest("[data-picker-year]");
  const [currentYear, currentMonth] = eventMonthValue.split("-").map(Number);
  if (monthButton) setEventMonth(`${currentYear}-${String(Number(monthButton.dataset.pickerMonth)).padStart(2, "0")}`);
  if (yearButton) setEventMonth(`${Number(yearButton.dataset.pickerYear)}-${String(currentMonth).padStart(2, "0")}`);
  closeEventDatePicker();
}

function datesBetween(startDate, endDate) {
  const dates = new Set();
  const cursor = new Date(`${startDate}T00:00:00`);
  const lastDate = new Date(`${endDate}T00:00:00`);
  while (cursor <= lastDate) {
    dates.add(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderEvents() {
  if (!selectedEventId && state.events.length) selectedEventId = state.events[0].id;
  refs.eventList.innerHTML = state.events.length
    ? state.events.map((savedEvent) => {
      const eventDates = getEventDateRange(savedEvent);
      return `
        <article class="event-item${savedEvent.id === selectedEventId ? " active" : ""}">
          <button class="event-select" type="button" data-select-event="${savedEvent.id}">
            <strong>${escapeHtml(savedEvent.name)}</strong>
            <span>${formatDate(eventDates[0])} - ${formatDate(eventDates[eventDates.length - 1])}</span>
          </button>
          <div class="event-actions">
            <button class="icon-button" type="button" data-edit-event="${savedEvent.id}" aria-label="Edit ${escapeHtml(savedEvent.name)}" title="Edit event">✎</button>
            <button class="icon-button delete-icon" type="button" data-delete-event="${savedEvent.id}" aria-label="Delete ${escapeHtml(savedEvent.name)}" title="Delete event">&#128465;</button>
          </div>
        </article>
      `;
    }).join("")
    : `<p class="budget-meta">Your event segments will appear here.</p>`;

  const savedEvent = state.events.find((item) => item.id === selectedEventId);
  if (!savedEvent) {
    refs.eventSummaryTitle.textContent = "Event summary";
    refs.eventSummarySubtitle.textContent = "Create an event to analyze selected days.";
    refs.eventStats.innerHTML = "";
    refs.eventTransactions.innerHTML = "";
    drawEventChart({}, null);
    return;
  }

  const eventSpendings = state.spendings.filter((spending) => savedEvent.dates.includes(spending.date));
  const totalsByCategory = groupTotals(eventSpendings);
  const eventDates = getEventDateRange(savedEvent);
  const selectedBudgets = getBudgetsForMonth(savedEvent.month);
  const fallbackBudget = state.monthlyTotals[savedEvent.month] ?? Object.values(selectedBudgets).reduce((total, amount) => {
    const daysInMonth = new Date(Number(savedEvent.month.slice(0, 4)), Number(savedEvent.month.slice(5, 7)), 0).getDate();
    return total + (amount * savedEvent.dates.length) / daysInMonth;
  }, 0);
  const selectedBudget = Number.isFinite(Number(savedEvent.budget)) ? Number(savedEvent.budget) : fallbackBudget;
  const spent = sum(eventSpendings.map((spending) => spending.amount));
  const eventStatusClass = getBudgetStatusClass(spent, selectedBudget);
  refs.eventSummaryTitle.textContent = savedEvent.name;
  refs.eventSummarySubtitle.textContent = `${formatDate(eventDates[0])} - ${formatDate(eventDates[eventDates.length - 1])} (${savedEvent.dates.length} days)`;
  refs.eventStats.innerHTML = `
    <div><span>Selected budget</span><strong>${formatMoney(selectedBudget)}</strong></div>
    <div><span>Budget remaining</span><strong class="${eventStatusClass}">${formatMoney(Math.max(selectedBudget - spent, 0))}</strong></div>
  `;
  drawEventChart(totalsByCategory, spent);
  refs.eventTransactions.innerHTML = eventSpendings.length
    ? eventSpendings.map((spending) => `<div class="event-transaction"><span>${escapeHtml(spending.category)}${spending.note ? ` • ${escapeHtml(spending.note)}` : ""}</span><strong class="${getBudgetStatusClass(spent, selectedBudget)}">${formatMoney(spending.amount)}</strong></div>`).join("")
    : `<p class="budget-meta">No spending falls on the selected days yet.</p>`;
}

function getEventDateRange(savedEvent) {
  return [...savedEvent.dates].sort();
}

function drawEventChart(totalsByCategory, totalSpending = null) {
  const entries = Object.entries(totalsByCategory).filter(([, value]) => value > 0);
  const canvas = refs.eventChart;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.38;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(center, center, radius + 14, 0, Math.PI * 2);
  ctx.fill();
  if (!entries.length) {
    ctx.fillStyle = "#95a3bf";
    ctx.font = "600 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("No event spending", center, center);
    refs.eventChartLegend.innerHTML = `<p class="budget-meta">Selected-day spending will appear here.</p>`;
    return;
  }
  const total = sum(entries.map(([, value]) => value));
  let start = -Math.PI / 2;
  entries.forEach(([category, value], index) => {
    const end = start + (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fill();
    start = end;
  });
  ctx.fillStyle = "#0b1120";
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.56, 0, Math.PI * 2);
  ctx.fill();
  if (totalSpending !== null) {
    ctx.fillStyle = "#95a3bf";
    ctx.font = "600 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Total spending", center, center - 9);
    ctx.fillStyle = "#e5eefc";
    ctx.font = "700 18px system-ui";
    ctx.fillText(formatMoney(totalSpending), center, center + 17);
  }
  refs.eventChartLegend.innerHTML = entries.map(([category, value], index) => `
    <div class="legend-item"><div class="legend-row"><div style="display:flex;align-items:center;gap:.65rem;"><span class="legend-swatch" style="background:${COLORS[index % COLORS.length]}"></span><strong>${escapeHtml(category)}</strong></div><span>${formatMoney(value)}</span></div></div>
  `).join("");
}

function renderCategories() {
  const categories = [...new Set([
    ...EXPENSE_CATEGORIES,
    ...Object.keys(getBudgetsForMonth(todayValue().slice(0, 7)))
  ])].filter((category) => category !== "Transport")
    .sort((a, b) => a.localeCompare(b))
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");

  refs.categoryOptions.innerHTML = categories;
}

function groupTotals(spendings) {
  return spendings.reduce((acc, spending) => {
    acc[spending.category] = (acc[spending.category] || 0) + spending.amount;
    return acc;
  }, {});
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function getBudgetsForMonth(month) {
  if (state.monthlyBudgets[month]) return state.monthlyBudgets[month];
  return state.budgets;
}

function getBudgetTotalForMonth(month) {
  return state.monthlyTotals[month] ?? sum(Object.values(getBudgetsForMonth(month)));
}

function getBudgetStatusClass(spent, budget) {
  if (!Number.isFinite(budget)) return "budget-ok";
  return spent > budget ? "budget-over" : "budget-ok";
}

function formatMoney(baseAmount) {
  const currency = state.currency || DEFAULT_CURRENCY;
  const convertedAmount = baseAmount * (rates[currency] || FALLBACK_RATES[currency] || 1);
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(convertedAmount);
}

function toBaseAmount(displayAmount) {
  const currency = state.currency || DEFAULT_CURRENCY;
  return displayAmount / (rates[currency] || FALLBACK_RATES[currency] || 1);
}

function fromBaseAmount(baseAmount) {
  const currency = state.currency || DEFAULT_CURRENCY;
  return (baseAmount * (rates[currency] || FALLBACK_RATES[currency] || 1)).toFixed(2);
}

function populateCurrencyOptions() {
  refs.currencyMenu.innerHTML = CURRENCY_OPTIONS
    .map(([code, name]) => `
      <button class="currency-option" type="button" data-currency="${code}" role="option">
        <img src="${flagImageUrl(code)}" alt="" loading="lazy" />
        <span><strong>${code}</strong><small>${name}</small></span>
      </button>
    `)
    .join("");
}

function updateCurrencyButton() {
  const option = CURRENCY_OPTIONS.find(([code]) => code === state.currency) || CURRENCY_OPTIONS[0];
  refs.currencyLabel.textContent = option[0];
  refs.currencyFlag.src = flagImageUrl(option[0]);
  refs.currencyFlag.alt = `${option[1]} flag`;
  refs.currencyMenu.querySelectorAll("[data-currency]").forEach((currencyOption) => {
    const isSelected = currencyOption.dataset.currency === option[0];
    currencyOption.classList.toggle("selected", isSelected);
    currencyOption.setAttribute("aria-selected", String(isSelected));
  });
}

function flagImageUrl(currency) {
  return `https://flagcdn.com/w40/${CURRENCY_FLAGS[currency].toLowerCase()}.png`;
}

function loadRates() {
  try {
    const saved = JSON.parse(localStorage.getItem(RATES_STORAGE_KEY));
    if (saved?.rates && typeof saved.rates === "object") return { ...FALLBACK_RATES, ...saved.rates };
  } catch (error) {
    console.warn("Using backup currency rates.", error);
  }
  return { ...FALLBACK_RATES };
}

async function refreshRates() {
  const symbols = CURRENCY_OPTIONS.map(([code]) => code).filter((code) => code !== BASE_CURRENCY).join(",");
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${symbols}`);
    if (!response.ok) throw new Error(`Rate request failed: ${response.status}`);
    const result = await response.json();
    rates = { ...FALLBACK_RATES, ...(result.rates || {}), USD: 1 };
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify({ fetchedAt: Date.now(), rates }));
    rateSource = "online rates";
    render();
  } catch (error) {
    console.warn("Using cached currency rates.", error);
  }
}

function sameMonth(dateString, date) {
  const spentDate = new Date(dateString);
  return spentDate.getFullYear() === date.getFullYear() && spentDate.getMonth() === date.getMonth();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateString));
}

function formatMonth(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneDefaultState();

  try {
    const parsed = JSON.parse(raw);
    const budgets = { ...defaultState.budgets, ...(parsed.budgets || {}) };
    delete budgets.Transport;
    const monthlyBudgets = parsed.monthlyBudgets && typeof parsed.monthlyBudgets === "object"
      ? Object.fromEntries(Object.entries(parsed.monthlyBudgets).map(([month, monthBudgets]) => {
        const cleanedBudgets = { ...monthBudgets };
        delete cleanedBudgets.Transport;
        return [month, cleanedBudgets];
      }))
      : {};
    return {
      budgets,
      monthlyBudgets,
      monthlyTotals: parsed.monthlyTotals && typeof parsed.monthlyTotals === "object" ? parsed.monthlyTotals : {},
      spendings: Array.isArray(parsed.spendings) ? parsed.spendings : [],
      incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
      currency: CURRENCY_OPTIONS.some(([code]) => code === parsed.currency) ? parsed.currency : DEFAULT_CURRENCY
    };
  } catch (error) {
    console.error("Failed to read saved finance data.", error);
    localStorage.removeItem(STORAGE_KEY);
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  await navigator.serviceWorker.register("sw.js");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `spending-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneDefaultState() {
  return {
    budgets: { ...defaultState.budgets },
    monthlyBudgets: {},
    monthlyTotals: {},
    spendings: [],
    incomes: [],
    goals: [],
    events: [],
    currency: DEFAULT_CURRENCY
  };
}
