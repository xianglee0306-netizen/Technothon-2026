export const appMeta = {
  selectedName: "GridSense IQ",
  nameOptions: [
    "GridSense IQ",
    "WattWise Operations",
    "EcoGrid Sentinel",
    "Enervise Control",
    "CarbonFlux Monitor"
  ],
  modes: {
    residential: {
      label: "Residential / SME",
      shortLabel: "Residential",
      description: "Circuit-level monitoring for homes, retail units, offices, cafes, and small businesses."
    },
    enterprise: {
      label: "Enterprise / Industrial",
      shortLabel: "Enterprise",
      description: "Device, machine, department, and production-line analytics for facility and energy teams."
    }
  }
};

export const mockData = {
  residential: {
    settings: {
      tariffRate: 0.31,
      currency: "USD",
      energySavingTarget: 18,
      co2ReductionTargetKg: 90,
      notificationTime: "21:30",
      notificationPreference: "Smart reminders",
      automationPreference: "Suggest Only",
      categories: [
        "Lighting",
        "Air conditioning",
        "Kitchen appliances",
        "Office equipment",
        "Refrigeration",
        "Others"
      ],
      zones: ["Home office", "Kitchen", "Living area", "Bedrooms"]
    },
    summary: {
      totalEnergyKwh: 42.8,
      carbonKg: 28.7,
      efficiencyScore: 82,
      co2TargetProgress: 48,
      projectedMonthlyKwh: 1188,
      potentialSavingsKwh: 8.4,
      comparison: {
        yesterday: -6.2,
        lastWeek: 4.8,
        monthlyAverage: -3.4
      }
    },
    trends: {
      daily: [
        { label: "00:00", kwh: 1.2, baseline: 1.5 },
        { label: "03:00", kwh: 0.8, baseline: 1.1 },
        { label: "06:00", kwh: 2.1, baseline: 2.4 },
        { label: "09:00", kwh: 4.5, baseline: 4.2 },
        { label: "12:00", kwh: 5.7, baseline: 5.1 },
        { label: "15:00", kwh: 6.2, baseline: 5.5 },
        { label: "18:00", kwh: 9.3, baseline: 8.1 },
        { label: "21:00", kwh: 7.8, baseline: 7.1 }
      ],
      weekly: [
        { label: "Mon", kwh: 39, baseline: 43 },
        { label: "Tue", kwh: 41, baseline: 44 },
        { label: "Wed", kwh: 46, baseline: 43 },
        { label: "Thu", kwh: 43, baseline: 42 },
        { label: "Fri", kwh: 45, baseline: 44 },
        { label: "Sat", kwh: 52, baseline: 47 },
        { label: "Sun", kwh: 42.8, baseline: 45 }
      ],
      monthly: [
        { label: "Week 1", kwh: 286, baseline: 302 },
        { label: "Week 2", kwh: 301, baseline: 318 },
        { label: "Week 3", kwh: 284, baseline: 305 },
        { label: "Week 4", kwh: 317, baseline: 326 }
      ]
    },
    devices: [
      {
        id: "res-ac",
        name: "Air conditioning",
        type: "Circuit group",
        zone: "Living area",
        usageKwh: 15.9,
        trendPercent: 12,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Raise set point by 1-2 degrees during peak afternoon hours."
      },
      {
        id: "res-refrigeration",
        name: "Refrigeration",
        type: "Circuit group",
        zone: "Kitchen",
        usageKwh: 7.1,
        trendPercent: 3,
        status: "Running",
        controlEnabled: false,
        isOn: true,
        recommendation: "Check door seal and avoid long opening periods."
      },
      {
        id: "res-kitchen",
        name: "Kitchen appliances",
        type: "Circuit group",
        zone: "Kitchen",
        usageKwh: 6.8,
        trendPercent: -4,
        status: "Standby",
        controlEnabled: true,
        isOn: true,
        recommendation: "Shift high-power cooking appliances away from tariff peak windows."
      },
      {
        id: "res-office",
        name: "Office equipment",
        type: "Circuit group",
        zone: "Home office",
        usageKwh: 5.4,
        trendPercent: 8,
        status: "Idle",
        controlEnabled: true,
        isOn: true,
        recommendation: "Enable auto-sleep for monitors and printers after 10 minutes."
      },
      {
        id: "res-lighting",
        name: "Lighting",
        type: "Circuit group",
        zone: "Bedrooms",
        usageKwh: 4.8,
        trendPercent: -9,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Use schedule-based shutdown after 11 PM."
      },
      {
        id: "res-other",
        name: "Others",
        type: "Custom group",
        zone: "Mixed",
        usageKwh: 2.8,
        trendPercent: 2,
        status: "Standby",
        controlEnabled: true,
        isOn: false,
        recommendation: "Group unknown standby loads with a smart plug for visibility."
      }
    ],
    recommendations: [
      {
        id: "res-rec-1",
        priority: "High",
        title: "Air conditioning load is climbing",
        message:
          "Air conditioning usage is 12% above the weekly baseline. Consider a higher set point between 1 PM and 4 PM.",
        impact: "Save about 4.1 kWh today",
        confidence: 88,
        status: "Ready to apply"
      },
      {
        id: "res-rec-2",
        priority: "Medium",
        title: "Office devices are idle but powered",
        message:
          "Office equipment has consumed 1.3 kWh while idle. Enable automatic sleep mode for monitors and printer circuits.",
        impact: "Reduce standby cost by 9-12%",
        confidence: 81,
        status: "Suggest only"
      },
      {
        id: "res-rec-3",
        priority: "Low",
        title: "Lighting schedule can be tightened",
        message:
          "Bedroom lighting has repeated late-night usage. Add a reminder or scheduled off command after 11 PM.",
        impact: "Save about 1.2 kWh nightly",
        confidence: 76,
        status: "Reminder available"
      }
    ],
    notifications: [
      {
        id: "res-note-1",
        type: "Reminder",
        title: "Morning shutdown check",
        message: "Before leaving, check air conditioning, lighting, and kitchen circuits.",
        time: "07:45",
        severity: "Normal"
      },
      {
        id: "res-note-2",
        type: "Warning",
        title: "High usage warning",
        message: "Today is trending 4.8% above the same day last week.",
        time: "15:20",
        severity: "High"
      },
      {
        id: "res-note-3",
        type: "Summary",
        title: "Night usage summary",
        message: "Projected daily cost is within target if AC runs below 2.0 kWh before sleep.",
        time: "21:30",
        severity: "Normal"
      }
    ]
  },
  enterprise: {
    settings: {
      tariffRate: 0.52,
      currency: "USD",
      energySavingTarget: 12,
      co2ReductionTargetKg: 8200,
      notificationTime: "08:00",
      notificationPreference: "Critical alerts and shift summaries",
      automationPreference: "Suggest Only",
      categories: [
        "Production Line A",
        "Production Line B",
        "HVAC System",
        "CNC Machine",
        "Compressor",
        "Lighting Zone",
        "Server Room",
        "Other machines/zones"
      ],
      departments: ["Manufacturing", "Utilities", "Facilities", "IT", "Warehouse"],
      zones: ["North Plant", "South Plant", "Clean Room", "Warehouse", "Admin Block"]
    },
    summary: {
      totalEnergyKwh: 18420,
      carbonKg: 12341,
      efficiencyScore: 76,
      co2TargetProgress: 61,
      projectedMonthlyKwh: 526300,
      potentialSavingsKwh: 2310,
      comparison: {
        yesterday: 7.4,
        lastWeek: 18.1,
        monthlyAverage: 9.6
      }
    },
    trends: {
      daily: [
        { label: "00:00", kwh: 820, baseline: 740 },
        { label: "03:00", kwh: 760, baseline: 700 },
        { label: "06:00", kwh: 1180, baseline: 980 },
        { label: "09:00", kwh: 2420, baseline: 2160 },
        { label: "12:00", kwh: 3110, baseline: 2720 },
        { label: "15:00", kwh: 3360, baseline: 2850 },
        { label: "18:00", kwh: 2840, baseline: 2480 },
        { label: "21:00", kwh: 1930, baseline: 1750 }
      ],
      weekly: [
        { label: "Mon", kwh: 16680, baseline: 15420 },
        { label: "Tue", kwh: 17290, baseline: 15880 },
        { label: "Wed", kwh: 18120, baseline: 16240 },
        { label: "Thu", kwh: 19340, baseline: 16510 },
        { label: "Fri", kwh: 18870, baseline: 16330 },
        { label: "Sat", kwh: 12150, baseline: 10920 },
        { label: "Sun", kwh: 18420, baseline: 15600 }
      ],
      monthly: [
        { label: "Week 1", kwh: 123800, baseline: 118500 },
        { label: "Week 2", kwh: 127400, baseline: 119300 },
        { label: "Week 3", kwh: 132900, baseline: 121200 },
        { label: "Week 4", kwh: 142200, baseline: 124800 }
      ]
    },
    devices: [
      {
        id: "ent-line-a",
        name: "Production Line A",
        type: "Production line",
        department: "Manufacturing",
        zone: "North Plant",
        usageKwh: 5280,
        trendPercent: 14,
        status: "Overconsuming",
        controlEnabled: true,
        isOn: true,
        recommendation: "Stagger Line A startup sequence and inspect motor load during peak cycles."
      },
      {
        id: "ent-line-b",
        name: "Production Line B",
        type: "Production line",
        department: "Manufacturing",
        zone: "South Plant",
        usageKwh: 3920,
        trendPercent: 6,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Compare batch schedule against Line A to balance peak demand."
      },
      {
        id: "ent-hvac",
        name: "HVAC System",
        type: "Utility system",
        department: "Facilities",
        zone: "Admin Block",
        usageKwh: 2860,
        trendPercent: 18,
        status: "Overconsuming",
        controlEnabled: true,
        isOn: true,
        recommendation: "Adjust operating schedule between 1 PM and 4 PM and review chilled water set point."
      },
      {
        id: "ent-cnc",
        name: "CNC Machine Cluster",
        type: "Machine group",
        department: "Manufacturing",
        zone: "North Plant",
        usageKwh: 1910,
        trendPercent: -3,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Keep current process window; energy intensity improved versus last week."
      },
      {
        id: "ent-compressor",
        name: "Compressor",
        type: "Utility system",
        department: "Utilities",
        zone: "South Plant",
        usageKwh: 1510,
        trendPercent: 24,
        status: "Overconsuming",
        controlEnabled: true,
        isOn: true,
        recommendation: "Investigate air leakage or idle running during non-production hours."
      },
      {
        id: "ent-server",
        name: "Server Room",
        type: "Critical load",
        department: "IT",
        zone: "Admin Block",
        usageKwh: 940,
        trendPercent: 5,
        status: "Running",
        controlEnabled: false,
        isOn: true,
        recommendation: "Review cooling redundancy before any control action."
      },
      {
        id: "ent-lighting",
        name: "Lighting Zone 3",
        type: "Zone circuit",
        department: "Facilities",
        zone: "Warehouse",
        usageKwh: 720,
        trendPercent: 31,
        status: "Idle",
        controlEnabled: true,
        isOn: true,
        recommendation: "Schedule automated shutdown after warehouse shift ends."
      },
      {
        id: "ent-other",
        name: "Other machines/zones",
        type: "Mixed load",
        department: "Mixed",
        zone: "Multiple",
        usageKwh: 1280,
        trendPercent: 2,
        status: "Standby",
        controlEnabled: true,
        isOn: false,
        recommendation: "Split mixed load into named meters for clearer accountability."
      }
    ],
    recommendations: [
      {
        id: "ent-rec-1",
        priority: "Critical",
        title: "Compressor load appears abnormal",
        message:
          "Compressor load is 24% above baseline during non-production hours. Inspect possible air leakage or idle running.",
        impact: "Potentially save 680 kWh per week",
        confidence: 91,
        status: "Requires facility review"
      },
      {
        id: "ent-rec-2",
        priority: "High",
        title: "HVAC schedule is drifting from operating hours",
        message:
          "HVAC usage increased by 18% compared with last week. Consider adjusting operating schedule between 1 PM and 4 PM.",
        impact: "Reduce peak demand by 7-10%",
        confidence: 87,
        status: "Control suggestion pending"
      },
      {
        id: "ent-rec-3",
        priority: "High",
        title: "Lighting Zone 3 remains active after shift",
        message:
          "Lighting Zone 3 has continuous usage after working hours. Consider automated shutdown after the warehouse shift ends.",
        impact: "Save about 96 kWh nightly",
        confidence: 84,
        status: "Ready for approval"
      },
      {
        id: "ent-rec-4",
        priority: "Medium",
        title: "Line A peak startup can be staggered",
        message:
          "Production Line A creates the largest morning spike. Stagger motor startup by 12 minutes to reduce demand charges.",
        impact: "Lower peak demand exposure",
        confidence: 79,
        status: "Simulation available"
      }
    ],
    notifications: [
      {
        id: "ent-note-1",
        type: "Alert",
        title: "Abnormal energy spike",
        message: "Production Line A exceeded the expected demand curve by 14% during the 09:00 shift ramp.",
        time: "09:18",
        severity: "High"
      },
      {
        id: "ent-note-2",
        type: "Maintenance",
        title: "Compressor inefficiency warning",
        message: "Energy signature suggests possible air leakage or unloaded compressor cycling.",
        time: "02:40",
        severity: "Critical"
      },
      {
        id: "ent-note-3",
        type: "Sustainability",
        title: "Monthly CO2 target progress",
        message: "Current actions cover 61% of the monthly CO2 reduction target.",
        time: "08:00",
        severity: "Normal"
      },
      {
        id: "ent-note-4",
        type: "Approval",
        title: "AI control recommendation pending",
        message: "Approve scheduled shutdown for Lighting Zone 3 after warehouse shift handover.",
        time: "18:35",
        severity: "High"
      }
    ]
  }
};
