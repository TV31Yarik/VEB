function showTask(task) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));

    document.getElementById('result-7.1').innerHTML = '';
    document.getElementById('result-7.2').innerHTML = '';
    document.getElementById('result-7.4').innerHTML = '';

    document.getElementById(`task-${task}`).classList.remove('hidden');
}

function calculate71() {
    const sm = parseFloat(document.getElementById('sm').value);
    const voltage = parseFloat(document.getElementById('voltage').value);
    const ik = parseFloat(document.getElementById('ik').value);
    const tphi = parseFloat(document.getElementById('tphi').value);
    const tm = parseFloat(document.getElementById('tm').value);

    const im = (sm / 2) / (Math.sqrt(3) * voltage);
    const im_pa = 2 * im;

    let jek;
    if (tm >= 4000) jek = 1.4;
    else if (tm >= 3000) jek = 1.6;
    else jek = 1.8;

    const sek = im / jek;
    const ct = 92;
    const smin = (ik * 1000 * Math.sqrt(tphi)) / ct;
    const recommended = Math.max(Math.ceil(sek), Math.ceil(smin));

    document.getElementById('result-7.1').innerHTML = `
        <h3>Результати:</h3>
        <p>Розрахунковий струм: <b>${im.toFixed(2)}</b> А</p>
        <p>Післяаварійний струм: <b>${im_pa.toFixed(2)}</b> А</p>
        <p>Економічна густина струму: <b>${jek.toFixed(2)}</b> А/мм²</p>
        <p>Економічний переріз: <b>${sek.toFixed(2)}</b> мм²</p>
        <p>Мінімальний переріз (терм. стійкість): <b>${smin.toFixed(2)}</b> мм²</p>
        <p><b>Рекомендований переріз кабелю: ${recommended}</b> мм²</p>
    `;
}

function calculate72() {
    const voltage = parseFloat(document.getElementById('voltage-7.2').value);
    const sk = parseFloat(document.getElementById('sk').value);
    const uk = parseFloat(document.getElementById('uk').value);
    const snom = parseFloat(document.getElementById('snom').value);
    const method = document.getElementById('method').value;

    if (method === 'named') {
        const xc = Math.pow(voltage, 2) / sk;
        const xt = (uk / 100) * (Math.pow(voltage, 2) / snom);
        const xsum = xc + xt;
        const ipo = voltage / (Math.sqrt(3) * xsum);

        document.getElementById('result-7.2').innerHTML = `
            <h3>Результати:</h3>
            <p>Опір системи X<sub>c</sub>: <b>${xc.toFixed(4)}</b> Ом</p>
            <p>Опір трансформатора X<sub>T</sub>: <b>${xt.toFixed(4)}</b> Ом</p>
            <p>Сумарний опір X<sub>Σ</sub>: <b>${xsum.toFixed(4)}</b> Ом</p>
            <p>Початкове діюче значення струму трифазного КЗ I<sub>П0</sub>: <b>${ipo.toFixed(4)}</b> кА</p>
        `;
    }
}

function calculate74() {
  
    const uk = parseFloat(document.getElementById('uk-7.4').value);
    const uhv = parseFloat(document.getElementById('uhv-7.4').value);
    const ulv = parseFloat(document.getElementById('ulv-7.4').value);
    const snom = parseFloat(document.getElementById('snom-7.4').value);
    const mode = document.querySelector('input[name="mode-7.4"]:checked').value;
    
    let rcn, xcn;
    switch(mode) {
        case 'normal':
            rcn = 10.65;
            xcn = -24.02;
            break;
        case 'minimal':
            rcn = 34.88;
            xcn = 65.68;
            break;
        case 'emergency':
            rcn = parseFloat(document.getElementById('rcemerg').value);
            xcn = parseFloat(document.getElementById('xcemerg').value);
            break;
    }
    
    const xt = (uk * Math.pow(uhv, 2)) / (100 * snom);
    const xiii = Math.abs(xcn) + xt;
    const ziii = Math.sqrt(Math.pow(rcn, 2) + Math.pow(xiii, 2));
    const iii3 = (uhv * 1000) / (Math.sqrt(3) * ziii);
    const iii2 = iii3 * Math.sqrt(3) / 2;
    
    const kpr = Math.pow(ulv, 2) / Math.pow(uhv, 2);
    const rciii = rcn * kpr;
    const xciii = xiii * kpr;
    const zciii = Math.sqrt(Math.pow(rciii, 2) + Math.pow(xciii, 2));
    const iii3n = (ulv * 1000) / (Math.sqrt(3) * zciii);
    const iii2n = iii3n * Math.sqrt(3) / 2;
    
    let modeName;
    switch(mode) {
        case 'normal': modeName = 'нормального'; break;
        case 'minimal': modeName = 'мінімального'; break;
        case 'emergency': modeName = 'аварійного'; break;
    }
    
    document.getElementById('result-7.4').innerHTML = `
        <h3>Результати для ${modeName} режиму:</h3>
        <p>Реактивний опір трансформатора X<sub>T</sub>: <b>${xt.toFixed(2)}</b> Ом</p>
        <p>Повний опір Z<sub>III</sub>: <b>${ziii.toFixed(2)}</b> Ом</p>
        <p>Струм трифазного КЗ I<sub>III</sub><sup>(3)</sup>: <b>${iii3.toFixed(0)}</b> А</p>
        <p>Струм двофазного КЗ I<sub>III</sub><sup>(2)</sup>: <b>${iii2.toFixed(0)}</b> А</p>
        <p>Приведений опір на шинах 10 кВ Z<sub>III.н</sub>: <b>${zciii.toFixed(2)}</b> Ом</p>
        <p>Дійсний струм трифазного КЗ I<sub>III.н</sub><sup>(3)</sup>: <b>${iii3n.toFixed(0)}</b> А</p>
        <p>Дійсний струм двофазного КЗ I<sub>III.н</sub><sup>(2)</sup>: <b>${iii2n.toFixed(0)}</b> А</p>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    const modeRadios = document.querySelectorAll('input[name="mode-7.4"]');
    const emergencyParams = document.getElementById('emergency-params');
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            emergencyParams.style.display = this.value === 'emergency' ? 'block' : 'none';
        });
    });
});