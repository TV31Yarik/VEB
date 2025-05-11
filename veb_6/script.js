document.addEventListener('DOMContentLoaded', function() {
    // Початкові дані для варіанту 4
    const variantData = {
        Шліфувальний_верстат: { Pн: 23, Kв: 0.24, tgφ: 1.58 },
        Полірувальний_верстат: { Pн: 23, Kв: 0.24, tgφ: 1.58 },
        Циркулярна_пила: { Pн: 23, Kв: 0.24, tgφ: 1.58 }
    };

    // Додаємо кнопки
    const addEpBtn = document.getElementById('addEpBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const epTable = document.getElementById('epTable').getElementsByTagName('tbody')[0];
    const resultsDiv = document.getElementById('results');

    // Додаємо початкові ЕП
    addDefaultEPs();

    // Обробники подій
    addEpBtn.addEventListener('click', addEpRow);
    calculateBtn.addEventListener('click', calculateLoads);

    function addDefaultEPs() {
        const shrs = ['ШР1', 'ШР2', 'ШР3'];
        let i = 0;
        for (const epName in variantData) {
            addEpRow(shrs[i], epName, variantData[epName]);
            i = (i + 1) % shrs.length;
        }
    }

    function addEpRow(shr = 'ШР1', epName = '', epData = {}) {
        const newRow = epTable.insertRow();
        
        // ШР
        const shrCell = newRow.insertCell(0);
        const shrSelect = document.createElement('select');
        ['ШР1', 'ШР2', 'ШР3'].forEach(shrOption => {
            const option = document.createElement('option');
            option.value = shrOption;
            option.textContent = shrOption;
            shrSelect.appendChild(option);
        });
        shrSelect.value = shr;
        shrCell.appendChild(shrSelect);
        
        // Назва ЕП
        const nameCell = newRow.insertCell(1);
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = epName || '';
        nameCell.appendChild(nameInput);
        
        // Кількість
        const countCell = newRow.insertCell(2);
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.value = '1';
        countInput.min = '1';
        countCell.appendChild(countInput);
        
        // Pн
        const pnCell = newRow.insertCell(3);
        const pnInput = document.createElement('input');
        pnInput.type = 'number';
        pnInput.value = epData.Pн || '';
        pnInput.step = '0.1';
        pnCell.appendChild(pnInput);
        
        // ηн
        const etaCell = newRow.insertCell(4);
        const etaInput = document.createElement('input');
        etaInput.type = 'number';
        etaInput.value = '0.9';
        etaInput.step = '0.01';
        etaInput.min = '0.01';
        etaInput.max = '1';
        etaCell.appendChild(etaInput);
        
        // cosφ
        const cosPhiCell = newRow.insertCell(5);
        const cosPhiInput = document.createElement('input');
        cosPhiInput.type = 'number';
        cosPhiInput.value = '0.85';
        cosPhiInput.step = '0.01';
        cosPhiInput.min = '0.01';
        cosPhiInput.max = '1';
        cosPhiCell.appendChild(cosPhiInput);
        
        // Kв
        const kvCell = newRow.insertCell(6);
        const kvInput = document.createElement('input');
        kvInput.type = 'number';
        kvInput.value = epData.Kв || '0.24';
        kvInput.step = '0.01';
        kvInput.min = '0.01';
        kvInput.max = '1';
        kvCell.appendChild(kvInput);
        
        // tgφ
        const tgPhiCell = newRow.insertCell(7);
        const tgPhiInput = document.createElement('input');
        tgPhiInput.type = 'number';
        tgPhiInput.value = epData.tgφ || '1.58';
        tgPhiInput.step = '0.01';
        tgPhiCell.appendChild(tgPhiInput);
        
        // Кнопка видалення
        const actionsCell = newRow.insertCell(8);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Видалити';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', function() {
            epTable.deleteRow(newRow.rowIndex);
        });
        actionsCell.appendChild(deleteBtn);
    }

    function calculateLoads() {
        const voltage = parseFloat(document.getElementById('voltage').value);
        const rows = epTable.rows;
        const groups = {};
        
        // Збираємо дані про ЕП, групуємо по ШР
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].cells;
            const groupName = cells[0].querySelector('select').value;
            
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            
            groups[groupName].push({
                name: cells[1].querySelector('input').value,
                n: parseInt(cells[2].querySelector('input').value),
                Pн: parseFloat(cells[3].querySelector('input').value),
                ηн: parseFloat(cells[4].querySelector('input').value),
                cosφ: parseFloat(cells[5].querySelector('input').value),
                Kв: parseFloat(cells[6].querySelector('input').value),
                tgφ: parseFloat(cells[7].querySelector('input').value)
            });
        }
        
        // Розрахунок для кожної ШР
        const groupResults = {};
        for (const groupName in groups) {
            groupResults[groupName] = calculateGroupLoad(groups[groupName]);
        }
        
        // Розрахунок для цеху (всі ЕП разом)
        const allEPs = Object.values(groups).flat();
        const workshopResult = calculateGroupLoad(allEPs);
        
        // Виводимо результати
        displayResults(groups, groupResults, workshopResult, voltage);
    }

    function calculateGroupLoad(eps) {
        // Груповий коефіцієнт використання
        const sumNPH = eps.reduce((sum, ep) => sum + ep.n * ep.Pн, 0);
        const sumNPHKV = eps.reduce((sum, ep) => sum + ep.n * ep.Pн * ep.Kв, 0);
        const Kв_груп = sumNPHKV / sumNPH;
        
        // Ефективна кількість ЕП
        const sumNPHSquared = eps.reduce((sum, ep) => sum + ep.n * Math.pow(ep.Pн, 2), 0);
        const nе = Math.pow(sumNPH, 2) / sumNPHSquared;
        
        // Розрахунковий коефіцієнт активної потужності
        const Kр = getKpValue(Kв_груп, nе);
        
        // Активне навантаження
        const Pp = Kр * sumNPHKV;
        
        // Реактивне навантаження
        const avgTgPhi = eps.reduce((sum, ep) => sum + ep.tgφ, 0) / eps.length;
        const Qp = Pp * avgTgPhi;
        
        // Повна потужність
        const Sp = Math.sqrt(Math.pow(Pp, 2) + Math.pow(Qp, 2));
        
        // Груповий струм
        const voltage = parseFloat(document.getElementById('voltage').value);
        const Ip = Pp / (Math.sqrt(3) * voltage);
        
        return { 
            Kв_груп, 
            nе, 
            Kр, 
            Pp, 
            Qp, 
            Sp, 
            Ip,
            sumNPH,
            sumNPHKV
        };
    }

    function getKpValue(Kв, nе) {
        // Спрощена версія визначення Kр (в реальному застосуванні потрібна таблиця)
        if (Kв <= 0.2) return 1.25;
        if (Kв <= 0.3) return 1.1;
        if (Kв <= 0.4) return 0.9;
        if (Kв <= 0.5) return 0.8;
        return 0.7;
    }

    function displayResults(groups, groupResults, workshopResult, voltage) {
        let html = '<h3>Результати розрахунків для окремих ШР</h3>';
        
        // Виводимо результати для кожної ШР
        for (const groupName in groupResults) {
            const res = groupResults[groupName];
            html += `
                <h4>${groupName}</h4>
                <table class="result-table">
                    <tr><th>Кількість ЕП</th><td>${groups[groupName].length}</td></tr>
                    <tr><th>Σ(n×Pн), кВт</th><td>${res.sumNPH.toFixed(2)}</td></tr>
                    <tr><th>Груповий Kв</th><td>${res.Kв_груп.toFixed(4)}</td></tr>
                    <tr><th>Ефективна кількість ЕП (nе)</th><td>${Math.round(res.nе)}</td></tr>
                    <tr><th>Kр</th><td>${res.Kр.toFixed(2)}</td></tr>
                    <tr><th>Активне навантаження (Pр), кВт</th><td>${res.Pp.toFixed(2)}</td></tr>
                    <tr><th>Реактивне навантаження (Qр), квар</th><td>${res.Qp.toFixed(2)}</td></tr>
                    <tr><th>Повна потужність (Sр), кВ·А</th><td>${res.Sp.toFixed(2)}</td></tr>
                    <tr><th>Струм (Iр), А</th><td>${res.Ip.toFixed(2)}</td></tr>
                </table>
            `;
        }
        
        // Виводимо результати для цеху
        html += `
            <h3>Результати для цеху</h3>
            <table class="result-table">
                <tr><th>Загальна кількість ЕП</th><td>${Object.values(groups).flat().length}</td></tr>
                <tr><th>Σ(n×Pн), кВт</th><td>${workshopResult.sumNPH.toFixed(2)}</td></tr>
                <tr><th>Коефіцієнт використання цеху (Kв)</th><td>${workshopResult.Kв_груп.toFixed(4)}</td></tr>
                <tr><th>Ефективна кількість ЕП цеху (nе)</th><td>${Math.round(workshopResult.nе)}</td></tr>
                <tr><th>Kр</th><td>${workshopResult.Kр.toFixed(2)}</td></tr>
                <tr><th>Активне навантаження (Pр), кВт</th><td>${workshopResult.Pp.toFixed(2)}</td></tr>
                <tr><th>Реактивне навантаження (Qр), квар</th><td>${workshopResult.Qp.toFixed(2)}</td></tr>
                <tr><th>Повна потужність (Sр), кВ·А</th><td>${workshopResult.Sp.toFixed(2)}</td></tr>
                <tr><th>Струм на шинах ТП (Iр), А</th><td>${workshopResult.Ip.toFixed(2)}</td></tr>
            </table>
        `;
        
        resultsDiv.innerHTML = html;
    }
});