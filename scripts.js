document.getElementById('poolForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Validate inputs
  const length = parseFloat(document.getElementById('length').value);
  const width = parseFloat(document.getElementById('width').value);
  const minDepth = parseFloat(document.getElementById('minDepth').value); // New
  const maxDepth = parseFloat(document.getElementById('maxDepth').value); // New
  const unit = document.getElementById('unit').value;

  // New: Calculate the average depth from min and max depths
  const averageDepth = (minDepth + maxDepth) / 2;

  // Check for valid inputs (Updated to remove depth validation)
  if (!length || !width || !minDepth || !maxDepth || length <= 0 || width <= 0 || minDepth <= 0 || maxDepth <= 0) {
    alert('Please enter valid positive numbers for length, width, and depth.');
    return;
  }

  const volume = calculateVolume(length, width, averageDepth, unit); // Updated to use averageDepth
  const chemicals = calculateChemicals(volume);
  
  displayResults(volume, chemicals, unit);
});

function calculateVolume(length, width, depth, unit) {
  if (unit === 'imperial') {
    // Convert feet to meters
    length *= 0.3048;
    width *= 0.3048;
    depth *= 0.3048;
  }
  return length * width * depth; // in cubic meters
}

function calculateChemicals(volume) {
  // Constants for chemical adjustment remain unchanged
  const adjustments = {
    'To chlorinate per 1mg/l starting from zero chlorine': {
      'HTH Cal hypo Granules': { amount: 1.5, unit: 'g' },
      'Fi-Clor Granules': { amount: 1.8, unit: 'g' },
      'Fi-Gard 90': { amount: 1.1, unit: 'g' }
    },
    'To dechlorinate per 1mg/l': {
      'Sodium Thiosulphate': { amount: 5, unit: 'g' },
      'Sodium Percarbonate': { amount: 1.5, unit: 'g' }
    },
    'To raise pH per 0.2': {
      'Sodium Carbonate (Soda Ash)': { amount: 5, unit: 'g' }
    },
    'To lower pH per 0.2': {
      'Trickle 25% Hydrochloric Acid': { amount: 5, unit: 'ml' },
      'Trickle Sodium Bisulphate': { amount: 10, unit: 'g' }
    },
    'Raise total alkalinity per 10 - 20 mg/l': {
      'Sodium Bicarbonate (Bicarb)': { amount: 30, unit: 'g' }
    },
    'Lower total alkalinity per 10 mg/l': {
      'Dump 25% Hydrochloric Acid': { amount: 20, unit: 'ml' },
      'Dump Sodium Bisulphate': { amount: 20, unit: 'g' }
    },
    'Lower Cyanuric Acid': {
      'Dilute with fresh water until level is below 100 mg/l': { amount: 0, unit: '' } // Special case, may need additional handling
    }
  };

    let chemicalCalculations = {};
  for (const adjustmentType in adjustments) {
    chemicalCalculations[adjustmentType] = {};
    for (const chemical in adjustments[adjustmentType]) {
      const amountPerUnit = adjustments[adjustmentType][chemical].amount;
      chemicalCalculations[adjustmentType][chemical] = {
        amount: volume * amountPerUnit,
        unit: adjustments[adjustmentType][chemical].unit
      };
    }
  }
  
  return chemicalCalculations;
}

function displayResults(volume, chemicals, unit) {
  const volumeInGallons = volume * 264.172; // Convert cubic meters to gallons
  const unitVolume = unit === 'metric' ? `${volume.toFixed(2)} cubic meters` : `${volumeInGallons.toFixed(2)} gallons`;

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  // Create a container for the volume result
  const volumeContainer = document.createElement('div');
  volumeContainer.classList.add('result-container');
  volumeContainer.innerHTML = `<h2>Results</h2><p>Pool Volume: ${unitVolume}</p>`;
  resultsDiv.appendChild(volumeContainer);

  // Iterate over chemical adjustments and create a container for each
  for (const adjustmentType in chemicals) {
    const adjustmentContainer = document.createElement('div');
    adjustmentContainer.classList.add('result-container');
    adjustmentContainer.innerHTML = `<h3>${adjustmentType}</h3>`;

    for (const chemical in chemicals[adjustmentType]) {
      const chemicalData = chemicals[adjustmentType][chemical];
      if(chemicalData.unit) {
        const amount = unit === 'metric' ? chemicalData.amount.toFixed(2) : (chemicalData.amount * 0.035274).toFixed(2); // Convert grams to ounces for imperial
        const unitMeasurement = chemicalData.unit === 'g' ? (unit === 'metric' ? 'grams' : 'ounces') : 'ml';
        adjustmentContainer.innerHTML += `<p>${chemical}: ${amount} ${unitMeasurement}</p>`;
      } else {
        // Special handling for chemicals without a unit (e.g., dilution instructions)
        adjustmentContainer.innerHTML += `<p>${chemical}</p>`;
      }
    }

    resultsDiv.appendChild(adjustmentContainer);
  }

  // Disclaimer at the end
  const disclaimerContainer = document.createElement('div');
  disclaimerContainer.classList.add('disclaimer-container');
  disclaimerContainer.innerHTML = `<p class="disclaimer">All amounts should be double-checked before dosing is commenced.</p>`;
  resultsDiv.appendChild(disclaimerContainer);
}
document.getElementById('unit').addEventListener('change', function(event) {
  const unit = event.target.value;
  const unitString = unit === 'metric' ? 'meters' : 'feet';
  document.getElementById('length').placeholder = `Length in ${unitString}`;
  document.getElementById('width').placeholder = `Width in ${unitString}`;
  document.getElementById('minDepth').placeholder = `Min Depth in ${unitString}`;
  document.getElementById('maxDepth').placeholder = `Max Depth in ${unitString}`;
});

