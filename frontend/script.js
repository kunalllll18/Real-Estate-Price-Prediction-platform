document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city');
    const form = document.getElementById('prediction-form');
    const resultContainer = document.getElementById('result-container');
    const predictedPriceSpan = document.getElementById('predicted-price');
    const predictBtn = document.querySelector('.predict-btn');

    const API_URL = 'http://127.0.0.1:5001';

    // Fetch cities on load
    async function fetchCities() {
        try {
            const response = await fetch(`${API_URL}/cities`);
            const data = await response.json();

            if (!response.ok || !data.cities || data.cities.length === 0) {
                throw new Error('Failed to load cities from backend');
            }

            if (data.cities) {
                data.cities.sort().forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Fallback cities
            ['Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai'].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    }

    fetchCities();

    // Initialize Trends Chart
    const ctx = document.getElementById('trendsChart').getContext('2d');
    const trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['JAN 2020', 'JAN 2021', 'JAN 2022', 'JAN 2023', 'JAN 2024'],
            datasets: [{
                label: 'Market Price Index',
                data: [65, 78, 72, 85, 94],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const area = document.getElementById('area').value;
        const bhk = document.getElementById('bhk').value;
        const bath = document.getElementById('bath').value;
        const city = citySelect.value;

        if (!area || !bhk || !city) return;

        predictBtn.textContent = 'Analyzing Market...';
        predictBtn.disabled = true;
        resultContainer.classList.add('hidden');

        try {
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ area, bhk, city, bath }),
            });

            const data = await response.json();

            if (data.predicted_price) {
                const priceInLakhs = (data.predicted_price / 100000).toFixed(2);
                predictedPriceSpan.textContent = `₹ ${priceInLakhs} Lakhs`;
                resultContainer.classList.remove('hidden');

                // Smooth scroll to result
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert('Analysis Error: ' + (data.error || 'Could not calculate price'));
            }
        } catch (error) {
            console.error('Error predicting price:', error);
            alert('Prediction server is offline. Please start the backend.');
        } finally {
            predictBtn.textContent = 'Predict Price';
            predictBtn.disabled = false;
        }
    });
});
