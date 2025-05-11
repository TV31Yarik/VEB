const elementParams = {
    "breaker": { omega: 0.01, tvi: 30, name: "Елегазовий вимикач 110 кВ" },
    "line": { omega: 0.07, tvi: 10, name: "Лінія електропередачі 110 кВ" },
    "transformer": { omega: 0.015, tvi: 100, name: "Трансформатор 110/10 кВ" },
    "breaker10": { omega: 0.02, tvi: 15, name: "Ввідний вимикач 10 кВ" },
    "connection": { omega: 0.03, tvi: 2, name: "Приєднання 10 кВ" },
    "section": { omega: 0.02, tvi: 15, name: "Секційний вимикач 10 кВ" }
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addRowBtn').addEventListener('click', addParamRow);
    
    document.getElementById('calculateBtn').addEventListener('click', calculate);
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            removeParamRow(e.target);
        }
        
        if (e.target.classList.contains('element-type')) {
            updateElementParams(e.target);
        }
    });
});

function addParamRow() {
    const container = document.getElementById('failureParams');
    const newRow = document.createElement('div');
    newRow.className = 'param-row';
    newRow.innerHTML = `
        <label>Назва елемента:
            <select class="element-type">
                <option value="breaker">Елегазовий вимикач 110 кВ</option>
                <option value="line">Лінія електропередачі 110 кВ</option>
                <option value="transformer">Трансформатор 110/10 кВ</option>
                <option value="breaker10">Ввідний вимикач 10 кВ</option>
                <option value="connection">Приєднання 10 кВ</option>
                <option value="section">Секційний вимикач 10 кВ</option>
            </select>
        </label>
        <label>Кількість:
            <input type="number" class="element-count" value="1" min="1">
        </label>
        <label>Частота відмов (ω), рік⁻¹:
            <input type="number" step="0.0001" class="omega" value="0.01">
        </label>
        <label>Час відновлення (t), год:
            <input type="number" step="0.1" class="tvi" value="30">
        </label>
        <button class="remove-btn">Видалити</button>
    `;
    container.appendChild(newRow);
}

function updateElementParams(select) {
    const row = select.closest('.param-row');
    const type = select.value;
    const params = elementParams[type];
    
    row.querySelector('.omega').value = params.omega;
    row.querySelector('.tvi').value = params.tvi;
}

function removeParamRow(button) {
    const row = button.closest('.param-row');
    row.remove();
}

function calculate() {
    const rows = document.querySelectorAll('.param-row');
    let omega_oc = 0;
    let omega_t_oc = 0;
    let omega_dc = 0;
    let omega_section = 0;
    
    rows.forEach(row => {
        const type = row.querySelector('.element-type').value;
        const count = parseFloat(row.querySelector('.element-count').value) || 1;
        const omega = parseFloat(row.querySelector('.omega').value) || 0;
        const tvi = parseFloat(row.querySelector('.tvi').value) || 0;
     
        omega_oc += omega * count;
        omega_t_oc += omega * tvi * count;
      
        if (type === 'section') {
            omega_section = omega * count;
        }
    });
    
    const t_v_oc = omega_oc > 0 ? omega_t_oc / omega_oc : 0;
    const k_a_oc = (omega_oc * t_v_oc) / 8760;
    const k_n_oc = (1.2 * 43) / 8760;  
   
    omega_dc = 2 * omega_oc * (3.6e-4 + 58.9e-4);
    const omega_dc_with_section = omega_dc + omega_section;
  
    const P_M = parseFloat(document.getElementById('P_M').value) || 5120;
    const T_M = parseFloat(document.getElementById('T_M').value) || 6451;
    const Z_per_a = parseFloat(document.getElementById('Z_per_a').value) || 23.6;
    const Z_per_p = parseFloat(document.getElementById('Z_per_p').value) || 17.6;
    
    const M_W_nea = 0.01 * 45e-3 * P_M * T_M;
    const M_W_nep = 4e-3 * P_M * T_M;
    const M_Z = Z_per_a * M_W_nea + Z_per_p * M_W_nep;
  
    const results = [
        { label: "<strong>Одноколова система</strong>", value: "", unit: "" },
        { label: "Частота відмов (ω<sub>ос</sub>)", value: omega_oc.toFixed(4), unit: "рік⁻¹" },
        { label: "Середній час відновлення (t<sub>в.ос</sub>)", value: t_v_oc.toFixed(1), unit: "год" },
        { label: "Коефіцієнт аварійного простою (k<sub>а.ос</sub>)", value: k_a_oc.toExponential(4), unit: "" },
        { label: "Коефіцієнт планового простою (k<sub>п.ос</sub>)", value: k_n_oc.toExponential(4), unit: "" },
        { label: "<strong>Двоколова система</strong>", value: "", unit: "" },
        { label: "Частота відмов двох кіл (ω<sub>дк</sub>)", value: omega_dc.toExponential(4), unit: "рік⁻¹" },
        { label: "Частота відмов з секційним вимикачем (ω<sub>дс</sub>)", value: omega_dc_with_section.toFixed(4), unit: "рік⁻¹" },
        { label: "<strong>Збитки від перерв</strong>", value: "", unit: "" },
        { label: "Аварійні недовідпущення електроенергії (M(W<sub>нед.а</sub>))", value: M_W_nea.toFixed(0), unit: "кВт·год" },
        { label: "Планові недовідпущення електроенергії (M(W<sub>нед.п</sub>))", value: M_W_nep.toFixed(0), unit: "кВт·год" },
        { label: "Математичне сподівання збитків (M(3<sub>пер</sub>))", value: M_Z.toFixed(0), unit: "грн" }
    ];
    
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    
    results.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        if (item.value === "") {
            div.innerHTML = `<strong>${item.label}</strong>`;
        } else {
            div.innerHTML = `${item.label}: <strong>${item.value}</strong> ${item.unit}`;
        }
        resultsList.appendChild(div);
    });
    
    document.getElementById('result').style.display = 'block';
}