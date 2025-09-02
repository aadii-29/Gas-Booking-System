const CYLINDER_TYPES = {
    "14.2kg_NonSubsidised_DBTL": 850,
    "14.2kg_NonSubsidised_NoSubsidy": 1000,
    "14.2kg_Subsidised_DBTLExempted": 800,
    "19kg_NonDomestic": 1500,
    "5kg_NonDomestic": 600,
    "5kg_NonSubsidised_DBTL": 550,
    "5kg_NonSubsidised_NoSubsidy": 580,
    "14.2kg_NonSubsidised_DBTL_NoVAT": 900,
    "5kg_Subsidised_DBTLExempted": 500,
    "5kg_NonSubsidised_DBTL_NoVAT": 520,
    "14.2kg_Commercial": 1300,
    "19kg_Commercial": 1300
  };
  
  const CYLINDER_TYPE_ENUM = Object.keys(CYLINDER_TYPES);
  
  const SECURITY_DEPOSITS = {
    Domestic: {
      "14.2kg": 2200,
      "5kg": 1150,
      "19kg": 1700,
      "19kg_LOT": 3200,
      "47.5kg": 4300,
      "47.5kg_LOT": 5800,
      "LOT_Valve": 1500,
      "Pressure_Regulator": 150
    },
    Commercial: {
      "14.2kg": 2500,
      "5kg": 1350,
      "19kg": 2000,
      "19kg_LOT": 3500,
      "47.5kg": 4600,
      "47.5kg_LOT": 6100,
      "LOT_Valve": 1700,
      "Pressure_Regulator": 200
    }
  };
  
  const CHARGES = {
    InstallationAndDemo: {
      Domestic: { regular: 118, PMUY: 75 },
      Commercial: { regular: 150, PMUY: 75 }
    },
    DGCC: {
      Domestic: { regular: 59, PMUY: 25 },
      Commercial: { regular: 75, PMUY: 25 }
    },
    VisitCharge: {
      Domestic: 250,
      Commercial: 450
    },
    AdditionalFixedCharge: 60,
    ExtraCharge: 250
  };
  
  module.exports = {
    CYLINDER_TYPES,
    CYLINDER_TYPE_ENUM,
    SECURITY_DEPOSITS,
    CHARGES
  };