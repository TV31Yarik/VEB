function calculateProfit() {
    let Pc = parseFloat(document.getElementById("Pc").value); 
    let sigma1 = parseFloat(document.getElementById("sigma1").value); 
    let sigma2 = parseFloat(document.getElementById("sigma2").value); 
    let V = parseFloat(document.getElementById("V").value); 

    if (isNaN(Pc) || isNaN(sigma1) || isNaN(sigma2) || isNaN(V)) {
        alert("Будь ласка, введіть коректні числові значення.");
        return;
    }

    let delta1 = normalCDF(5.25, 5, sigma1) - normalCDF(4.75, 5, sigma1); 
    let delta2 = normalCDF(5.25, 5, sigma2) - normalCDF(4.75, 5, sigma2); 

    
    let W1 = Pc * 24 * delta1; 
    let W2 = Pc * 24 * (1 - delta1); 
    let W3 = Pc * 24 * delta2; 
    let W4 = Pc * 24 * (1 - delta2); 
    
    
    let P1 = W1 * V * 1000; 
    let P2 = W3 * V * 1000; 
    let fine1 = W2 * V * 1000; 
    let fine2 = W4 * V * 1000; 
    let profit = P2 - fine2; 
    
    
    document.getElementById("results").innerHTML = `
        <p>Прибуток до вдосконалення: <b>${P1.toFixed(2)}</b> тис. грн</p>
        <p>Штраф до вдосконалення: <b>${fine1.toFixed(2)}</b> тис. грн</p>
        <p>Прибуток після вдосконалення: <b>${P2.toFixed(2)}</b> тис. грн</p>
        <p>Штраф після вдосконалення: <b>${fine2.toFixed(2)}</b> тис. грн</p>
        <p><b>Загальний прибуток: ${profit.toFixed(2)}</b> тис. грн</p>
    `;
}


function normalCDF(x, mean, std) {
    return (1 + erf((x - mean) / (Math.sqrt(2) * std))) / 2;
}


function erf(x) {
    let sign = (x < 0) ? -1 : 1;
    x = Math.abs(x);
    let t = 1 / (1 + 0.3275911 * x);
    let y = 1 - ((((1.061405429 * t + -1.453152027) * t + 1.421413741) * t + -0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
}