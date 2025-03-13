function calculate() {
    let hp = parseFloat(document.getElementById("hp").value);
    let cp = parseFloat(document.getElementById("cp").value);
    let sp = parseFloat(document.getElementById("sp").value);
    let np = parseFloat(document.getElementById("np").value);
    let op = parseFloat(document.getElementById("op").value);
    let wp = parseFloat(document.getElementById("wp").value);
    let ap = parseFloat(document.getElementById("ap").value);

    let krs = 100 / (100 - wp);
    let krg = 100 / (100 - wp - ap);

    let hs = hp * krs;
    let cs = cp * krs;
    let ss = sp * krs;
    let ns = np * krs;
    let os = op * krs;
    let as_ = ap * krs;

    let hg = hp * krg;
    let cg = cp * krg;
    let sg = sp * krg;
    let ng = np * krg;
    let og = op * krg;

    let qph = (339 * cp) + (1030 * hp) - (108.8 * (op - sp)) - (25 * wp);

    document.getElementById("result").innerHTML = `
        <h3>Результати розрахунку</h3>
        <p>Коефіцієнт переходу до сухої маси: ${krs.toFixed(2)}</p>
        <p>Коефіцієнт переходу до горючої маси: ${krg.toFixed(2)}</p>
        <p>Склад сухої маси: HС=${hs.toFixed(2)}%, CС=${cs.toFixed(2)}%, SС=${ss.toFixed(2)}%, NС=${ns.toFixed(2)}%, OС=${os.toFixed(2)}%, АС=${as_.toFixed(2)}%</p>
        <p>Склад горючої маси: HГ=${hg.toFixed(2)}%, CГ=${cg.toFixed(2)}%, SГ=${sg.toFixed(2)}%, NГ=${ng.toFixed(2)}%, OГ=${og.toFixed(2)}%</p>
        <p>Нижча теплота згоряння (МДж/кг): ${qph.toFixed(4)}</p>
    `;
}