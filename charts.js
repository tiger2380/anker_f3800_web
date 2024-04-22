const acOutputCanvas = document.getElementById('ac_output').getContext('2d');
const acInputCanvas = document.getElementById('ac_input').getContext('2d');
const solarInputCanvas = document.getElementById('solar_input').getContext('2d');
const batteryCanvas = document.getElementById('battery').getContext('2d');

const acOutputChart = new Chart(acOutputCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'AC Output',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 3,
                pointRadius: 3,
                fill: false,
                pointStyle: false,
                tension: 0.4,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                    color: 'rgb(255, 99, 132)'
                },
                ticks: {
                    color: 'rgb(255, 99, 132)'
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Power (W)',
                    color: 'rgb(255, 99, 132)'
                },
                ticks: {
                    color: 'rgb(255, 99, 132)'
                },
                border: {
                    color: 'rgb(255, 99, 132)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgb(255, 99, 132)'
                }
            },
            title: {
                display: true,
                text: 'AC Output',
                color: 'rgb(255, 99, 132)'
            },
        },
    }
});
window.acOutputChart = acOutputChart;

const solarInputChart = new Chart(solarInputCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'PV Input',
                data: [],
                backgroundColor: 'blue',
                borderColor: 'blue',
                borderWidth: 3,
                pointRadius: 3,
                fill: false,
                pointStyle: false,
                tension: 0.4,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                    color: 'blue'
                },
                ticks: {
                    color: 'blue'
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Power (W)',
                    color: 'blue'
                },
                ticks: {
                    color: 'blue'
                },
                border: {
                    color: 'blue',
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'blue'
                }
            },
            title: {
                display: true,
                text: 'PV Input',
                color: 'blue'
            },
        },
    }
});
window.solarInputChart = solarInputChart;

const batteryChart = new Chart(batteryCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Battery Level',
                data: [],
                backgroundColor: 'green',
                borderColor: 'green',
                borderWidth: 3,
                pointRadius: 3,
                fill: false,
                pointStyle: false,
                tension: 0.4,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                    color: 'green'
                },
                ticks: {
                    color: 'green'
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'SoC (%)',
                    color: 'green'
                },
                ticks: {
                    color: 'green'
                },
                border: {
                    color: 'green'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'green'
                }
            },
            title: {
                display: true,
                text: 'Battery Level',
                color: 'green'
            },
        },
    }
});

window.batteryChart = batteryChart;