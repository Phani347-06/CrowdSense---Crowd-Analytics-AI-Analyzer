/**
 * CrowdSense Interactive Logic
 */

// --- Mock Data ---
const regions = [
    {
        id: 'lib',
        name: 'Main Library',
        x: '35%', y: '45%',
        capacity: 500,
        current: 425,
        status: 'High Congestion',
        statusColor: 'text-danger',
        peak: '2:00 PM',
        dwell: '45 mins',
        deviceType: 'Mobile',
        trend: [40, 60, 45, 70, 55, 80, 95, 85, 65] // Mock trend data
    },
    {
        id: 'canteen',
        name: 'Student Canteen',
        x: '60%', y: '55%',
        capacity: 200,
        current: 120,
        status: 'Moderate',
        statusColor: 'text-warning',
        peak: '1:00 PM',
        dwell: '30 mins',
        deviceType: 'Mobile',
        trend: [20, 30, 50, 80, 90, 70, 60, 40, 30]
    },
    {
        id: 'labs',
        name: 'Science Labs',
        x: '25%', y: '65%',
        capacity: 150,
        current: 45,
        status: 'Low Activity',
        statusColor: 'text-success',
        peak: '11:00 AM',
        dwell: '120 mins',
        deviceType: 'Laptop',
        trend: [10, 20, 40, 50, 40, 30, 20, 10, 5]
    },
    {
        id: 'sports',
        name: 'Sports Complex',
        x: '75%', y: '30%',
        capacity: 300,
        current: 80,
        status: 'Low Activity',
        statusColor: 'text-success',
        peak: '5:00 PM',
        dwell: '60 mins',
        deviceType: 'Wearable',
        trend: [5, 10, 15, 20, 25, 40, 60, 80, 90]
    },
    {
        id: 'audi',
        name: 'Auditorium',
        x: '50%', y: '20%',
        capacity: 1000,
        current: 50,
        status: 'Closed',
        statusColor: 'text-muted',
        peak: '10:00 AM',
        dwell: '0 mins',
        deviceType: 'None',
        trend: [0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Current Date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        dateEl.innerText = now.toLocaleDateString('en-US', options);
    }

    if (window.location.pathname.includes('overview.html')) {
        initOverview();
    } else if (window.location.pathname.includes('events.html')) {
        initEvents();
    }

    initTheme();
});

let mainChart; // Global reference to update

function initOverview() {
    renderMap();
    initSearch();
    initMainChart();

    // Select first region by default
    selectRegion(regions[0]);

    // Export Button
    document.getElementById('exportBtn').addEventListener('click', () => {
        alert('Exporting report as CSV...');
    });

    // Dropdown Logic
    const dropdownBtn = document.getElementById('detailsMenuBtn');
    const dropdownMenu = document.getElementById('detailsDropdown');

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

// --- Map Logic ---
let zoomLevel = 1;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;
let initialPinchDistance = 0;
let initialZoom = 1;

function renderMap() {
    const mapVisual = document.getElementById('mapVisual');
    const mapContainer = document.querySelector('.map-container');
    if (!mapVisual || !mapContainer) return;

    // Zoom Controls (Buttons)
    const zoomInBtn = document.getElementById('mapZoomIn');
    const zoomOutBtn = document.getElementById('mapZoomOut');

    if (zoomInBtn) {
        zoomInBtn.onclick = (e) => {
            e.stopPropagation();
            setZoom(zoomLevel + 0.2);
        };
    }

    if (zoomOutBtn) {
        zoomOutBtn.onclick = (e) => {
            e.stopPropagation();
            setZoom(zoomLevel - 0.2);
        };
    }

    // --- Mouse Events (Pan & Wheel) ---
    mapContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        mapVisual.style.cursor = 'grabbing';
    });

    mapContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    mapContainer.addEventListener('mouseup', () => {
        isDragging = false;
        mapVisual.style.cursor = 'grab';
    });

    mapContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        mapVisual.style.cursor = 'grab';
    });

    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoomLevel + delta);
    });

    // --- Touch Events (Pinch & Pan) ---
    mapContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // Pan Start
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            // Pinch Start
            isDragging = false;
            initialPinchDistance = getPinchDistance(e);
            initialZoom = zoomLevel;
        }
    });

    mapContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            // Pan Move
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        } else if (e.touches.length === 2) {
            // Pinch Move
            const currentDistance = getPinchDistance(e);
            const scaleChange = currentDistance / initialPinchDistance;
            setZoom(initialZoom * scaleChange);
        }
    });

    mapContainer.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Initial Markers
    renderMarkers(mapVisual);
}

function renderMarkers(mapVisual) {
    // Clear existing markers
    const markers = mapVisual.querySelectorAll('.marker');
    markers.forEach(m => m.remove());

    regions.forEach(region => {
        const marker = document.createElement('div');
        marker.className = `marker ${getMarkerColorClass(region.status)}`;
        marker.style.left = region.x;
        marker.style.top = region.y;
        marker.dataset.id = region.id;

        marker.innerHTML = `
            <div class="marker-pulse"></div>
            <div class="marker-center"></div>
        `;

        marker.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent drag start
            selectRegion(region);
        });
        mapVisual.appendChild(marker);
    });
}

function setZoom(newZoom) {
    // Strict Zoom Limits
    zoomLevel = Math.min(4, Math.max(0.5, newZoom));
    zoomLevel = parseFloat(zoomLevel.toFixed(2)); // Avoid precision issues
    updateTransform();
}

function updateTransform() {
    const mapVisual = document.getElementById('mapVisual');
    if (mapVisual) {
        mapVisual.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }
}

function getPinchDistance(e) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
}

function getMarkerColorClass(status) {
    if (status.includes('High')) return 'marker-red';
    if (status.includes('Moderate')) return 'marker-amber';
    return 'marker-green';
}

function selectRegion(region) {
    // Highlight Marker
    document.querySelectorAll('.marker').forEach(m => m.classList.remove('active'));
    const activeMarker = document.querySelector(`.marker[data-id="${region.id}"]`);
    if (activeMarker) activeMarker.classList.add('active');

    // Update Details Panel
    document.getElementById('detailName').innerText = region.name;

    const statusEl = document.getElementById('detailStatus');
    statusEl.className = 'congestion-status ' + region.statusColor;
    statusEl.innerHTML = `<i class="fa-solid fa-circle"></i> ${region.status}`;

    document.getElementById('detailCapacity').innerText = `${Math.round((region.current / region.capacity) * 100)}%`;
    document.getElementById('detailPeak').innerText = region.peak;
    document.getElementById('detailDwell').innerText = region.dwell;
    document.getElementById('detailDevice').innerHTML = `<i class="fa-solid fa-mobile-screen"></i> 92% ${region.deviceType}`;

    // Update Mini Chart
    renderMiniChart(region.trend);
}

function renderMiniChart(data) {
    const container = document.getElementById('detailChartContainer');
    container.innerHTML = ''; // Clear

    const chart = document.createElement('div');
    chart.className = 'bar-chart';

    data.forEach((val, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (index === 6) bar.className += ' active'; // "Now" bar mock position
        if (index > 6) bar.className += ' dashed'; // Predicted bars

        bar.style.height = `${val}%`;

        if (index === 6) {
            bar.innerHTML = `
                <span class="bar-badge">Now</span>
                <div class="bar-tooltip">Live: ${val}%</div>
            `;
        } else if (index > 6) {
            bar.innerHTML = `<div class="bar-tooltip">Predicted: ${val}%</div>`;
        } else {
            bar.innerHTML = `<div class="bar-tooltip">Actual: ${val}%</div>`;
        }

        // Remove title attribute to prevent double tooltip
        bar.removeAttribute('title');

        chart.appendChild(bar);
    });

    container.appendChild(chart);
}

// --- Search Logic ---
function initSearch() {
    const input = document.getElementById('regionSearch');
    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        // Filter Markers
        const markers = document.querySelectorAll('.marker');
        markers.forEach(m => {
            const region = regions.find(r => r.id === m.dataset.id);
            if (region && region.name.toLowerCase().includes(term)) {
                m.style.opacity = '1';
                m.style.display = 'block';
            } else {
                m.style.opacity = '0.2';
            }
        });
    });
}

// --- Main Chart Logic ---
function initMainChart() {
    const ctx = document.getElementById('campusOverviewChart');
    if (!ctx) return;

    const canvas = ctx.getContext('2d');

    // Gradient
    const gradient = canvas.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    const dataActual = [650, 800, 1200, 1450, 1600, 1550, 1400, 1200, 950, 800];
    const dataPredicted = [600, 850, 1150, 1500, 1650, 1600, 1450, 1250, 1000, 850];
    const labels = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    mainChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual',
                    data: dataActual,
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'Predicted',
                    data: dataPredicted,
                    borderColor: '#9ca3af',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#f3f4f6', drawBorder: false }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });

    // Toggles
    document.getElementById('toggleAll').addEventListener('click', (e) => toggleChartData(e, [true, true]));
    document.getElementById('toggleActual').addEventListener('click', (e) => toggleChartData(e, [true, false]));
    document.getElementById('togglePredicted').addEventListener('click', (e) => toggleChartData(e, [false, true]));
}

function toggleChartData(e, visibility) {
    // Update Active Pill
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    // Update Chart
    if (mainChart) {
        mainChart.data.datasets[0].hidden = !visibility[0];
        mainChart.data.datasets[1].hidden = !visibility[1];
        mainChart.update();
    }
}

// --- Event Management Logic ---

function initEvents() {
    renderEventCards();
    renderAlertHistory();
}

function renderEventCards() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    regions.forEach((region, index) => {
        // Mock specific data props for events view if missing
        const isCritical = region.status.includes('High');
        const isWarning = region.status.includes('Moderate');
        const load = Math.round((region.current / region.capacity) * 100);

        // Styling based on status
        let statusBadgeClass = 'event-status-normal';
        let statusIcon = '<i class="fa-solid fa-circle"></i> Normal';
        let iconBg = 'bg-blue-dark';
        let barColor = '#4ade80';

        if (isCritical) {
            statusBadgeClass = 'event-status-critical';
            statusIcon = '<i class="fa-solid fa-circle"></i> Critical';
            iconBg = 'bg-orange-dark'; // Just using orange for high contrast or define red
            barColor = '#f87171';
            iconBg = 'rgba(239, 68, 68, 0.2); color: #f87171';
        } else if (isWarning) {
            statusBadgeClass = 'event-status-warning';
            statusIcon = '<i class="fa-solid fa-circle"></i> Warning';
            iconBg = 'bg-purple-dark'; // visual variety
            barColor = '#facc15';
            iconBg = 'rgba(234, 179, 8, 0.2); color: #facc15';
        }

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-card-header">
                <div>
                    <div class="event-icon-box" style="background: ${iconBg.split(';')[0]}; color: ${iconBg.split('color:')[1] || 'inherit'}">
                         <i class="fa-solid ${getRegionIcon(region.deviceType)}"></i>
                    </div>
                    <h3 style="font-size: 1.1rem; margin:0;">${region.name}</h3>
                    <div style="font-size: 0.8rem; color: #94a3b8;">Zone ${String.fromCharCode(65 + index)} • Floor ${index + 1}</div>
                </div>
                <div class="${statusBadgeClass}">
                    ${statusIcon}
                </div>
            </div>

            <div class="event-main-stat">
                <div class="event-count">${region.current}</div>
                <div class="event-sub-stat">
                    <span>Current Devices</span>
                    <span>${load}% Load</span>
                </div>
            </div>

            <div class="capacity-bar-container">
                <div class="capacity-bar-fill" style="width: ${load}%; background-color: ${barColor};"></div>
            </div>

            <div class="slider-group">
                <div class="slider-label">
                    <span>Max Capacity</span>
                    <span id="capValue-${region.id}">${region.capacity}</span>
                </div>
                <input type="range" min="50" max="2000" value="${region.capacity}" class="capacity-slider" 
                    oninput="document.getElementById('capValue-${region.id}').innerText = this.value">
            </div>

            <div class="alert-toggle-row">
                <span>Alerts</span>
                <label class="switch">
                    <input type="checkbox" ${isCritical || isWarning ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
        grid.appendChild(card);
    });
}

function getRegionIcon(type) {
    if (type === 'Mobile') return 'fa-mobile-screen';
    if (type === 'Laptop') return 'fa-laptop';
    if (type === 'Wearable') return 'fa-stopwatch';
    return 'fa-layer-group';
}

// --- Theme Switcher Logic ---

function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const html = document.documentElement;
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;
    const text = toggleBtn ? toggleBtn.querySelector('span') : null;

    // Load Preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        updateToggleUI(true);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isDark = html.getAttribute('data-theme') === 'dark';

            if (isDark) {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                updateToggleUI(false);
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateToggleUI(true);
            }
        });
    }

    function updateToggleUI(isDark) {
        if (!icon || !text) return;
        if (isDark) {
            icon.className = 'fa-solid fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fa-solid fa-moon';
            text.textContent = 'Dark Mode';
        }
    }
}

