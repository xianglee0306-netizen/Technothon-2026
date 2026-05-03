export const appMeta = {
  selectedName: "GridSenseIQ",
  tagline: "Software gives insight. Hardware gives evidence.",
  nameOptions: [
    "GridSenseIQ",
    "WattWise Operations",
    "EcoGrid Sentinel",
    "Enervise Control",
    "CarbonFlux Monitor"
  ],
  modes: {
    residential: {
      label: "Residential",
      shortLabel: "Residential",
      description: "Energy monitoring hardware and software insights for homes and apartments."
    },
    business: {
      label: "Commercial",
      shortLabel: "Commercial",
      description: "Energy intelligence for shops, cafes, clinics, small offices, and retail spaces."
    },
    enterprise: {
      label: "Industry",
      shortLabel: "Industry",
      description: "Facility-level intelligence for factories, warehouses, large buildings, and industrial sites."
    }
  }
};

export const mockData = {
  residential: {
    settings: {
      tariffRate: 0.57,
      currency: "MYR",
      energySavingTarget: 18,
      co2ReductionTargetKg: 90,
      morningNotificationTime: "07:45",
      nightNotificationTime: "21:30",
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
      hourly: [
        { label: "00:00", kwh: 1.2, baseline: 1.5 },
        { label: "03:00", kwh: 0.8, baseline: 1.1 },
        { label: "06:00", kwh: 2.1, baseline: 2.4 },
        { label: "09:00", kwh: 4.5, baseline: 4.2 },
        { label: "12:00", kwh: 5.7, baseline: 5.1 },
        { label: "15:00", kwh: 6.2, baseline: 5.5 },
        { label: "18:00", kwh: 9.3, baseline: 8.1 },
        { label: "21:00", kwh: 7.8, baseline: 7.1 }
      ],
      daily: [
        { label: "Mon", kwh: 39, baseline: 43 },
        { label: "Tue", kwh: 41, baseline: 44 },
        { label: "Wed", kwh: 46, baseline: 43 },
        { label: "Thu", kwh: 43, baseline: 42 },
        { label: "Fri", kwh: 45, baseline: 44 },
        { label: "Sat", kwh: 52, baseline: 47 },
        { label: "Sun", kwh: 42.8, baseline: 45 }
      ],
      weekly: [
        { label: "Week 1", kwh: 286, baseline: 302 },
        { label: "Week 2", kwh: 301, baseline: 318 },
        { label: "Week 3", kwh: 284, baseline: 305 },
        { label: "Week 4", kwh: 317, baseline: 326 }
      ],
      monthly: [
        { label: "Jan", kwh: 1120, baseline: 1190 },
        { label: "Feb", kwh: 1088, baseline: 1160 },
        { label: "Mar", kwh: 1196, baseline: 1228 },
        { label: "Apr", kwh: 1188, baseline: 1254 }
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
        riskLevel: "High",
        title: "Air conditioning contributed the highest cost today",
        message:
          "Air conditioning contributed the highest cost today. Consider increasing the setpoint by 1-2 degrees C.",
        impact: "Save about 4.1 kWh today",
        confidence: 88,
        status: "Ready to apply",
        estimatedSavingsKwh: 4.1,
        estimatedSavingsCost: 2.34,
        estimatedCo2ReductionKg: 2.7,
        linkedDeviceId: "res-ac",
        target: "Living area AC circuit",
        requiresApproval: false
      },
      {
        id: "res-rec-2",
        priority: "Medium",
        riskLevel: "Medium",
        title: "Kitchen appliance usage peaked during evening hours",
        message:
          "Kitchen appliance usage peaked during evening hours. Review standby usage after dinner.",
        impact: "Reduce standby cost by 9-12%",
        confidence: 81,
        status: "Suggest only",
        estimatedSavingsKwh: 1.8,
        estimatedSavingsCost: 1.03,
        estimatedCo2ReductionKg: 1.2,
        linkedDeviceId: "res-kitchen",
        target: "Kitchen appliance smart plug group",
        requiresApproval: false
      },
      {
        id: "res-rec-3",
        priority: "Low",
        riskLevel: "Low",
        title: "Lighting usage continued after midnight",
        message:
          "Lighting usage continued after midnight. Consider enabling automatic reminders.",
        impact: "Save about 1.2 kWh nightly",
        confidence: 76,
        status: "Reminder available",
        estimatedSavingsKwh: 1.2,
        estimatedSavingsCost: 0.68,
        estimatedCo2ReductionKg: 0.8,
        linkedDeviceId: "res-lighting",
        target: "Bedroom and outdoor lighting",
        requiresApproval: false
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
    ],
    occupancyZones: [
      {
        id: "res-zone-living",
        name: "Living Area",
        occupancyPercent: 18,
        peopleCount: 1,
        capacity: 5,
        currentKwh: 15.9,
        baselineKwh: 12.5,
        wastedKwh: 3.4,
        wasteCost: 1.94,
        loadStatus: "Cooling active with low occupancy",
        risk: "High",
        sensorType: "PIR + smart meter",
        recommendation: "Raise AC setpoint and dim lighting while occupancy remains below 25%.",
        linkedDeviceIds: ["res-ac", "res-lighting"]
      },
      {
        id: "res-zone-kitchen",
        name: "Kitchen",
        occupancyPercent: 55,
        peopleCount: 2,
        capacity: 4,
        currentKwh: 6.8,
        baselineKwh: 6.2,
        wastedKwh: 0.8,
        wasteCost: 0.46,
        loadStatus: "Appliance overlap",
        risk: "Medium",
        sensorType: "Smart plug + CO2 sensor",
        recommendation: "Shift non-urgent appliance cycles outside the evening peak window.",
        linkedDeviceIds: ["res-kitchen", "res-refrigeration"]
      },
      {
        id: "res-zone-bedroom",
        name: "Bedroom",
        occupancyPercent: 0,
        peopleCount: 0,
        capacity: 2,
        currentKwh: 4.8,
        baselineKwh: 2.4,
        wastedKwh: 2.2,
        wasteCost: 1.25,
        loadStatus: "Lighting active while empty",
        risk: "Critical",
        sensorType: "PIR + smart relay",
        recommendation: "Auto-switch bedroom lighting after 10 minutes of no detected motion.",
        linkedDeviceIds: ["res-lighting"]
      },
      {
        id: "res-zone-office",
        name: "Home Office",
        occupancyPercent: 12,
        peopleCount: 1,
        capacity: 2,
        currentKwh: 5.4,
        baselineKwh: 4.1,
        wastedKwh: 1.1,
        wasteCost: 0.63,
        loadStatus: "Idle electronics",
        risk: "High",
        sensorType: "Smart plug + PIR",
        recommendation: "Put displays and printer into auto-sleep after 10 minutes of inactivity.",
        linkedDeviceIds: ["res-office"]
      },
      {
        id: "res-zone-outdoor",
        name: "Balcony / Outdoor Lighting",
        occupancyPercent: 0,
        peopleCount: 0,
        capacity: 0,
        currentKwh: 2.1,
        baselineKwh: 0.6,
        wastedKwh: 1.5,
        wasteCost: 0.86,
        loadStatus: "Lighting left on",
        risk: "Critical",
        sensorType: "Lux sensor + PIR",
        recommendation: "Use daylight threshold and occupancy timeout for outdoor lighting.",
        linkedDeviceIds: ["res-lighting"]
      }
    ],
    twinScenarios: [
      {
        id: "baseline",
        name: "Baseline",
        description: "Current profile with existing schedules, alerts, and manual controls.",
        beforeKwh: 42.8,
        afterKwh: 42.8,
        savingsKwh: 0,
        savingsPercent: 0,
        savingsCost: 0,
        co2ReductionKg: 0,
        scoreBefore: 82,
        scoreAfter: 82,
        confidence: 98,
        actions: ["Keep monitoring current daily load profile"]
      },
      {
        id: "occupancy-shutdown",
        name: "Occupancy-based shutdown",
        description: "Shut down lights and idle plug loads in empty or low-use rooms.",
        beforeKwh: 42.8,
        afterKwh: 37.4,
        savingsKwh: 5.4,
        savingsPercent: 12.6,
        savingsCost: 3.08,
        co2ReductionKg: 3.6,
        scoreBefore: 82,
        scoreAfter: 88,
        confidence: 86,
        actions: ["Bedroom lighting timeout", "Home office smart-plug sleep mode", "Outdoor lux threshold"]
      },
      {
        id: "peak-demand-shaving",
        name: "Peak demand shaving",
        description: "Shift appliance overlap away from the evening peak window.",
        beforeKwh: 42.8,
        afterKwh: 38.9,
        savingsKwh: 3.9,
        savingsPercent: 9.1,
        savingsCost: 2.22,
        co2ReductionKg: 2.6,
        scoreBefore: 82,
        scoreAfter: 87,
        confidence: 84,
        actions: ["Delay washing cycle", "Avoid AC boost during cooking peak", "Schedule dishwasher after 21:00"]
      },
      {
        id: "hvac-schedule-optimization",
        name: "HVAC schedule optimization",
        description: "Tune AC setpoint and runtime based on occupancy and room heat gain.",
        beforeKwh: 42.8,
        afterKwh: 37.6,
        savingsKwh: 5.2,
        savingsPercent: 12.1,
        savingsCost: 2.96,
        co2ReductionKg: 3.5,
        scoreBefore: 82,
        scoreAfter: 89,
        confidence: 88,
        actions: ["Raise setpoint by 1 degree C", "Pre-cool only occupied zones", "Limit boost mode to 20 minutes"]
      },
      {
        id: "fault-maintenance",
        name: "Compressor fault maintenance",
        description: "Detect inefficient compressor cycling in AC or refrigeration loads.",
        beforeKwh: 42.8,
        afterKwh: 39.8,
        savingsKwh: 3,
        savingsPercent: 7,
        savingsCost: 1.71,
        co2ReductionKg: 2,
        scoreBefore: 82,
        scoreAfter: 86,
        confidence: 80,
        actions: ["Check refrigerator door seal", "Inspect AC compressor short cycling", "Clean filters"]
      },
      {
        id: "full-ai-optimization",
        name: "Full AI optimization",
        description: "Combine occupancy shutdown, peak shifting, HVAC scheduling, and fault diagnosis.",
        beforeKwh: 42.8,
        afterKwh: 34.4,
        savingsKwh: 8.4,
        savingsPercent: 19.6,
        savingsCost: 4.79,
        co2ReductionKg: 5.6,
        scoreBefore: 82,
        scoreAfter: 92,
        confidence: 90,
        actions: ["Apply safe automation rules", "Request approval for sensitive loads", "Track savings against weekly target"]
      }
    ],
    peakPlan: {
      intervals: [
        {
          id: "res-peak-1",
          window: "18:00 - 21:00",
          peakKwh: 9.3,
          baselineKwh: 8.1,
          cause: "AC + kitchen appliances + washing machine overlap",
          suggestedAction: "Delay washing machine cycle by 45 minutes and avoid AC boost while cooking.",
          shiftMinutes: 45,
          expectedReductionPercent: "9-12%",
          estimatedSavingsKwh: 2.6,
          risk: "Low"
        }
      ],
      optimizedTrend: [
        { label: "12:00", current: 5.7, optimized: 5.5 },
        { label: "15:00", current: 6.2, optimized: 5.8 },
        { label: "18:00", current: 9.3, optimized: 8.2 },
        { label: "21:00", current: 7.8, optimized: 7.0 },
        { label: "23:00", current: 3.1, optimized: 3.6 }
      ]
    },
    automationRules: [
      {
        id: "res-rule-1",
        name: "Empty-room lighting timeout",
        condition: "IF occupancy = 0 for 10 minutes",
        action: "THEN turn off bedroom and outdoor lighting",
        enabled: true,
        riskLevel: "Low",
        requiresApproval: false,
        estimatedSavingsKwh: 2.7,
        lastTriggered: "23:18",
        status: "Monitoring"
      },
      {
        id: "res-rule-2",
        name: "AC low-occupancy setpoint",
        condition: "IF living area occupancy is below 25%",
        action: "THEN recommend AC setpoint adjustment",
        enabled: true,
        riskLevel: "Medium",
        requiresApproval: false,
        estimatedSavingsKwh: 4.1,
        lastTriggered: "15:40",
        status: "Triggered today"
      },
      {
        id: "res-rule-3",
        name: "Critical refrigeration guard",
        condition: "IF device is refrigeration or critical load",
        action: "THEN require approval before control",
        enabled: true,
        riskLevel: "High",
        requiresApproval: true,
        estimatedSavingsKwh: 0.8,
        lastTriggered: "Never",
        status: "Safety guard"
      }
    ],
    approvalQueue: [
      {
        id: "res-approval-1",
        title: "Delay washing machine cycle",
        target: "Kitchen appliance group",
        recommendationId: "res-rec-2",
        riskLevel: "Medium",
        expectedSavingsKwh: 1.8,
        reason: "Changes occupant schedule and should be confirmed by the user.",
        status: "Pending",
        requestedBy: "AI Copilot",
        requestedAt: "18:05"
      }
    ],
    auditLog: [
      {
        id: "res-audit-1",
        time: "07:45",
        actor: "System",
        action: "Morning shutdown reminder",
        target: "Home profile",
        status: "Delivered",
        impactKwh: 0,
        note: "Reminder generated from local profile settings."
      },
      {
        id: "res-audit-2",
        time: "15:40",
        actor: "AI Rule Engine",
        action: "Recommended AC setpoint adjustment",
        target: "Living area AC",
        status: "Simulated",
        impactKwh: 4.1,
        note: "Low occupancy and high cooling load detected."
      }
    ],
    roiModel: {
      packageName: "standard",
      hardwareCost: 1850,
      installationCost: 950,
      softwareCost: 400,
      totalCost: 3200,
      estimatedMonthlySavingsKwh: 1193,
      estimatedMonthlySavingsCost: 680,
      estimatedAnnualSavingsCost: 8160,
      paybackMonths: 4.7,
      roiPercent: 155,
      carbonSavingsPerMonthKg: 169,
      assumptions: {
        tariffRate: 0.57,
        zones: 5,
        sensors: 9
      }
    },
    retrofitPlan: [
      {
        id: "res-retrofit-1",
        zone: "Living Area",
        recommendedSensor: "PIR occupancy sensor + temperature sensor",
        controlDevice: "IR AC controller + smart relay",
        meteringDevice: "Smart plug meter",
        gateway: "ESP32 Wi-Fi gateway",
        installDifficulty: "Medium",
        estimatedCost: 780,
        notes: "Non-invasive retrofit for AC and lighting behavior simulation."
      },
      {
        id: "res-retrofit-2",
        zone: "Kitchen",
        recommendedSensor: "CO2 sensor + smart plug presence proxy",
        controlDevice: "Smart plug",
        meteringDevice: "Plug-level energy meter",
        gateway: "Wi-Fi router / ESP32 gateway",
        installDifficulty: "Easy",
        estimatedCost: 520,
        notes: "Use scheduling rules for non-critical appliance loads."
      },
      {
        id: "res-retrofit-3",
        zone: "Bedroom",
        recommendedSensor: "PIR sensor",
        controlDevice: "Smart lighting relay",
        meteringDevice: "Lighting circuit CT clamp",
        gateway: "ESP32 gateway",
        installDifficulty: "Medium",
        estimatedCost: 640,
        notes: "Requires electrician if installed at switch box."
      },
      {
        id: "res-retrofit-4",
        zone: "Home Office",
        recommendedSensor: "PIR sensor",
        controlDevice: "Smart plug strip",
        meteringDevice: "Smart plug meter",
        gateway: "Wi-Fi router",
        installDifficulty: "Easy",
        estimatedCost: 390,
        notes: "Fastest payback through standby load reduction."
      },
      {
        id: "res-retrofit-5",
        zone: "Outdoor Lighting",
        recommendedSensor: "Lux sensor + PIR sensor",
        controlDevice: "Weather-rated smart relay",
        meteringDevice: "Lighting CT clamp",
        gateway: "ESP32 gateway",
        installDifficulty: "Medium",
        estimatedCost: 580,
        notes: "Use daylight threshold plus motion timeout."
      }
    ],
    anomalies: [
      {
        id: "res-anomaly-1",
        title: "AC cooling load is high for low occupancy",
        severity: "High",
        deviceId: "res-ac",
        zone: "Living Area",
        deviationPercent: 22,
        detectedPattern: "Cooling remains elevated after occupancy drops below 25%.",
        likelyCauses: ["Setpoint too low", "Heat gain from open balcony door", "Dirty filter reducing efficiency"],
        recommendedAction: "Raise setpoint by 1 degree C and check filter condition.",
        confidence: 88,
        estimatedLossKwh: 4.1
      },
      {
        id: "res-anomaly-2",
        title: "Bedroom lighting remains active while empty",
        severity: "Critical",
        deviceId: "res-lighting",
        zone: "Bedroom",
        deviationPercent: 46,
        detectedPattern: "PIR simulation shows zero occupancy while load remains above baseline.",
        likelyCauses: ["Manual switch left on", "Schedule not configured", "No occupancy timeout"],
        recommendedAction: "Enable empty-room lighting timeout rule.",
        confidence: 84,
        estimatedLossKwh: 2.2
      },
      {
        id: "res-anomaly-3",
        title: "Refrigeration cycling is slightly above baseline",
        severity: "Medium",
        deviceId: "res-refrigeration",
        zone: "Kitchen",
        deviationPercent: 11,
        detectedPattern: "Short compressor cycles appear more frequently than expected.",
        likelyCauses: ["Door seal leakage", "Frequent opening", "Warm food load"],
        recommendedAction: "Inspect door seal and reduce long opening periods.",
        confidence: 73,
        estimatedLossKwh: 0.8
      }
    ],
    carbonStory: {
      currentMonthlyKg: 861,
      optimizedMonthlyKg: 692,
      reductionKg: 169,
      treeEquivalent: 8,
      carKmAvoided: 702,
      phoneChargesEquivalent: 21125,
      ledBulbHoursEquivalent: 16900,
      story: "Applying today's AI recommendations could reduce about 169 kg CO2e monthly, roughly equivalent to 8 mature trees absorbing carbon for a year."
    },
    energyScore: {
      overall: 82,
      automationReadiness: 78,
      wasteReduction: 80,
      carbonPerformance: 76,
      costEfficiency: 84,
      occupancyAlignment: 72,
      peakDemandControl: 79,
      retrofitReadiness: 86
    }
  },
  enterprise: {
    settings: {
      tariffRate: 0.50,
      currency: "MYR",
      energySavingTarget: 12,
      co2ReductionTargetKg: 8200,
      morningNotificationTime: "08:00",
      nightNotificationTime: "18:30",
      notificationTime: "08:00",
      notificationPreference: "Critical alerts and shift summaries",
      automationPreference: "Suggest Only",
      categories: [
        "Production Line A",
        "Production Line B",
        "HVAC System",
        "Compressor Room",
        "Server Room",
        "Lighting Zone",
        "Office Area",
        "Warehouse"
      ],
      departments: ["Manufacturing", "Utilities", "Facilities", "IT", "Warehouse"],
      zones: [
        "Production Line A",
        "Production Line B",
        "HVAC System",
        "Compressor Room",
        "Server Room",
        "Lighting Zone",
        "Office Area",
        "Warehouse"
      ]
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
      hourly: [
        { label: "00:00", kwh: 820, baseline: 740 },
        { label: "03:00", kwh: 760, baseline: 700 },
        { label: "06:00", kwh: 1180, baseline: 980 },
        { label: "09:00", kwh: 2420, baseline: 2160 },
        { label: "12:00", kwh: 3110, baseline: 2720 },
        { label: "15:00", kwh: 3360, baseline: 2850 },
        { label: "18:00", kwh: 2840, baseline: 2480 },
        { label: "21:00", kwh: 1930, baseline: 1750 }
      ],
      daily: [
        { label: "Mon", kwh: 16680, baseline: 15420 },
        { label: "Tue", kwh: 17290, baseline: 15880 },
        { label: "Wed", kwh: 18120, baseline: 16240 },
        { label: "Thu", kwh: 19340, baseline: 16510 },
        { label: "Fri", kwh: 18870, baseline: 16330 },
        { label: "Sat", kwh: 12150, baseline: 10920 },
        { label: "Sun", kwh: 18420, baseline: 15600 }
      ],
      weekly: [
        { label: "Week 1", kwh: 123800, baseline: 118500 },
        { label: "Week 2", kwh: 127400, baseline: 119300 },
        { label: "Week 3", kwh: 132900, baseline: 121200 },
        { label: "Week 4", kwh: 142200, baseline: 124800 }
      ],
      monthly: [
        { label: "Jan", kwh: 498200, baseline: 476400 },
        { label: "Feb", kwh: 512900, baseline: 487800 },
        { label: "Mar", kwh: 519700, baseline: 493300 },
        { label: "Apr", kwh: 526300, baseline: 501900 }
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
        name: "Compressor Room",
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
        name: "Lighting Zone",
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
        name: "Warehouse",
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
        riskLevel: "Critical",
        title: "Compressor load appears abnormal",
        message:
          "Compressor load is 24% above baseline during non-production hours. Inspect possible air leakage or idle running.",
        impact: "Potentially save 680 kWh per week",
        confidence: 91,
        status: "Requires facility review",
        estimatedSavingsKwh: 680,
        estimatedSavingsCost: 340,
        estimatedCo2ReductionKg: 456,
        linkedDeviceId: "ent-compressor",
        target: "Compressor Room",
        requiresApproval: true
      },
      {
        id: "ent-rec-2",
        priority: "High",
        riskLevel: "High",
        title: "HVAC schedule is drifting from operating hours",
        message:
          "HVAC usage increased by 18% compared with last week. Consider adjusting operating schedule between 1 PM and 4 PM.",
        impact: "Reduce peak demand by 7-10%",
        confidence: 87,
        status: "Control suggestion pending",
        estimatedSavingsKwh: 430,
        estimatedSavingsCost: 215,
        estimatedCo2ReductionKg: 288,
        linkedDeviceId: "ent-hvac",
        target: "HVAC/Admin Block",
        requiresApproval: true
      },
      {
        id: "ent-rec-3",
        priority: "High",
        riskLevel: "High",
        title: "Lighting Zone 3 remains active after shift",
        message:
          "Lighting Zone 3 has continuous usage after working hours. Consider automated shutdown after the warehouse shift ends.",
        impact: "Save about 96 kWh nightly",
        confidence: 84,
        status: "Ready for approval",
        estimatedSavingsKwh: 96,
        estimatedSavingsCost: 48,
        estimatedCo2ReductionKg: 64,
        linkedDeviceId: "ent-lighting",
        target: "Warehouse lighting",
        requiresApproval: true
      },
      {
        id: "ent-rec-4",
        priority: "Medium",
        riskLevel: "Medium",
        title: "Line A peak startup can be staggered",
        message:
          "Production Line A creates the largest morning spike. Stagger motor startup by 12 minutes to reduce demand charges.",
        impact: "Lower peak demand exposure",
        confidence: 79,
        status: "Simulation available",
        estimatedSavingsKwh: 320,
        estimatedSavingsCost: 160,
        estimatedCo2ReductionKg: 214,
        linkedDeviceId: "ent-line-a",
        target: "Production Line A startup",
        requiresApproval: false
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
    ],
    occupancyZones: [
      {
        id: "ent-zone-line-a",
        name: "Production Line A",
        occupancyPercent: 92,
        peopleCount: 18,
        capacity: 20,
        currentKwh: 5280,
        baselineKwh: 4800,
        wastedKwh: 180,
        wasteCost: 90,
        loadStatus: "High load with active production",
        risk: "Medium",
        sensorType: "Thermal camera + CT clamp",
        recommendation: "Stagger motor startup and compare demand with batch schedule.",
        linkedDeviceIds: ["ent-line-a"]
      },
      {
        id: "ent-zone-line-b",
        name: "Production Line B",
        occupancyPercent: 68,
        peopleCount: 14,
        capacity: 20,
        currentKwh: 3920,
        baselineKwh: 3700,
        wastedKwh: 220,
        wasteCost: 110,
        loadStatus: "Moderate production load",
        risk: "Medium",
        sensorType: "Smart meter + shift roster",
        recommendation: "Balance batch schedule against Line A demand spikes.",
        linkedDeviceIds: ["ent-line-b"]
      },
      {
        id: "ent-zone-hvac",
        name: "HVAC/Admin Block",
        occupancyPercent: 24,
        peopleCount: 22,
        capacity: 90,
        currentKwh: 2860,
        baselineKwh: 2100,
        wastedKwh: 760,
        wasteCost: 380,
        loadStatus: "Cooling high while underutilized",
        risk: "Critical",
        sensorType: "CO2 sensor + thermal sensor + BMS meter",
        recommendation: "Pre-cool earlier, raise setpoint, and reduce airflow to empty meeting rooms.",
        linkedDeviceIds: ["ent-hvac"]
      },
      {
        id: "ent-zone-compressor",
        name: "Compressor Room",
        occupancyPercent: 0,
        peopleCount: 0,
        capacity: 2,
        currentKwh: 1510,
        baselineKwh: 980,
        wastedKwh: 530,
        wasteCost: 265,
        loadStatus: "Utility running after production",
        risk: "Critical",
        sensorType: "CT clamp + pressure sensor",
        recommendation: "Inspect air leakage and unloaded cycling during non-production hours.",
        linkedDeviceIds: ["ent-compressor"]
      },
      {
        id: "ent-zone-server",
        name: "Server Room",
        occupancyPercent: 100,
        peopleCount: 0,
        capacity: 0,
        currentKwh: 940,
        baselineKwh: 900,
        wastedKwh: 30,
        wasteCost: 15,
        loadStatus: "Critical load protected",
        risk: "Low",
        sensorType: "Smart meter + temperature sensor",
        recommendation: "Monitor cooling efficiency; require approval before any control action.",
        linkedDeviceIds: ["ent-server"]
      },
      {
        id: "ent-zone-warehouse",
        name: "Warehouse Lighting",
        occupancyPercent: 8,
        peopleCount: 3,
        capacity: 40,
        currentKwh: 720,
        baselineKwh: 390,
        wastedKwh: 330,
        wasteCost: 165,
        loadStatus: "Lighting active after handover",
        risk: "High",
        sensorType: "PIR mesh + smart relay",
        recommendation: "Auto-dim aisles and shut down empty sections after shift handover.",
        linkedDeviceIds: ["ent-lighting"]
      },
      {
        id: "ent-zone-office",
        name: "Office Area",
        occupancyPercent: 15,
        peopleCount: 11,
        capacity: 72,
        currentKwh: 680,
        baselineKwh: 430,
        wastedKwh: 250,
        wasteCost: 125,
        loadStatus: "Plug loads and cooling remain high",
        risk: "High",
        sensorType: "CO2 sensor + plug meter",
        recommendation: "Use occupancy setback for office HVAC and plug-load reminders.",
        linkedDeviceIds: ["ent-hvac", "ent-lighting"]
      },
      {
        id: "ent-zone-meeting",
        name: "Meeting Room",
        occupancyPercent: 0,
        peopleCount: 0,
        capacity: 12,
        currentKwh: 210,
        baselineKwh: 60,
        wastedKwh: 150,
        wasteCost: 75,
        loadStatus: "Cooling and lights active while empty",
        risk: "Critical",
        sensorType: "PIR + CO2 sensor + smart relay",
        recommendation: "Auto-release room schedule and shut down HVAC/light relay.",
        linkedDeviceIds: ["ent-hvac", "ent-lighting"]
      }
    ],
    twinScenarios: [
      {
        id: "baseline",
        name: "Baseline",
        description: "Current operating schedule and observed device behavior.",
        beforeKwh: 18420,
        afterKwh: 18420,
        savingsKwh: 0,
        savingsPercent: 0,
        savingsCost: 0,
        co2ReductionKg: 0,
        scoreBefore: 76,
        scoreAfter: 76,
        confidence: 98,
        actions: ["Keep collecting telemetry for comparison"]
      },
      {
        id: "occupancy-shutdown",
        name: "Occupancy-based shutdown",
        description: "Reduce loads in underutilized spaces using simulated PIR, CO2, thermal, and meter signals.",
        beforeKwh: 18420,
        afterKwh: 17110,
        savingsKwh: 1310,
        savingsPercent: 7.1,
        savingsCost: 655,
        co2ReductionKg: 878,
        scoreBefore: 76,
        scoreAfter: 80,
        confidence: 84,
        actions: ["Warehouse aisle dimming", "Meeting room HVAC setback", "Office plug-load reminders"]
      },
      {
        id: "peak-demand-shaving",
        name: "Peak demand shaving",
        description: "Separate startup and HVAC ramp events to flatten the morning demand curve.",
        beforeKwh: 18420,
        afterKwh: 16980,
        savingsKwh: 1440,
        savingsPercent: 7.8,
        savingsCost: 720,
        co2ReductionKg: 965,
        scoreBefore: 76,
        scoreAfter: 82,
        confidence: 86,
        actions: ["Delay Line A startup by 12 minutes", "Pre-cool admin block earlier", "Shift compressor purge cycle"]
      },
      {
        id: "hvac-schedule-optimization",
        name: "HVAC schedule optimization",
        description: "Tune setpoints, airflow, and pre-cooling around occupancy and shift patterns.",
        beforeKwh: 18420,
        afterKwh: 16640,
        savingsKwh: 1780,
        savingsPercent: 9.7,
        savingsCost: 890,
        co2ReductionKg: 1193,
        scoreBefore: 76,
        scoreAfter: 84,
        confidence: 88,
        actions: ["Admin block setpoint reset", "Meeting room occupancy setback", "Earlier pre-cooling window"]
      },
      {
        id: "fault-maintenance",
        name: "Compressor fault maintenance",
        description: "Detect inefficient compressor load after production hours and plan maintenance.",
        beforeKwh: 18420,
        afterKwh: 17020,
        savingsKwh: 1400,
        savingsPercent: 7.6,
        savingsCost: 700,
        co2ReductionKg: 938,
        scoreBefore: 76,
        scoreAfter: 83,
        confidence: 91,
        actions: ["Inspect air leakage", "Check pressure valve", "Reduce unloaded cycling after shift"]
      },
      {
        id: "full-ai-optimization",
        name: "Full AI optimization",
        description: "Combine occupancy controls, peak shaving, HVAC schedule optimization, and anomaly maintenance.",
        beforeKwh: 18420,
        afterKwh: 16110,
        savingsKwh: 2310,
        savingsPercent: 12.5,
        savingsCost: 1155,
        co2ReductionKg: 1548,
        scoreBefore: 76,
        scoreAfter: 89,
        confidence: 92,
        actions: ["Apply safe rules", "Queue high-risk controls for approval", "Schedule compressor maintenance"]
      }
    ],
    peakPlan: {
      intervals: [
        {
          id: "ent-peak-1",
          window: "09:00 - 12:00",
          peakKwh: 3110,
          baselineKwh: 2720,
          cause: "Production Line A startup + HVAC ramp overlap",
          suggestedAction: "Delay Line A startup by 12 minutes and pre-cool admin block earlier.",
          shiftMinutes: 12,
          expectedReductionPercent: "7-10%",
          estimatedSavingsKwh: 880,
          risk: "Medium"
        },
        {
          id: "ent-peak-2",
          window: "15:00 - 18:00",
          peakKwh: 3360,
          baselineKwh: 2850,
          cause: "HVAC afternoon load + compressor cycling",
          suggestedAction: "Move compressor purge cycle outside the 15:00 peak and reduce admin block airflow.",
          shiftMinutes: 18,
          expectedReductionPercent: "6-8%",
          estimatedSavingsKwh: 560,
          risk: "High"
        }
      ],
      optimizedTrend: [
        { label: "06:00", current: 1180, optimized: 1080 },
        { label: "09:00", current: 2420, optimized: 2240 },
        { label: "12:00", current: 3110, optimized: 2870 },
        { label: "15:00", current: 3360, optimized: 3040 },
        { label: "18:00", current: 2840, optimized: 2610 },
        { label: "21:00", current: 1930, optimized: 1840 }
      ]
    },
    automationRules: [
      {
        id: "ent-rule-1",
        name: "Warehouse empty-zone shutdown",
        condition: "IF occupancy = 0 for 10 minutes",
        action: "THEN turn off or dim warehouse lighting",
        enabled: true,
        riskLevel: "Medium",
        requiresApproval: false,
        estimatedSavingsKwh: 330,
        lastTriggered: "18:42",
        status: "Monitoring"
      },
      {
        id: "ent-rule-2",
        name: "HVAC baseline drift guard",
        condition: "IF HVAC usage exceeds baseline by 15%",
        action: "THEN recommend chilled-water setpoint adjustment",
        enabled: true,
        riskLevel: "High",
        requiresApproval: true,
        estimatedSavingsKwh: 430,
        lastTriggered: "14:10",
        status: "Approval required"
      },
      {
        id: "ent-rule-3",
        name: "Compressor after-shift anomaly",
        condition: "IF compressor load is above baseline after shift",
        action: "THEN trigger maintenance alert",
        enabled: true,
        riskLevel: "Critical",
        requiresApproval: true,
        estimatedSavingsKwh: 680,
        lastTriggered: "02:40",
        status: "Triggered today"
      },
      {
        id: "ent-rule-4",
        name: "Critical load approval guard",
        condition: "IF device is critical load",
        action: "THEN require approval before control",
        enabled: true,
        riskLevel: "Critical",
        requiresApproval: true,
        estimatedSavingsKwh: 0,
        lastTriggered: "08:00",
        status: "Safety guard"
      },
      {
        id: "ent-rule-5",
        name: "Savings target reminder",
        condition: "IF monthly savings target is behind",
        action: "THEN increase reminder frequency",
        enabled: false,
        riskLevel: "Low",
        requiresApproval: false,
        estimatedSavingsKwh: 120,
        lastTriggered: "Never",
        status: "Disabled"
      }
    ],
    approvalQueue: [
      {
        id: "ent-approval-1",
        title: "Approve warehouse lighting shutdown",
        target: "Warehouse Lighting",
        recommendationId: "ent-rec-3",
        riskLevel: "High",
        expectedSavingsKwh: 96,
        reason: "Lighting changes affect worker safety and shift handover visibility.",
        status: "Pending",
        requestedBy: "AI Rule Engine",
        requestedAt: "18:35"
      },
      {
        id: "ent-approval-2",
        title: "Schedule compressor maintenance inspection",
        target: "Compressor Room",
        recommendationId: "ent-rec-1",
        riskLevel: "Critical",
        expectedSavingsKwh: 680,
        reason: "Potential air-system fault requires facility team review before operational changes.",
        status: "Pending",
        requestedBy: "AI Copilot",
        requestedAt: "02:45"
      }
    ],
    auditLog: [
      {
        id: "ent-audit-1",
        time: "02:40",
        actor: "AI Anomaly Detector",
        action: "Flagged compressor inefficiency",
        target: "Compressor Room",
        status: "Open",
        impactKwh: 680,
        note: "Load signature remained 24% above baseline after production hours."
      },
      {
        id: "ent-audit-2",
        time: "09:18",
        actor: "Demand Shaving Planner",
        action: "Detected startup overlap",
        target: "Production Line A + HVAC",
        status: "Simulated",
        impactKwh: 880,
        note: "Peak window can be reduced by staggering startup."
      },
      {
        id: "ent-audit-3",
        time: "18:35",
        actor: "AI Rule Engine",
        action: "Requested safe automation approval",
        target: "Warehouse Lighting",
        status: "Pending approval",
        impactKwh: 96,
        note: "Human review required for after-shift lighting control."
      }
    ],
    roiModel: {
      packageName: "advanced",
      hardwareCost: 34200,
      installationCost: 16600,
      softwareCost: 7400,
      totalCost: 58200,
      estimatedMonthlySavingsKwh: 69300,
      estimatedMonthlySavingsCost: 34650,
      estimatedAnnualSavingsCost: 415800,
      paybackMonths: 1.7,
      roiPercent: 614,
      carbonSavingsPerMonthKg: 46431,
      assumptions: {
        tariffRate: 0.5,
        zones: 8,
        sensors: 32
      }
    },
    retrofitPlan: [
      {
        id: "ent-retrofit-1",
        zone: "Production Line A",
        recommendedSensor: "Thermal occupancy camera",
        controlDevice: "Contactor controller",
        meteringDevice: "DIN rail meter + CT clamps",
        gateway: "Industrial ESP32 / Modbus gateway",
        installDifficulty: "Hard",
        estimatedCost: 8900,
        notes: "Coordinate with production schedule and motor protection settings."
      },
      {
        id: "ent-retrofit-2",
        zone: "Production Line B",
        recommendedSensor: "Thermal sensor + shift roster input",
        controlDevice: "Contactor controller",
        meteringDevice: "DIN rail meter",
        gateway: "Modbus gateway",
        installDifficulty: "Hard",
        estimatedCost: 7600,
        notes: "Use for demand balancing rather than full automated shutdown."
      },
      {
        id: "ent-retrofit-3",
        zone: "HVAC/Admin Block",
        recommendedSensor: "CO2 sensor + temperature sensor",
        controlDevice: "BMS setpoint interface",
        meteringDevice: "Smart meter / chilled-water meter",
        gateway: "BACnet or Modbus gateway",
        installDifficulty: "Medium",
        estimatedCost: 9800,
        notes: "Best candidate for occupancy-based setpoint optimization."
      },
      {
        id: "ent-retrofit-4",
        zone: "Compressor Room",
        recommendedSensor: "Pressure sensor + current sensor",
        controlDevice: "Maintenance alert relay",
        meteringDevice: "CT clamp current sensor",
        gateway: "ESP32 gateway",
        installDifficulty: "Medium",
        estimatedCost: 6200,
        notes: "Detect leaks and unloaded cycling before automating controls."
      },
      {
        id: "ent-retrofit-5",
        zone: "Server Room",
        recommendedSensor: "Temperature and humidity sensor",
        controlDevice: "Alert-only integration",
        meteringDevice: "Smart PDU meter",
        gateway: "SNMP / Modbus gateway",
        installDifficulty: "Medium",
        estimatedCost: 5400,
        notes: "Critical load: monitoring and approval workflow only."
      },
      {
        id: "ent-retrofit-6",
        zone: "Warehouse Lighting",
        recommendedSensor: "PIR mesh",
        controlDevice: "Smart relay / contactor controller",
        meteringDevice: "Lighting CT clamp",
        gateway: "ESP32 mesh gateway",
        installDifficulty: "Easy",
        estimatedCost: 4300,
        notes: "High-impact retrofit with clear occupancy-waste story."
      },
      {
        id: "ent-retrofit-7",
        zone: "Office Area",
        recommendedSensor: "CO2 + PIR sensors",
        controlDevice: "Smart relay / plug controller",
        meteringDevice: "Submeter",
        gateway: "Wi-Fi / Modbus gateway",
        installDifficulty: "Easy",
        estimatedCost: 3800,
        notes: "Use low-risk automation for plug loads and reminders."
      },
      {
        id: "ent-retrofit-8",
        zone: "Meeting Room",
        recommendedSensor: "PIR + CO2 sensor",
        controlDevice: "Smart relay + HVAC schedule link",
        meteringDevice: "Lighting and AC CT clamp",
        gateway: "ESP32 gateway",
        installDifficulty: "Easy",
        estimatedCost: 3100,
        notes: "Ideal demo zone for empty-room waste detection."
      }
    ],
    anomalies: [
      {
        id: "ent-anomaly-1",
        title: "Compressor load is above baseline after production hours",
        severity: "Critical",
        deviceId: "ent-compressor",
        zone: "Compressor Room",
        deviationPercent: 24,
        detectedPattern: "Current draw stays high while production lines are idle.",
        likelyCauses: ["Air leakage", "Unloaded compressor cycling", "Faulty pressure valve"],
        recommendedAction: "Schedule maintenance inspection and pressure decay test.",
        confidence: 91,
        estimatedLossKwh: 680
      },
      {
        id: "ent-anomaly-2",
        title: "HVAC/Admin Block cooling load does not match occupancy",
        severity: "High",
        deviceId: "ent-hvac",
        zone: "HVAC/Admin Block",
        deviationPercent: 18,
        detectedPattern: "CO2 and occupancy simulation show low headcount during high HVAC demand.",
        likelyCauses: ["Setpoint too low", "Pre-cooling window too late", "Meeting rooms not released"],
        recommendedAction: "Apply occupancy setback and pre-cool before production startup.",
        confidence: 87,
        estimatedLossKwh: 430
      },
      {
        id: "ent-anomaly-3",
        title: "Warehouse lighting remains on after shift handover",
        severity: "High",
        deviceId: "ent-lighting",
        zone: "Warehouse Lighting",
        deviationPercent: 31,
        detectedPattern: "Load persists while PIR occupancy drops below 10%.",
        likelyCauses: ["Manual lighting override", "No zone-level switching", "Handover checklist missing"],
        recommendedAction: "Enable aisle dimming rule with safety approval.",
        confidence: 84,
        estimatedLossKwh: 96
      }
    ],
    carbonStory: {
      currentMonthlyKg: 370230,
      optimizedMonthlyKg: 323799,
      reductionKg: 46431,
      treeEquivalent: 2111,
      carKmAvoided: 193462,
      phoneChargesEquivalent: 5803875,
      ledBulbHoursEquivalent: 4643100,
      story: "Applying today's full AI optimization could reduce about 46,431 kg CO2e monthly, roughly equivalent to planting 2,111 trees."
    },
    energyScore: {
      overall: 76,
      automationReadiness: 72,
      wasteReduction: 68,
      carbonPerformance: 74,
      costEfficiency: 79,
      occupancyAlignment: 64,
      peakDemandControl: 70,
      retrofitReadiness: 81
    }
  }
};

const twinScenarioNames = {
  baseline: {
    name: "Baseline",
    description: "Current profile with existing schedules, alerts, and manual controls.",
    actions: ["Keep monitoring current load profile"]
  },
  "occupancy-shutdown": {
    name: "Turn off lighting in unused zones",
    description: "Reduce lighting and plug loads where occupancy signals show low or no use.",
    actions: ["Reduce AC usage after office hours", "Turn off lighting in unused zones"]
  },
  "peak-demand-shaving": {
    name: "Shift equipment usage to lower-cost hours",
    description: "Move flexible equipment and appliance demand away from expensive or congested windows.",
    actions: ["Shift equipment usage to lower-cost hours", "Compare zone efficiency"]
  },
  "hvac-schedule-optimization": {
    name: "Reduce AC usage after office hours",
    description: "Tune air-conditioning runtime against operating hours, occupancy, and zone demand.",
    actions: ["Reduce AC usage after office hours", "Simulate occupancy changes"]
  },
  "fault-maintenance": {
    name: "Compare zone efficiency",
    description: "Compare similar zones and detect abnormal energy intensity or maintenance patterns.",
    actions: ["Compare zone efficiency", "Simulate occupancy changes"]
  },
  "full-ai-optimization": {
    name: "Industry AI Twin scheduling plan",
    description: "Combine after-hours AC reduction, unused-zone lighting control, equipment shifting, zone comparison, and occupancy simulation.",
    actions: [
      "Reduce AC usage after office hours",
      "Turn off lighting in unused zones",
      "Shift equipment usage to lower-cost hours",
      "Compare zone efficiency",
      "Simulate occupancy changes"
    ]
  }
};

function scenarioSet(prefix, beforeKwh, savingsCost, tariff, scoreBefore, scoreAfter) {
  const ratios = [
    ["baseline", 0, 98],
    ["occupancy-shutdown", 0.18, 84],
    ["peak-demand-shaving", 0.2, 86],
    ["hvac-schedule-optimization", 0.26, 88],
    ["fault-maintenance", 0.16, 82],
    ["full-ai-optimization", 1, 92]
  ];

  return ratios.map(([id, ratio, confidence]) => {
    const savingsKwh = Number((ratio ? (savingsCost * ratio) / tariff : 0).toFixed(1));
    const meta = twinScenarioNames[id];

    return {
      id,
      name: meta.name,
      description: meta.description,
      beforeKwh,
      afterKwh: Number(Math.max(beforeKwh - savingsKwh, 0).toFixed(1)),
      savingsKwh,
      savingsPercent: beforeKwh ? Number(((savingsKwh / beforeKwh) * 100).toFixed(1)) : 0,
      savingsCost: Number((savingsKwh * tariff).toFixed(2)),
      co2ReductionKg: Number((savingsKwh * 0.67).toFixed(1)),
      scoreBefore,
      scoreAfter: id === "baseline" ? scoreBefore : Math.min(scoreAfter, scoreBefore + Math.round(ratio * (scoreAfter - scoreBefore))),
      confidence,
      actions: meta.actions.map((action) => `${prefix}: ${action}`)
    };
  });
}

function normalizeProfile(profile, config) {
  const tariffRate = Number((config.monthlyBillRm / config.monthlyUsageKwh).toFixed(4));
  const dailyUsage = Number((config.monthlyUsageKwh / 30).toFixed(1));
  const dailySavingsKwh = Number(((config.potentialSavingsRm / tariffRate) / 30).toFixed(1));
  const potentialMonthlyKwh = Number((config.potentialSavingsRm / tariffRate).toFixed(1));

  profile.tier = config.tier;
  profile.target = config.target;
  profile.monthlyUsageKwh = config.monthlyUsageKwh;
  profile.monthlyBillRm = config.monthlyBillRm;
  profile.operatingHours = config.operatingHours;
  profile.roomsOrZones = config.roomsOrZones;
  profile.estimatedWastePercent = config.estimatedWastePercent;
  profile.potentialSavingsRm = config.potentialSavingsRm;
  profile.carbonReductionKg = config.carbonReductionKg;
  profile.mainProblem = config.mainProblem;
  profile.hardwareStatus = config.hardwareStatus;
  profile.featureAccess = {
    dashboard: true,
    alerts: true,
    recommendations: true,
    automation: true,
    reports: true,
    roi: true,
    aiTwin: config.tier === "Industry"
  };

  profile.settings = {
    ...(profile.settings || {}),
    tariffRate,
    currency: "MYR",
    facilityName: `${config.tier} demo profile`,
    target: config.target,
    operatingHours: config.operatingHours,
    roomsOrZones: config.roomsOrZones,
    approximateOccupancySchedule: config.occupancySchedule,
    monthlyUsageKwh: config.monthlyUsageKwh,
    monthlyBillRm: config.monthlyBillRm
  };

  profile.summary = {
    ...(profile.summary || {}),
    totalEnergyKwh: dailyUsage,
    projectedMonthlyKwh: config.monthlyUsageKwh,
    potentialSavingsKwh: dailySavingsKwh,
    estimatedWastePercent: config.estimatedWastePercent,
    monthlyUsageKwh: config.monthlyUsageKwh,
    monthlyBillRm: config.monthlyBillRm,
    potentialSavingsRm: config.potentialSavingsRm,
    carbonReductionKg: config.carbonReductionKg,
    roomsOrZones: config.roomsOrZones
  };

  profile.usageTrend = profile.trends?.daily || [];
  profile.zones = profile.occupancyZones || [];
  profile.twinScenarios = scenarioSet(config.tier, dailyUsage, config.potentialSavingsRm / 30, tariffRate, config.scoreBefore, config.scoreAfter);

  if (profile.roiModel) {
    profile.roiModel = {
      ...profile.roiModel,
      estimatedMonthlySavingsKwh: potentialMonthlyKwh,
      estimatedMonthlySavingsCost: config.potentialSavingsRm,
      estimatedAnnualSavingsCost: config.potentialSavingsRm * 12,
      carbonSavingsPerMonthKg: config.carbonReductionKg,
      assumptions: {
        ...(profile.roiModel.assumptions || {}),
        tariffRate,
        zones: config.roomsOrZones
      }
    };
  }

  return profile;
}

function makeBusinessProfile() {
  return {
    settings: {
      tariffRate: 0.41,
      currency: "MYR",
      energySavingTarget: 17,
      co2ReductionTargetKg: 250,
      morningNotificationTime: "09:00",
      nightNotificationTime: "22:00",
      notificationTime: "22:00",
      notificationPreference: "Closing-time and peak alerts",
      automationPreference: "Suggest Only",
      categories: ["Lighting", "Refrigeration", "Air conditioning", "Kitchen equipment", "Office plugs", "Signage"],
      zones: ["Customer Area", "Kitchen / Prep", "Cold Storage", "Office", "Storefront", "Back Room"]
    },
    summary: {
      totalEnergyKwh: 95,
      carbonKg: 63.7,
      efficiencyScore: 79,
      co2TargetProgress: 54,
      projectedMonthlyKwh: 2850,
      potentialSavingsKwh: 14.6,
      comparison: {
        yesterday: 6.4,
        lastWeek: 9.8,
        monthlyAverage: 4.2
      }
    },
    trends: {
      hourly: [
        { label: "00:00", kwh: 2.8, baseline: 2.2 },
        { label: "03:00", kwh: 2.4, baseline: 2.1 },
        { label: "06:00", kwh: 4.5, baseline: 4.1 },
        { label: "09:00", kwh: 10.8, baseline: 9.5 },
        { label: "12:00", kwh: 16.4, baseline: 14.2 },
        { label: "15:00", kwh: 18.2, baseline: 15.1 },
        { label: "18:00", kwh: 20.5, baseline: 17.4 },
        { label: "21:00", kwh: 19.4, baseline: 15.8 }
      ],
      daily: [
        { label: "Mon", kwh: 88, baseline: 82 },
        { label: "Tue", kwh: 91, baseline: 84 },
        { label: "Wed", kwh: 96, baseline: 86 },
        { label: "Thu", kwh: 98, baseline: 87 },
        { label: "Fri", kwh: 104, baseline: 90 },
        { label: "Sat", kwh: 112, baseline: 96 },
        { label: "Sun", kwh: 95, baseline: 84 }
      ],
      weekly: [
        { label: "Week 1", kwh: 660, baseline: 616 },
        { label: "Week 2", kwh: 695, baseline: 632 },
        { label: "Week 3", kwh: 716, baseline: 641 },
        { label: "Week 4", kwh: 779, baseline: 684 }
      ],
      monthly: [
        { label: "Jan", kwh: 2660, baseline: 2470 },
        { label: "Feb", kwh: 2720, baseline: 2525 },
        { label: "Mar", kwh: 2790, baseline: 2580 },
        { label: "Apr", kwh: 2850, baseline: 2635 }
      ]
    },
    devices: [
      {
        id: "bus-lighting",
        name: "Customer-area lighting",
        type: "Zone circuit",
        zone: "Customer Area",
        usageKwh: 22.4,
        trendPercent: 18,
        status: "Overconsuming",
        controlEnabled: true,
        isOn: true,
        recommendation: "Reduce lighting after closing time and dim storefront zones outside active customer hours."
      },
      {
        id: "bus-refrigeration",
        name: "Refrigeration load",
        type: "Critical appliance group",
        zone: "Cold Storage",
        usageKwh: 18.6,
        trendPercent: 13,
        status: "Running",
        controlEnabled: false,
        isOn: true,
        recommendation: "Check door seals and compare compressor cycling against normal baseline."
      },
      {
        id: "bus-ac",
        name: "Air-conditioning",
        type: "HVAC circuit",
        zone: "Customer Area",
        usageKwh: 26.8,
        trendPercent: 16,
        status: "Overconsuming",
        controlEnabled: true,
        isOn: true,
        recommendation: "Set closing-time setback and avoid low setpoints during low customer occupancy."
      },
      {
        id: "bus-kitchen",
        name: "Kitchen / prep equipment",
        type: "Equipment group",
        zone: "Kitchen / Prep",
        usageKwh: 12.9,
        trendPercent: 7,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Shift preheating and cleaning equipment to planned operating windows."
      },
      {
        id: "bus-office",
        name: "Office plug loads",
        type: "Smart plug group",
        zone: "Office",
        usageKwh: 5.7,
        trendPercent: 4,
        status: "Idle",
        controlEnabled: true,
        isOn: true,
        recommendation: "Turn off idle chargers, printer, and admin displays after closing."
      },
      {
        id: "bus-signage",
        name: "Storefront signage",
        type: "Lighting circuit",
        zone: "Storefront",
        usageKwh: 8.6,
        trendPercent: -2,
        status: "Running",
        controlEnabled: true,
        isOn: true,
        recommendation: "Use a timer linked to operating hours and local daylight threshold."
      }
    ],
    recommendations: [
      {
        id: "bus-rec-1",
        priority: "High",
        riskLevel: "Medium",
        title: "Reduce lighting after closing time",
        message: "Lighting usage continued 2 hours after closing time. Apply a 10:15 PM shutdown and storefront dimming schedule.",
        impact: "Save about 120 kWh per month",
        confidence: 87,
        status: "Ready to apply",
        estimatedSavingsKwh: 4,
        estimatedSavingsCost: 49.2,
        estimatedCo2ReductionKg: 80,
        linkedDeviceId: "bus-lighting",
        target: "Customer Area and Storefront lighting",
        difficulty: "Easy",
        before: "Lighting remains active until midnight.",
        after: "Lighting shuts down 15 minutes after closing with storefront dimming.",
        requiresApproval: false
      },
      {
        id: "bus-rec-2",
        priority: "High",
        riskLevel: "High",
        title: "Optimize refrigeration and AC scheduling",
        message: "Refrigeration load increased above normal baseline while AC stayed high during low customer traffic.",
        impact: "Save about 170 kWh per month",
        confidence: 82,
        status: "Suggest only",
        estimatedSavingsKwh: 5.7,
        estimatedSavingsCost: 69.7,
        estimatedCo2ReductionKg: 110,
        linkedDeviceId: "bus-refrigeration",
        linkedDeviceIds: ["bus-refrigeration", "bus-ac"],
        target: "Cold Storage and Customer Area",
        difficulty: "Medium",
        before: "Refrigeration and AC run above baseline during quiet windows.",
        after: "Refrigeration alerting and AC setback reduce wasted runtime.",
        requiresApproval: true
      },
      {
        id: "bus-rec-3",
        priority: "Medium",
        riskLevel: "Medium",
        title: "Identify peak usage hours",
        message: "Peak usage was detected between 2:00 PM and 4:00 PM. Shift non-critical equipment and pre-cooling outside that window.",
        impact: "Save about 150 kWh per month",
        confidence: 79,
        status: "Simulation available",
        estimatedSavingsKwh: 5,
        estimatedSavingsCost: 61.1,
        estimatedCo2ReductionKg: 60,
        linkedDeviceId: "bus-ac",
        target: "2:00 PM - 4:00 PM peak window",
        difficulty: "Medium",
        before: "AC and kitchen equipment overlap during the afternoon peak.",
        after: "Pre-cooling and prep equipment are shifted to planned windows.",
        requiresApproval: false
      }
    ],
    notifications: [
      {
        id: "bus-alert-1",
        type: "Alert",
        severity: "Warning",
        title: "Lighting after closing",
        message: "Lighting usage continued 2 hours after closing time.",
        time: "00:08",
        affectedZone: "Customer Area",
        estimatedImpact: "RM 49/month",
        suggestedAction: "Apply the 10:15 PM lighting shutdown schedule."
      },
      {
        id: "bus-alert-2",
        type: "Alert",
        severity: "Critical",
        title: "Refrigeration baseline increase",
        message: "Refrigeration load increased above normal baseline.",
        time: "14:35",
        affectedZone: "Cold Storage",
        estimatedImpact: "110 kg CO2/month",
        suggestedAction: "Inspect door seals and compressor cycling."
      },
      {
        id: "bus-alert-3",
        type: "Info",
        severity: "Info",
        title: "Peak usage window",
        message: "Peak usage detected between 2:00 PM and 4:00 PM.",
        time: "16:05",
        affectedZone: "Customer Area and Kitchen / Prep",
        estimatedImpact: "RM 61/month",
        suggestedAction: "Shift pre-cooling and prep equipment to planned time windows."
      }
    ],
    occupancyZones: [
      {
        id: "bus-zone-customer",
        name: "Customer Area",
        occupancyPercent: 18,
        peopleCount: 4,
        capacity: 28,
        currentKwh: 49.2,
        baselineKwh: 39.6,
        wastedKwh: 9.6,
        wasteCost: 3.94,
        loadStatus: "Lighting and AC high while customer traffic is low",
        risk: "High",
        sensorType: "PIR + zone current sensor",
        recommendation: "Set AC setback and dim lights during low occupancy.",
        linkedDeviceIds: ["bus-lighting", "bus-ac"]
      },
      {
        id: "bus-zone-cold",
        name: "Cold Storage",
        occupancyPercent: 100,
        peopleCount: 0,
        capacity: 0,
        currentKwh: 18.6,
        baselineKwh: 15.2,
        wastedKwh: 3.4,
        wasteCost: 1.39,
        loadStatus: "Critical load above baseline",
        risk: "Critical",
        sensorType: "Current sensor + temperature probe",
        recommendation: "Alert-only monitoring for seal and compressor cycling checks.",
        linkedDeviceIds: ["bus-refrigeration"]
      },
      {
        id: "bus-zone-kitchen",
        name: "Kitchen / Prep",
        occupancyPercent: 35,
        peopleCount: 2,
        capacity: 6,
        currentKwh: 12.9,
        baselineKwh: 11.1,
        wastedKwh: 1.8,
        wasteCost: 0.74,
        loadStatus: "Prep equipment overlaps with AC peak",
        risk: "Medium",
        sensorType: "Smart plugs + gateway",
        recommendation: "Shift non-critical preparation and cleaning cycles.",
        linkedDeviceIds: ["bus-kitchen"]
      },
      {
        id: "bus-zone-office",
        name: "Office",
        occupancyPercent: 0,
        peopleCount: 0,
        capacity: 3,
        currentKwh: 5.7,
        baselineKwh: 2.9,
        wastedKwh: 2.8,
        wasteCost: 1.15,
        loadStatus: "Idle plug load",
        risk: "High",
        sensorType: "Smart plug group",
        recommendation: "Turn off printer, chargers, and admin displays after closing.",
        linkedDeviceIds: ["bus-office"]
      }
    ],
    peakPlan: {
      intervals: [
        {
          id: "bus-peak-1",
          window: "14:00 - 16:00",
          peakKwh: 18.2,
          baselineKwh: 15.1,
          cause: "AC load and kitchen preparation overlap",
          suggestedAction: "Pre-cool before the peak and shift non-critical prep equipment.",
          shiftMinutes: 30,
          expectedReductionPercent: "8-11%",
          estimatedSavingsKwh: 5,
          risk: "Medium"
        }
      ],
      optimizedTrend: [
        { label: "12:00", current: 16.4, optimized: 15.2 },
        { label: "15:00", current: 18.2, optimized: 16.4 },
        { label: "18:00", current: 20.5, optimized: 18.7 },
        { label: "21:00", current: 19.4, optimized: 16.9 }
      ]
    },
    automationRules: [
      {
        id: "bus-rule-1",
        name: "Closing-time lighting shutdown",
        condition: "IF time is 22:15 and occupancy is below 10%",
        action: "THEN turn off customer-area lighting and dim storefront signage",
        enabled: true,
        riskLevel: "Low",
        requiresApproval: false,
        estimatedSavingsKwh: 4,
        lastTriggered: "00:08",
        status: "Monitoring"
      },
      {
        id: "bus-rule-2",
        name: "Refrigeration baseline alert",
        condition: "IF refrigeration current exceeds baseline by 12%",
        action: "THEN alert manager without control action",
        enabled: true,
        riskLevel: "High",
        requiresApproval: true,
        estimatedSavingsKwh: 2.5,
        lastTriggered: "14:35",
        status: "Alert-only"
      }
    ],
    approvalQueue: [],
    auditLog: [
      {
        id: "bus-audit-1",
        time: "00:08",
        actor: "GridSenseIQ Alert Center",
        action: "Flagged lighting after closing",
        target: "Customer Area",
        status: "Open",
        impactKwh: 4,
        note: "Lighting stayed active two hours after operating hours."
      }
    ],
    roiModel: {
      packageName: "business",
      hardwareCost: 4200,
      installationCost: 1800,
      softwareCost: 1200,
      totalCost: 7200,
      estimatedMonthlySavingsKwh: 439,
      estimatedMonthlySavingsCost: 180,
      estimatedAnnualSavingsCost: 2160,
      paybackMonths: 40,
      roiPercent: 30,
      carbonSavingsPerMonthKg: 250,
      assumptions: {
        tariffRate: 0.41,
        zones: 8,
        sensors: 13
      }
    },
    retrofitPlan: [
      {
        id: "bus-retrofit-1",
        zone: "Customer Area",
        recommendedSensor: "PIR occupancy sensor + zone current sensor",
        controlDevice: "Lighting relay + IR AC controller",
        meteringDevice: "CT clamp sensor",
        gateway: "Wi-Fi gateway",
        installDifficulty: "Medium",
        estimatedCost: 2100,
        notes: "Highest savings from matching lighting and AC to customer hours."
      },
      {
        id: "bus-retrofit-2",
        zone: "Cold Storage",
        recommendedSensor: "Temperature probe + current sensor",
        controlDevice: "Alert-only integration",
        meteringDevice: "Current sensor",
        gateway: "Wi-Fi gateway",
        installDifficulty: "Medium",
        estimatedCost: 1800,
        notes: "Critical refrigeration stays protected; GridSenseIQ monitors abnormal signatures."
      }
    ],
    anomalies: [
      {
        id: "bus-anomaly-1",
        title: "Lighting remains active after closing",
        severity: "High",
        deviceId: "bus-lighting",
        zone: "Customer Area",
        deviationPercent: 18,
        detectedPattern: "Load continues after operating hours end.",
        likelyCauses: ["Manual switch left on", "No closing-time schedule", "Storefront lights grouped with indoor lights"],
        recommendedAction: "Enable closing-time lighting shutdown.",
        confidence: 87,
        estimatedLossKwh: 4
      },
      {
        id: "bus-anomaly-2",
        title: "Refrigeration load above baseline",
        severity: "High",
        deviceId: "bus-refrigeration",
        zone: "Cold Storage",
        deviationPercent: 13,
        detectedPattern: "Compressor current is above normal baseline.",
        likelyCauses: ["Door seal issue", "Frequent opening", "Warm product loading"],
        recommendedAction: "Inspect seals and compare temperature drift.",
        confidence: 82,
        estimatedLossKwh: 2.5
      }
    ],
    carbonStory: {
      currentMonthlyKg: 1910,
      optimizedMonthlyKg: 1660,
      reductionKg: 250,
      treeEquivalent: 11,
      carKmAvoided: 1042,
      phoneChargesEquivalent: 31250,
      ledBulbHoursEquivalent: 25000,
      story: "Applying Business recommendations could cut about 250 kg CO2e monthly by matching lighting, refrigeration alerts, and AC schedules to active customer hours."
    },
    energyScore: {
      overall: 79,
      automationReadiness: 76,
      wasteReduction: 74,
      carbonPerformance: 78,
      costEfficiency: 80,
      occupancyAlignment: 70,
      peakDemandControl: 82,
      retrofitReadiness: 78
    }
  };
}

mockData.business = makeBusinessProfile();

normalizeProfile(mockData.residential, {
  tier: "Residential",
  target: "For homes and apartments.",
  monthlyUsageKwh: 620,
  monthlyBillRm: 310,
  operatingHours: "Home schedule with evening and overnight occupancy",
  roomsOrZones: 6,
  estimatedWastePercent: 14,
  potentialSavingsRm: 45,
  carbonReductionKg: 60,
  mainProblem: "Air-conditioning and standby appliances running during low-occupancy hours",
  hardwareStatus: [
    { label: "Smart plug", status: "Connected", detail: "Living room plug-load evidence" },
    { label: "Current sensor", status: "Connected", detail: "Main circuit monitoring" },
    { label: "Smart meter", status: "Ready", detail: "Future integration" }
  ],
  occupancySchedule: "Morning exit, evening peak, low overnight occupancy",
  scoreBefore: 82,
  scoreAfter: 91
});

normalizeProfile(mockData.business, {
  tier: "Commercial",
  target: "For shops, cafes, clinics, small offices, and retail spaces.",
  monthlyUsageKwh: 2850,
  monthlyBillRm: 1180,
  operatingHours: "9:00 AM - 10:00 PM",
  roomsOrZones: 8,
  estimatedWastePercent: 17,
  potentialSavingsRm: 180,
  carbonReductionKg: 250,
  mainProblem: "Lighting, refrigeration, and air-conditioning running outside active customer hours",
  hardwareStatus: [
    { label: "Zone current sensor", status: "Connected", detail: "Customer-area and kitchen circuits" },
    { label: "Smart plugs", status: "Connected", detail: "Office and appliance load evidence" },
    { label: "Gateway", status: "Online", detail: "Telemetry synced" },
    { label: "Smart meter", status: "Ready", detail: "Future integration" }
  ],
  occupancySchedule: "Customer traffic builds after opening, peaks afternoon/evening, closes at 10:00 PM",
  scoreBefore: 79,
  scoreAfter: 89
});

normalizeProfile(mockData.enterprise, {
  tier: "Industry",
  target: "For factories, facilities, warehouses, large buildings, and industrial sites.",
  monthlyUsageKwh: 38000,
  monthlyBillRm: 14800,
  operatingHours: "8:00 AM - 7:00 PM, selected equipment runs 24/7",
  roomsOrZones: 24,
  estimatedWastePercent: 21,
  potentialSavingsRm: 2700,
  carbonReductionKg: 3800,
  mainProblem: "After-hours HVAC, unused production zones, and inefficient zone scheduling",
  hardwareStatus: [
    { label: "Gateway", status: "Online", detail: "Facility telemetry live" },
    { label: "Panel monitor", status: "Online", detail: "Main distribution panel" },
    { label: "Multi-zone sensors", status: "Online", detail: "Production and facility zones" },
    { label: "Smart meter-ready", status: "Ready", detail: "Integration prepared" },
    { label: "WiFi occupancy", status: "Waiting list", detail: "Optional occupancy signal layer" }
  ],
  occupancySchedule: "Core shifts 8:00 AM - 7:00 PM with selected equipment and critical loads operating 24/7",
  scoreBefore: 76,
  scoreAfter: 91
});

mockData.residential.notifications = [
  {
    id: "res-alert-1",
    type: "Alert",
    severity: "Warning",
    title: "AC usage above normal",
    message: "Air-conditioning usage is 22% higher than usual tonight.",
    time: "22:18",
    affectedZone: "Living Area",
    estimatedImpact: "RM 22/month",
    suggestedAction: "Raise setpoint by 1 degree and shorten overnight runtime."
  },
  {
    id: "res-alert-2",
    type: "Alert",
    severity: "Info",
    title: "Plug load stayed active",
    message: "Living room plug load stayed active during low-occupancy hours.",
    time: "01:10",
    affectedZone: "Living Room",
    estimatedImpact: "1.2 kWh/night",
    suggestedAction: "Enable smart plug sleep schedule."
  },
  {
    id: "res-alert-3",
    type: "Alert",
    severity: "Critical",
    title: "Bill target at risk",
    message: "Monthly bill is projected to exceed your target by RM 38.",
    time: "18:35",
    affectedZone: "Whole home",
    estimatedImpact: "RM 38 over target",
    suggestedAction: "Apply AC and standby load recommendations."
  }
];

mockData.enterprise.notifications = [
  {
    id: "ent-alert-1",
    type: "Alert",
    severity: "Critical",
    title: "Zone B HVAC after hours",
    message: "Zone B HVAC remained active after operating hours.",
    time: "19:42",
    affectedZone: "Zone B HVAC",
    estimatedImpact: "RM 860/month",
    suggestedAction: "Apply after-hours HVAC setback with facility approval."
  },
  {
    id: "ent-alert-2",
    type: "Alert",
    severity: "Warning",
    title: "Production Zone 3 intensity",
    message: "Production Zone 3 shows 18% higher energy intensity than similar zones.",
    time: "14:20",
    affectedZone: "Production Zone 3",
    estimatedImpact: "18% above peer baseline",
    suggestedAction: "Compare equipment schedule and maintenance profile."
  },
  {
    id: "ent-alert-3",
    type: "AI Twin",
    severity: "Info",
    title: "AI Twin scheduling savings",
    message: "AI Twin suggests RM 2,700/month savings from revised after-hours scheduling.",
    time: "08:30",
    affectedZone: "Facility schedule",
    estimatedImpact: "RM 2,700/month",
    suggestedAction: "Run Enterprise AI Twin scenario before approval."
  },
  {
    id: "ent-alert-4",
    type: "Hardware",
    severity: "Hardware",
    title: "Gateway 02 heartbeat missing",
    message: "Gateway 02 has not sent data for 15 minutes.",
    time: "10:15",
    affectedZone: "Gateway 02",
    estimatedImpact: "Telemetry gap in selected zones",
    suggestedAction: "Check gateway power and network connection."
  }
];

const actionDetails = {
  residential: {
    "res-rec-1": {
      title: "Reduce AC standby and overnight usage",
      before: "AC remains active during low-occupancy evening and overnight periods.",
      after: "AC runtime is shortened and setpoint is raised during low-occupancy windows.",
      difficulty: "Easy"
    },
    "res-rec-2": {
      title: "Turn off unused plug loads",
      before: "Living room and kitchen plug loads stay active after use.",
      after: "Smart plugs cut standby draw during low-occupancy hours.",
      difficulty: "Easy"
    },
    "res-rec-3": {
      title: "Shift high-power appliance usage to planned time windows",
      before: "Appliances overlap with evening AC and lighting demand.",
      after: "High-power loads move into planned windows with reminder support.",
      difficulty: "Medium"
    }
  },
  enterprise: {
    "ent-rec-1": {
      title: "Reduce after-hours HVAC and utility waste",
      before: "Compressor and HVAC loads stay elevated after operating hours.",
      after: "Facility team reviews utility runtime and applies approved after-hours rules.",
      difficulty: "Hard"
    },
    "ent-rec-2": {
      title: "Optimize zone-level equipment scheduling",
      before: "HVAC schedules drift from occupancy and production windows.",
      after: "Zone schedules follow operating hours, occupancy, and production needs.",
      difficulty: "Medium"
    },
    "ent-rec-3": {
      title: "Compare zone efficiency and shut unused lighting",
      before: "Warehouse lighting remains active after shift handover.",
      after: "Unused zones dim or shut down with safety-aware approval.",
      difficulty: "Medium"
    },
    "ent-rec-4": {
      title: "Use AI Twin for scenario planning",
      before: "Production startup creates demand spikes without simulation.",
      after: "AI Twin compares scheduling options before operational change.",
      difficulty: "Medium"
    }
  }
};

Object.entries(actionDetails).forEach(([profile, details]) => {
  mockData[profile].recommendations = (mockData[profile].recommendations || []).map((recommendation) => ({
    ...recommendation,
    ...(details[recommendation.id] || {})
  }));
});
