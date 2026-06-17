/**
 * Wraps Anywhere v0.001
 * Core Calculation and Tackle Population Module Engine
 */

function populateTackleOptionsBox() {
    const style = document.getElementById('anglingStyle').value;
    const dropdown = document.getElementById('rodLength');
    const label = document.getElementById('tackleBoxLabel');
    const customInput = document.getElementById('customRodInput');
    
    dropdown.innerHTML = ''; 
    customInput.style.display = 'none'; 
    customInput.value = '';

    if (style === 'carp') {
        label.innerText = "ROD LENGTH";
        dropdown.innerHTML = `
            <option value="9">9 ft (Premium)</option> <option value="10">10 ft (Premium)</option> <option value="11">11 ft (Premium)</option>
            <option value="12" selected>12 ft (Free Starter)</option> <option value="13">13 ft (Premium)</option> <option value="custom">Custom Dimensions... (Premium)</option>
        `;
        document.getElementById('resultBoxTitle').innerText = "Target Geometry";
    } else if (style === 'match') {
        label.innerText = "POLE EXTENSION REACH";
        dropdown.innerHTML = `
            <option value="13" selected>13.0 Meters (Free Starter)</option> <option value="8.5">8.5 Meters (Premium)</option>
            <option value="11">11.0 Meters (Premium)</option> <option value="14.5">14.5 Meters (Premium)</option> <option value="16">16.0 Meters (Premium)</option> <option value="custom">Custom Pole Reach... (Premium)</option>
        `;
        document.getElementById('resultBoxTitle').innerText = "Match Logistics Matrix";
    } else if (style === 'predator') {
        label.innerText = "PREDATOR LEAD LINE REACH";
        dropdown.innerHTML = `
            <option value="12" selected>Standard Ledger Setup (Free)</option> <option value="custom">Custom Casting Range... (Premium)</option>
        `;
        document.getElementById('resultBoxTitle').innerText = "Predator Structural Geometry";
    } else if (style === 'coarse') {
        label.innerText = "DAY TICKET ROD SETUP";
        dropdown.innerHTML = `
            <option value="11" selected>11 ft Float/Feeder Rod (Free)</option>
            <option value="12">12 ft Heavy Feeder Rod (Premium)</option>
            <option value="custom">Custom Pleasure Rod... (Premium)</option>
        `;
        document.getElementById('resultBoxTitle').innerText = "Pleasure Geometry Matrix";
    } else if (style === 'sea') {
        label.innerText = "BEACHCASTER / SHORE RIG RUN";
        dropdown.innerHTML = `
            <option value="12" selected>12 ft Standard Shore Rod (Free)</option>
            <option value="14">14 ft Long-Range Beachcaster (Premium)</option>
            <option value="custom">Custom Coastal Casting Setup... (Premium)</option>
        `;
        document.getElementById('resultBoxTitle').innerText = "Coastal Tracking Analytics";
    }
    calculateWraps();
}

function handleTackleSelectionChange() {
    const style = document.getElementById('anglingStyle').value;
    const value = document.getElementById('rodLength').value;
    const customInput = document.getElementById('customRodInput');

    if (!isPremiumUser) {
        if (style === 'carp' && value !== "12") { togglePaywallModal(true); document.getElementById('rodLength').value = "12"; return; }
        if (style === 'match' && value !== "13") { togglePaywallModal(true); document.getElementById('rodLength').value = "13"; return; }
        if (style === 'predator' && value === "custom") { togglePaywallModal(true); document.getElementById('rodLength').value = "12"; return; }
        if (style === 'coarse' && value !== "11") { togglePaywallModal(true); document.getElementById('rodLength').value = "11"; return; }
        if (style === 'sea' && value !== "12") { togglePaywallModal(true); document.getElementById('rodLength').value = "12"; return; }
    }

    if (value === 'custom') {
        customInput.style.display = 'block';
        if (style === 'match') customInput.placeholder = "Enter pole reach length in meters (e.g. 14.2)";
        else customInput.placeholder = "Enter casting reach parameter in feet (e.g. 13.6)";
        customInput.focus();
    } else { customInput.style.display = 'none'; calculateWraps(); }
}

function calculateWraps() {
    if (!pegLatLng || !spotLatLng) return;

    const style = document.getElementById('anglingStyle').value;
    let tackleSize = parseFloat(document.getElementById('rodLength').value);
    if (document.getElementById('rodLength').value === 'custom') {
        tackleSize = parseFloat(document.getElementById('customRodInput').value) || 12;
    }

    const R = 6371000; 
    const dLat = (spotLatLng.lat - pegLatLng.lat) * Math.PI / 180; 
    const dLon = (spotLatLng.lng - pegLatLng.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pegLatLng.lat * Math.PI / 180) * Math.cos(spotLatLng.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const calculatedMetres = R * c; 
    const calculatedTotalFeet = calculatedMetres / 0.3048;
    const calculatedYards = calculatedMetres * 1.09361;

    document.getElementById('resultDistance').innerText = `Distance: ${calculatedMetres.toFixed(1)}m (${calculatedYards.toFixed(1)}yds)`;

    if (style === 'carp') {
        const fullWraps = Math.floor(calculatedTotalFeet / tackleSize); 
        const remainingFeet = calculatedTotalFeet % tackleSize;
        let text = `${fullWraps} wrap${fullWraps !== 1 ? 's' : ''}`;
        if (remainingFeet > 0.05) text += ` + ${remainingFeet.toFixed(1)} ft`;
        document.getElementById('resultValue').innerText = text;
        document.getElementById('resultNote').innerText = remainingFeet > 0.05 ? `Target is ${calculatedMetres.toFixed(2)}m away.\nOn wrap ${fullWraps + 1}, stop ${(tackleSize - remainingFeet).toFixed(1)} ft short of the opposite distance stick.` : `Target is ${calculatedMetres.toFixed(2)}m away.\nHit line clip perfectly on wrap ${fullWraps}.`;
    } 
    else if (style === 'match') {
        document.getElementById('resultValue').innerText = `${calculatedMetres.toFixed(1)} Meters`;
        document.getElementById('resultNote').innerText = `Precision pole reach lines mapped.\nYou will need to lock together approximately ${Math.ceil(calculatedMetres / 1.6)} structural carbon pole sections to place rigs directly onto this target vector.`;
    } 
    else if (style === 'predator') {
        document.getElementById('resultValue').innerText = `${Math.floor(calculatedYards)} yds + ${(calculatedTotalFeet % 3).toFixed(1)} ft`;
        document.getElementById('resultNote').innerText = `Predator / Ledger location tracked.\nLine deployment requires precisely ${calculatedYards.toFixed(1)} yards of line release out to this specific deep structural feature.`;
    }
    else if (style === 'coarse') {
        document.getElementById('resultValue').innerText = `${Math.floor(calculatedYards)} yds + ${(calculatedTotalFeet % 3).toFixed(1)} ft`;
        const wrapsEq = Math.floor(calculatedTotalFeet / 12);
        document.getElementById('resultNote').innerText = `Day Ticket / Pleasure Line casting range calculated.\nDistance tracks out to ${calculatedYards.toFixed(1)} yards (Approx. ${wrapsEq} standard wraps if using distance sticks for feeder clips).`;
    }
    else if (style === 'sea') {
        document.getElementById('resultValue').innerText = `${Math.floor(calculatedYards)} Yards`;
        document.getElementById('resultNote').innerText = `Coastal Casting Vector Metrology.\nYour rig must travel a trajectory clearance of precisely ${calculatedYards.toFixed(1)} yards (${calculatedMetres.toFixed(1)} meters) out to drop anchoring sinkers securely inside the target maritime channel structure.`;
    }
}
