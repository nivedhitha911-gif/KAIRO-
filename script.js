
/* =====================================
   KAIRO - COMMAND CENTRE JAVASCRIPT
===================================== */

// 1. MAP INITIALIZATION

const chennaiCenter = [13.0827, 80.2707];

const map = L.map("incidentMap").setView(chennaiCenter, 11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);


// 2. INCIDENT DATA

const demoIncidents = [
    {
        id: "D1",
        title: "Fire Emergency",
        category: "Fire Emergency",
        severity: "Critical",
        location: "T. Nagar, Chennai",
        coordinates: [13.0418, 80.2337],
        description: "Simulated fire incident.",
        status: "Reported",
        isDemo: true
    },
    {
        id: "D2",
        title: "Road Accident",
        category: "Road Accident",
        severity: "High",
        location: "Guindy, Chennai",
        coordinates: [13.0067, 80.2206],
        description: "Simulated road accident.",
        status: "Pending",
        isDemo: true
    },
    {
        id: "D3",
        title: "Medical Emergency",
        category: "Medical Emergency",
        severity: "Medium",
        location: "Anna Nagar, Chennai",
        coordinates: [13.0850, 80.2101],
        description: "Simulated medical incident.",
        status: "In Progress",
        isDemo: true
    },
    {
        id: "D4",
        title: "Flood Alert",
        category: "Flood",
        severity: "Low",
        location: "Velachery, Chennai",
        coordinates: [12.9750, 80.2210],
        description: "Simulated flood alert.",
        status: "Resolved",
        isDemo: true
    }
];


// Load submitted reports from browser storage

let savedIncidents = [];

try {
    savedIncidents = JSON.parse(
        localStorage.getItem("kairoIncidents")
    ) || [];
} catch (error) {
    savedIncidents = [];
}

let incidents = [...demoIncidents, ...savedIncidents];

let selectedCoordinates = null;


// 3. SEVERITY COLOURS

function getSeverityColor(severity) {

    const colors = {
        Critical: "#FF3658",
        High: "#FF984D",
        Medium: "#42B9FF",
        Low: "#35C99A"
    };

    return colors[severity] || "#42B9FF";
}


// 4. ADD INCIDENT MARKERS TO MAP

const markerLayer = L.layerGroup().addTo(map);

function displayMapMarkers() {

    markerLayer.clearLayers();

    incidents.forEach(function(incident) {

        if (!incident.coordinates) return;

        const marker = L.circleMarker(
            incident.coordinates,
            {
                radius: 10,
                color: getSeverityColor(incident.severity),
                fillColor: getSeverityColor(incident.severity),
                fillOpacity: 0.9,
                weight: 2
            }
        ).addTo(markerLayer);

        // Use text nodes to display report information safely
        const popup = document.createElement("div");

        const heading = document.createElement("strong");
        heading.textContent = incident.title;

        const category = document.createElement("p");
        category.textContent = "Category: " + incident.category;

        const severity = document.createElement("p");
        severity.textContent = "Priority: " + incident.severity;

        const demo = document.createElement("small");
        demo.textContent = incident.isDemo
            ? "SIMULATED INCIDENT"
            : "USER SUBMITTED DEMO REPORT";

        popup.append(heading, category, severity, demo);

        marker.bindPopup(popup);

        marker.on("click", function() {
            showMapDetails(incident);
        });

    });
}


// 5. MAP INFORMATION PANEL

function showMapDetails(incident) {

    const details = document.getElementById("mapIncidentDetails");

    details.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent = incident.title;

    const category = document.createElement("p");
    category.textContent = "Category: " + incident.category;

    const severity = document.createElement("p");
    severity.textContent = "Priority: " + incident.severity;

    const location = document.createElement("p");
    location.textContent = "Location: " + incident.location;

    const status = document.createElement("p");
    status.textContent = "Status: " + incident.status;

    details.append(heading, category, severity, location, status);
}


// 6. SELECT A LOCATION ON THE MAP

map.on("click", function(event) {

    selectedCoordinates = [
        event.latlng.lat,
        event.latlng.lng
    ];

    const locationDisplay =
        document.getElementById("selectedLocation");

    locationDisplay.textContent =
        event.latlng.lat.toFixed(5) +
        ", " +
        event.latlng.lng.toFixed(5);

    document.getElementById("location").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


// 7. DASHBOARD STATISTICS

function updateDashboard() {

    document.getElementById("totalCount").textContent =
        incidents.length;

    document.getElementById("criticalCount").textContent =
        incidents.filter(item => item.severity === "Critical").length;

    document.getElementById("pendingCount").textContent =
        incidents.filter(item =>
            item.status === "Pending" ||
            item.status === "Reported"
        ).length;

    document.getElementById("resolvedCount").textContent =
        incidents.filter(item => item.status === "Resolved").length;


    const categories = [
        ["Fire Emergency", "fireCount"],
        ["Road Accident", "accidentCount"],
        ["Building Collapse", "collapseCount"],
        ["Medical Emergency", "medicalCount"],
        ["Flood", "floodCount"],
        ["Other", "otherCount"]
    ];

    categories.forEach(function(item) {

        const count = incidents.filter(
            incident => incident.category === item[0]
        ).length;

        document.getElementById(item[1]).textContent =
            count + " Reports";

    });

}


// 8. INCIDENT REGISTRY

function renderIncidents() {

    const list = document.getElementById("incidentList");

    const search = document
        .getElementById("searchIncident")
        .value.toLowerCase();

    const filter = document
        .getElementById("filterStatus")
        .value;

    list.replaceChildren();

    const filtered = incidents.filter(function(incident) {

        const matchesSearch =
            incident.title.toLowerCase().includes(search) ||
            incident.location.toLowerCase().includes(search) ||
            incident.category.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || incident.status === filter;

        return matchesSearch && matchesStatus;

    });

    if (filtered.length === 0) {

        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = "No matching incidents found.";

        list.appendChild(empty);
        return;
    }

    filtered.forEach(function(incident) {

        const card = document.createElement("article");
        card.className = "incident-card";

        const content = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "incident-title";
        title.textContent = incident.title;

        const badges = document.createElement("div");
        badges.className = "incident-meta";

        const severity = document.createElement("span");
        severity.className =
            "severity-pill severity-" +
            incident.severity.toLowerCase();
        severity.textContent = incident.severity;

        const category = document.createElement("span");
        category.textContent = "◈ " + incident.category;

        const location = document.createElement("span");
        location.textContent = "⌖ " + incident.location;

        const description = document.createElement("p");
        description.className = "incident-description";
        description.textContent = incident.description;

        badges.append(severity, category, location);
        content.append(title, badges, description);

        const actions = document.createElement("div");
        actions.className = "incident-actions";

        const statusSelect = document.createElement("select");

        ["Reported", "Pending", "In Progress", "Resolved"]
            .forEach(function(status) {

                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;

                if (incident.status === status) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);

            });

        statusSelect.addEventListener("change", function() {

            incident.status = statusSelect.value;

            saveIncidents();
            refreshInterface();

        });

        actions.appendChild(statusSelect);

        // Allow deleting submitted reports only

        if (!incident.isDemo) {

            const deleteButton = document.createElement("button");

            deleteButton.className = "delete-button";
            deleteButton.textContent = "✕ Delete";

            deleteButton.addEventListener("click", function() {

                incidents = incidents.filter(
                    item => item.id !== incident.id
                );

                saveIncidents();
                refreshInterface();

            });

            actions.appendChild(deleteButton);
        }

        card.append(content, actions);
        list.appendChild(card);

    });

}


// 9. SAVE USER REPORTS

function saveIncidents() {

    const userReports = incidents.filter(
        incident => !incident.isDemo
    );

    localStorage.setItem(
        "kairoIncidents",
        JSON.stringify(userReports)
    );

}


// 10. REFRESH THE COMPLETE INTERFACE

function refreshInterface() {

    updateDashboard();
    renderIncidents();
    displayMapMarkers();

}


// 11. EMERGENCY REPORT FORM

const emergencyForm =
    document.getElementById("emergencyForm");

emergencyForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title =
        document.getElementById("incidentTitle").value.trim();

    const category =
        document.getElementById("category").value;

    const location =
        document.getElementById("location").value.trim();

    const people =
        Number(document.getElementById("peopleAffected").value);

    const description =
        document.getElementById("description").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    const message =
        document.getElementById("formMessage");


    if (
        !title ||
        !category ||
        !location ||
        !description ||
        !Number.isInteger(people) ||
        people < 0
    ) {
        message.textContent = "Please enter valid report details.";
        return;
    }


    // Illustrative demo priority only.
    // This is NOT an emergency triage system.

    let severity = "Medium";

    if (
        category === "Fire Emergency" ||
        category === "Building Collapse"
    ) {
        severity = "Critical";
    } else if (people >= 5) {
        severity = "High";
    } else if (people === 0) {
        severity = "Low";
    }


    const newIncident = {

        id: "R" + Date.now(),

        title: title,
        category: category,
        severity: severity,
        location: location,
        coordinates: selectedCoordinates,
        description: description,
        contact: contact,
        status: "Reported",
        isDemo: false

    };


    incidents.push(newIncident);

    saveIncidents();

    refreshInterface();

    message.textContent =
        "✓ Report added successfully! Priority: " +
        severity +
        ". This is a demo classification.";

    emergencyForm.reset();

    selectedCoordinates = null;

    document.getElementById("selectedLocation").textContent =
        "No map location selected";

    if (newIncident.coordinates) {
        map.setView(newIncident.coordinates, 14);
        showMapDetails(newIncident);
    }

    console.log("KAIRO report added:", newIncident);

});


// 12. SEARCH AND FILTER

document
    .getElementById("searchIncident")
    .addEventListener("input", renderIncidents);

document
    .getElementById("filterStatus")
    .addEventListener("change", renderIncidents);


// 13. INITIALIZE KAIRO

refreshInterface();

console.log("✳ KAIRO Command Centre initialized successfully!");
