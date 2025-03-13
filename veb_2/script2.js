function calculate() {
    let fuelType = document.getElementById("fuelType").value;
    let fuelAmount = parseFloat(document.getElementById("fuelAmount").value);
    let emissionFactor, totalEmission;

    if (fuelType === "coal") {
        emissionFactor = 150; // г/ГДж
        totalEmission = (emissionFactor * fuelAmount * 20.47) / 1e6; // Переводимо в тонни
    } else if (fuelType === "mazut") {
        emissionFactor = 0.57; // г/ГДж
        totalEmission = (emissionFactor * fuelAmount * 40.40) / 1e6;
    } else {
        emissionFactor = 0; // Газ не утворює твердих частинок
        totalEmission = 0;
    }

    document.getElementById("result").innerHTML = `
        <h3>Результати</h3>
        <p>Показник емісії: ${emissionFactor} г/ГДж</p>
        <p>Валовий викид: ${totalEmission.toFixed(2)} т</p>
    `;
}