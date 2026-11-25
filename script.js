// Simple JavaScript for the Campus Event Portal student project.
// localStorage keeps the demo data in this browser on this computer.

const eventKey = "studentPortalEvents";
const registrationKey = "studentPortalRegistrations";

const sampleEvents = [
  { id: "hackathon", name: "Hackathon", type: "Technical", date: "November 15, 2026 at 2:00 PM", venue: "BYOD rooms in Block 28", eligibility: "Open to all students", capacity: 40, registered: 28, description: "Code your way." },
  { id: "spectra", name: "Spectra", type: "Cultural", date: "November 21, 2026 at 4:00 PM", venue: "Mittal Auditorium", eligibility: "Open to all students", capacity: 200, registered: 165, description: "Inter school Cultural performances." },
  { id: "football", name: "MNIT vs LPU Football Match", type: "Sports", date: "November 28, 2026 at 7:30 PM", venue: "University's Sports Ground", eligibility: "Open to all students", capacity: 80, registered: 72, description: "Come and support our college football team." },
  { id: "debate", name: "Frank Anthony Debate Competiton", type: "Competition", date: "December 4, 2026 at 10:00 AM", venue: "Mittal Auditorium", eligibility: "First-year students", capacity: 200, registered: 130, description: "A battle fought with just words." }
];

function readSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

let portalEvents = readSaved(eventKey, sampleEvents);
let portalRegistrations = readSaved(registrationKey, []);

function savePortalData() {
  localStorage.setItem(eventKey, JSON.stringify(portalEvents));
  localStorage.setItem(registrationKey, JSON.stringify(portalRegistrations));
}

function seatsLeft(event) {
  return Math.max(0, Number(event.capacity) - Number(event.registered));
}

function findEvent(id) {
  return portalEvents.find((event) => event.id === id);
}

// Update the seat counts shown on the home, events and event detail pages.
document.querySelectorAll("[data-event-id]").forEach((item) => {
  const event = findEvent(item.dataset.eventId);
  if (!event) return;
  const availability = item.querySelector(".event-availability");
  if (availability) availability.textContent = `Seats available: ${seatsLeft(event)} of ${event.capacity}`;

  const meta = item.querySelector(".event-meta");
  if (meta) meta.textContent = `${event.venue} : ${event.date} : Seats: ${seatsLeft(event)} / ${event.capacity} available`;

  const seatLine = Array.from(item.querySelectorAll("p")).find((paragraph) => paragraph.textContent.includes("Seats available:"));
  if (seatLine && !availability) seatLine.textContent = `Seats available: ${seatsLeft(event)} of ${event.capacity}`;
});

// Filter event cards by category.
const filter = document.querySelector("#event-filter");
if (filter) {
  filter.addEventListener("change", () => {
    document.querySelectorAll(".event-list .event-card").forEach((card) => {
      card.hidden = filter.value !== "all" && card.dataset.category !== filter.value;
    });
  });
}

// Add any new events created by the organizer to the events page.
const eventList = document.querySelector(".event-list");
if (eventList) {
  portalEvents.filter((event) => !document.querySelector(`[data-event-id="${event.id}"]`)).forEach((event) => {
    const card = document.createElement("article");
    card.className = "event-card";
    card.dataset.eventId = event.id;
    card.dataset.category = event.type;
    const dateBox = document.createElement("div");
    dateBox.className = "event-date";
    const day = document.createElement("strong");
    day.textContent = "NEW";
    const month = document.createElement("span");
    month.textContent = "EVENT";
    dateBox.append(day, month);
    const info = document.createElement("div");
    info.className = "event-info";
    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = event.type;
    const title = document.createElement("h2");
    title.textContent = event.name;
    const description = document.createElement("p");
    description.textContent = event.description;
    const availability = document.createElement("p");
    availability.className = "event-meta";
    availability.textContent = `${event.venue} : ${event.date} : Seats: ${seatsLeft(event)} / ${event.capacity} available`;
    const register = document.createElement("a");
    register.href = `registration.html?event=${encodeURIComponent(event.id)}`;
    register.textContent = "Register";
    info.append(category, title, description, availability, register);
    card.append(dateBox, info);
    eventList.appendChild(card);
  });
}

// Show event details and available places on the registration page.
const eventChoice = document.querySelector("#event-choice");
const selectedInfo = document.querySelector("#selected-event-info");
if (eventChoice) {
  portalEvents.forEach((event) => {
    const option = eventChoice.querySelector(`option[value="${event.id}"]`);
    if (option) option.textContent = `${event.name} (${seatsLeft(event)} seats left)`;
    else {
      const newOption = document.createElement("option");
      newOption.value = event.id;
      newOption.textContent = `${event.name} (${seatsLeft(event)} seats left)`;
      eventChoice.appendChild(newOption);
    }
  });

  const requestedEvent = new URLSearchParams(window.location.search).get("event");
  if (findEvent(requestedEvent)) eventChoice.value = requestedEvent;

  function updateSelectedEvent() {
    const event = findEvent(eventChoice.value);
    if (!event) return;
    selectedInfo.textContent = `Selected event: ${event.name} · ${event.date} · Place: ${event.venue} · Seats available: ${seatsLeft(event)} of ${event.capacity} · Eligibility: ${event.eligibility}`;
  }
  eventChoice.addEventListener("change", updateSelectedEvent);
  updateSelectedEvent();
}

// Save a registration and reduce the seats left for that event.
const registrationForm = document.querySelector("#registration-form");
if (registrationForm) {
  registrationForm.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    const event = findEvent(eventChoice.value);
    const message = document.querySelector("#registration-message");
    if (!event) {
      message.textContent = "Please select an event.";
      message.classList.add("error");
      return;
    }
    if (seatsLeft(event) === 0) {
      message.textContent = "This event is full. Please choose another one.";
      message.classList.add("error");
      return;
    }
    const formData = new FormData(registrationForm);
    const registration = {
      name: formData.get("name"),
      email: formData.get("email"),
      studentId: formData.get("studentId"),
      eventId: event.id,
      number: `CEP-${Date.now()}`
    };
    event.registered = Number(event.registered) + 1;
    portalRegistrations.push(registration);
    savePortalData();
    sessionStorage.setItem("lastPortalRegistration", JSON.stringify(registration));
    window.location.href = "confirmation.html";
  });
}

// Fill out the confirmation page and allow it to be printed.
const confirmationName = document.querySelector("#confirm-name");
if (confirmationName) {
  let registration = null;
  try { registration = JSON.parse(sessionStorage.getItem("lastPortalRegistration") || "null"); } catch (error) { registration = null; }
  const note = document.querySelector("#confirmation-note");
  if (registration) {
    const event = findEvent(registration.eventId);
    confirmationName.textContent = registration.name;
    document.querySelector("#confirm-student-id").textContent = registration.studentId;
    document.querySelector("#confirm-event").textContent = event ? event.name : "Event";
    document.querySelector("#confirm-number").textContent = registration.number;
    note.textContent = "Print this page or save it as a PDF for your records.";
  } else {
    document.querySelector("#confirm-status").textContent = "No recent registration found";
    note.textContent = "Please fill in the registration form first.";
  }
}

const printButton = document.querySelector("#print-button");
if (printButton) printButton.addEventListener("click", () => window.print());

// Save an organizer's new event in the browser.
const createEventForm = document.querySelector("#create-event-form");
if (createEventForm) {
  createEventForm.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    const form = new FormData(createEventForm);
    const name = form.get("eventName").trim();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const message = document.querySelector("#create-event-message");
    if (portalEvents.some((event) => event.id === id)) {
      message.textContent = "An event with this name already exists. Please choose another name.";
      message.classList.add("error");
      return;
    }
    portalEvents.push({
      id,
      name,
      type: form.get("eventType"),
      date: form.get("eventDate"),
      venue: form.get("venue"),
      description: form.get("description"),
      eligibility: form.get("eligibility") || "Open to all students",
      capacity: Number(form.get("seatLimit")),
      registered: 0
    });
    savePortalData();
    window.location.href = "dashboard.html";
  });
}

// Update event counts and show registrations on the organizer dashboard.
const dashboardRows = document.querySelectorAll("#dashboard-events tr[data-event-id]");
dashboardRows.forEach((row) => {
  const event = findEvent(row.dataset.eventId);
  if (!event) return;
  const cells = row.querySelectorAll("td");
  cells[3].textContent = event.registered;
  cells[4].textContent = event.capacity;
  cells[5].textContent = seatsLeft(event) === 0 ? "Full" : seatsLeft(event) <= 10 ? "Almost full" : "Open";
});

const dashboardTable = document.querySelector("#dashboard-events tbody");
if (dashboardTable) {
  portalEvents.filter((event) => !findEventInTable(event.id)).forEach((event) => {
    const row = document.createElement("tr");
    row.dataset.eventId = event.id;
    [event.name, event.date, event.venue, event.registered, event.capacity, seatsLeft(event) === 0 ? "Full" : "Open"].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    dashboardTable.appendChild(row);
  });
}

function findEventInTable(id) {
  return Boolean(document.querySelector(`#dashboard-events [data-event-id="${id}"]`));
}

const recentRegistrationTable = document.querySelector("#dashboard-registrations");
if (recentRegistrationTable) {
  portalRegistrations.slice().reverse().forEach((registration) => {
    const event = findEvent(registration.eventId);
    const row = document.createElement("tr");
    [registration.name, registration.studentId, event ? event.name : "Event", "Registered"].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    recentRegistrationTable.appendChild(row);
  });
}

// Show the most recent registration as a small dashboard notification.
const notificationList = document.querySelector("#dashboard-notifications");
if (notificationList && portalRegistrations.length > 0) {
  const latest = portalRegistrations[portalRegistrations.length - 1];
  const event = findEvent(latest.eventId);
  const item = document.createElement("li");
  item.textContent = `New registration: ${latest.name} for ${event ? event.name : "an event"}.`;
  notificationList.prepend(item);
}

// This is only a front-end login example; it does not check a real account.
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    const email = document.querySelector("#login-email").value;
    document.querySelector("#login-message").textContent = `Welcome, ${email}. This is a demo login.`;
  });
}
