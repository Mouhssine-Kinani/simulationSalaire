import { useState } from 'react';

const SalaryCalculator = () => {
  const [netSalary, setNetSalary] = useState('');
  const [calculations, setCalculations] = useState(null);

  const calculateNAP = (SB) => {
    const cnssBase = Math.min(SB, 6000);
    const cnss = cnssBase * 0.0428;
    const amo = SB * 0.02;
    const assuranceMaladie = SB * 0.016;
    const retraite = SB * 0.06;
    const totalSalarial = cnss + amo + assuranceMaladie + retraite;

    const fraisPro = Math.min(0.2 * SB, 2333.33);
    const sbi = SB - fraisPro - totalSalarial;

    let ir;
    if (sbi > 15000) {
      ir = sbi * 0.38 - 2033.33;
    } else if (sbi > 6666.67) {
      ir = sbi * 0.34 - 1433.33;
    } else if (sbi > 5000) {
      ir = sbi * 0.3 - 1166.67;
    } else if (sbi > 4166.67) {
      ir = sbi * 0.2 - 666.67;
    } else if (sbi > 2500) {
      ir = sbi * 0.1 - 250;
    } else {
      ir = 0;
    }

    return SB - totalSalarial - Math.max(ir, 0);
  };

  const findSB = (targetNAP) => {
    let low = 0;
    let high = targetNAP * 3;
    let sb = (low + high) / 2;
    const precision = 1;

    for (let i = 0; i < 100; i++) {
      const currentNAP = calculateNAP(sb);
      if (Math.abs(currentNAP - targetNAP) < precision) break;
      
      if (currentNAP < targetNAP) low = sb;
      else high = sb;
      
      sb = (low + high) / 2;
    }
    return sb;
  };

  const calculateAll = (nap) => {
    const SB = findSB(nap);
    
    // Employee calculations
    const cnssBase = Math.min(SB, 6000);
    const cnssEmployee = cnssBase * 0.0429;
    const amoEmployee = SB * 0.02;
    const assuranceMaladieEmployee = SB * 0.016;
    const retraiteEmployee = SB * 0.06;
    const totalSalarial = cnssEmployee + amoEmployee + assuranceMaladieEmployee + retraiteEmployee;

    // Employer calculations
    const cnssNonPlafonne = SB * 0.095;
    const cnssPlafonne = Math.min(SB, 6000) * 0.086;
    const amoPP = SB * 0.02;
    const assuranceMaladiePatronal = SB * 0.01957;
    const retraitePatronal = SB * 0.078;
    const at = SB * 0.0081;
    const totalPatronal = cnssNonPlafonne + cnssPlafonne + amoPP + 
                          assuranceMaladiePatronal + retraitePatronal + at;

    return {
      salaureBrut: SB,
      employeeContributions: {
        cnss: cnssEmployee,
        amo: amoEmployee,
        assuranceMaladie: assuranceMaladieEmployee,
        retraite: retraiteEmployee,
        total: totalSalarial
      },
      employerContributions: {
        cnssNonPlafonne,
        cnssPlafonne,
        amoPP,
        assuranceMaladiePatronal,
        retraitePatronal,
        at,
        total: totalPatronal
      },
      totalCost: SB + totalPatronal
    };
  };

  const handleCalculate = () => {
    const nap = parseFloat(netSalary);
    if (!isNaN(nap)) {
      setCalculations(calculateAll(nap));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Salary Calculator</h1>
      <div>
        <label>
          Salaire Net (NAP): 
          <input
            type="number"
            value={netSalary}
            onChange={(e) => setNetSalary(e.target.value)}
            style={{ margin: '10px' }}
          />
        </label>
        <button onClick={handleCalculate} style={{ margin: '10px' }}>
          Calculate
        </button>
      </div>

      {calculations && (
        <div>
          <h2>Breakdown</h2>
          <h3>Salaire Brut: {calculations.salaureBrut.toFixed(2)} MAD</h3>
          
          <h4>Employee Contributions:</h4>
          <ul>
            <li>CNSS: {calculations.employeeContributions.cnss.toFixed(2)} MAD</li>
            <li>AMO: {calculations.employeeContributions.amo.toFixed(2)} MAD</li>
            <li>Assurance Maladie: {calculations.employeeContributions.assuranceMaladie.toFixed(2)} MAD</li>
            <li>Retraite: {calculations.employeeContributions.retraite.toFixed(2)} MAD</li>
            <li><strong>Total: {calculations.employeeContributions.total.toFixed(2)} MAD</strong></li>
          </ul>

          <h4>Employer Contributions:</h4>
          <ul>
            <li>CNSS Non Plafonné: {calculations.employerContributions.cnssNonPlafonne.toFixed(2)} MAD</li>
            <li>CNSS Plafonné: {calculations.employerContributions.cnssPlafonne.toFixed(2)} MAD</li>
            <li>AMO PP: {calculations.employerContributions.amoPP.toFixed(2)} MAD</li>
            <li>Assurance Maladie: {calculations.employerContributions.assuranceMaladiePatronal.toFixed(2)} MAD</li>
            <li>Retraite: {calculations.employerContributions.retraitePatronal.toFixed(2)} MAD</li>
            <li>AT: {calculations.employerContributions.at.toFixed(2)} MAD</li>
            <li><strong>Total: {calculations.employerContributions.total.toFixed(2)} MAD</strong></li>
          </ul>

          <h3>Total Cost for Employer: {calculations.totalCost.toFixed(2)} MAD</h3>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;