import { useState, useEffect } from 'react';

const SalaryCalculator = () => {
  const [netSalary, setNetSalary] = useState('');
  const [calculations, setCalculations] = useState(null);

  const calculateContributions = (gross) => {
    const cnssBase = Math.min(gross, 6000);
    const cnss = cnssBase * 0.0429;
    const amo = gross * 0.02;
    const assuranceMaladie = gross * 0.016;
    const retraite = gross * 0.06;
    return cnss + amo + assuranceMaladie + retraite;
  };

  const calculateIR = (taxableIncome) => {
    if (taxableIncome > 15000) return taxableIncome * 0.38 - 2033.33;
    if (taxableIncome > 6667) return taxableIncome * 0.34 - 1433.33;
    if (taxableIncome > 5000) return taxableIncome * 0.3 - 1166.67;
    if (taxableIncome > 4166.67) return taxableIncome * 0.2 - 666.67;
    if (taxableIncome > 2500) return taxableIncome * 0.1 - 250;
    return 0;
  };

  const calculateFromNet = (targetNet) => {
    let gross = targetNet * 1.5; // Estimation initiale
    let tolerance = 1;
    let iterations = 0;
    
    while(iterations < 100) {
      const professionalFees = Math.min(gross * 0.2, 2333.33);
      const contributions = calculateContributions(gross);
      const taxableIncome = gross - professionalFees - contributions;
      const ir = calculateIR(taxableIncome);
      const calculatedNet = gross - contributions - ir;
      
      if(Math.abs(calculatedNet - targetNet) < tolerance) break;
      
      // Ajustement de l'estimation
      gross += (targetNet - calculatedNet) * 0.5;
      iterations++;
    }
    
    return {
      gross: Math.round(gross),
      professionalFees: Math.min(gross * 0.2, 2333.33),
      contributions: calculateContributions(gross),
      ir: calculateIR(gross - Math.min(gross * 0.2, 2333.33) - calculateContributions(gross)),
      transportAllowance: 500,
      representationAllowance: gross * 0.1
    };
  };

  useEffect(() => {
    if(netSalary && !isNaN(netSalary)) {
      const results = calculateFromNet(parseFloat(netSalary));
      setCalculations(results);
    }
  }, [netSalary]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Simulateur de Salaire</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Salaire Net (MAD): 
          <input
            type="number"
            value={netSalary}
            onChange={(e) => setNetSalary(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>

      {calculations && (
        <div style={{ 
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>Détail des calculs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
            <div>Salaire Brut:</div>
            <div>{calculations.gross.toFixed(2)} MAD</div>
            
            <div>Frais Professionnels:</div>
            <div>{calculations.professionalFees.toFixed(2)} MAD</div>
            
            <div>Cotisations Sociales:</div>
            <div>{calculations.contributions.toFixed(2)} MAD</div>
            
            <div>Impôt sur le Revenu:</div>
            <div>{calculations.ir.toFixed(2)} MAD</div>
            
            <div>Indemnité Transport:</div>
            <div>{calculations.transportAllowance.toFixed(2)} MAD</div>
            
            <div>Indemnité Représentation:</div>
            <div>{calculations.representationAllowance.toFixed(2)} MAD</div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '15px', fontWeight: 'bold' }}>
              Total Charges Patronales: {(
                calculations.gross * 0.095 + 
                Math.min(calculations.gross, 6000) * 0.086 +
                calculations.gross * 0.02 +
                calculations.gross * 0.01957 +
                calculations.gross * 0.0081
              ).toFixed(2)} MAD
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', color: '#666', fontSize: '0.9em' }}>
        <p>Les calculs incluent :</p>
        <ul>
          <li>CNSS (Plafonné et Non-Plafonné)</li>
          <li>AMO (Assurance Maladie Obligatoire)</li>
          <li>Cotisation Retraite</li>
          <li>Barème progressif de l&apso;IR</li>
        </ul>
      </div>
    </div>
  );
};

export default SalaryCalculator;