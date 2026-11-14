export const serviceAliases = {"pipe-repair":"leak-repair","toilet-fixture-repair":"fixture-repair"};
export const canonicalService = slug => serviceAliases[slug] || slug;
export const services = [
  {
    "id": "drain-cleaning",
    "slug": "drain-cleaning",
    "bookingId": "drain-cleaning",
    "title": "Drain Cleaning & Hydro Jetting",
    "short": "Cable cleaning and practical guidance for your plumbing system.",
    "intro": "Explore drain cleaning & hydro jetting. Hydro jetting is suitable only after a professional assesses pipe condition and access.",
    "image": "service-drain-cleaning",
    "hero": "service-drain-cleaning",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "waves",
    "problems": [
      "Slow sinks",
      "Recurring blockages",
      "Main drain obstructions"
    ],
    "benefits": [
      "Cable cleaning",
      "Hydro jetting after pipe-condition assessment",
      "Drain maintenance"
    ],
    "solutions": [
      "Cable cleaning",
      "Hydro jetting after pipe-condition assessment",
      "Drain maintenance"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Hydro jetting is suitable only after a professional assesses pipe condition and access.",
    "faqs": [
      {
        "q": "Are chemical drain cleaners a good idea?",
        "a": "Some products can damage plumbing or create hazards for later service. A professional can advise on a safer approach for your system."
      },
      {
        "q": "What if several drains back up at once?",
        "a": "That can indicate a larger line issue. Avoid using affected fixtures and seek professional assessment."
      }
    ],
    "related": [
      "leak-repair",
      "fixture-repair"
    ],
    "seoTitle": "Drain Cleaning & Hydro Jetting | Plumbing Service Guide",
    "metaDescription": "Learn about drain cleaning & hydro jetting, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "leak-repair",
    "slug": "leak-repair",
    "bookingId": "leak-repair",
    "title": "Leak Detection & Pipe Repair",
    "short": "Leak investigation and practical guidance for your plumbing system.",
    "intro": "Explore leak detection & pipe repair. Detection and access needs vary; non-invasive or damage-free repairs cannot be guaranteed.",
    "image": "service-leak-repair",
    "hero": "service-leak-repair",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "droplets",
    "problems": [
      "Visible leaks",
      "Water stains and unexplained moisture",
      "Failed joints and damaged supply pipes"
    ],
    "benefits": [
      "Leak investigation",
      "Localized pipe repair",
      "Replacement options"
    ],
    "solutions": [
      "Leak investigation",
      "Localized pipe repair",
      "Replacement options"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Detection and access needs vary; non-invasive or damage-free repairs cannot be guaranteed.",
    "faqs": [
      {
        "q": "How do I know if I have a hidden leak?",
        "a": "Stains, musty odors, damp spots, or an unexplained increase in water use may be clues. A professional can investigate the cause."
      },
      {
        "q": "Should I shut off the water?",
        "a": "If water is actively escaping and you can reach the shutoff safely, turning it off can help limit damage."
      }
    ],
    "related": [
      "drain-cleaning",
      "fixture-repair"
    ],
    "seoTitle": "Leak Detection & Pipe Repair | Plumbing Service Guide",
    "metaDescription": "Learn about leak detection & pipe repair, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "fixture-repair",
    "slug": "fixture-repair",
    "bookingId": "fixture-repair",
    "title": "Toilet, Faucet, Sink & Shower Repairs",
    "short": "Fixture assessment and practical guidance for your plumbing system.",
    "intro": "Explore toilet, faucet, sink & shower repairs. Fixture compatibility and the underlying cause should be checked before replacement.",
    "image": "service-toilet-fixtures",
    "hero": "service-toilet-fixtures",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "wrench",
    "problems": [
      "Running toilets",
      "Leaking faucets and worn valves",
      "Blocked sinks and shower flow concerns"
    ],
    "benefits": [
      "Fixture assessment",
      "Valve and component repairs",
      "Fixture installation or replacement"
    ],
    "solutions": [
      "Fixture assessment",
      "Valve and component repairs",
      "Fixture installation or replacement"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Fixture compatibility and the underlying cause should be checked before replacement.",
    "faqs": [
      {
        "q": "Why does my toilet keep running?",
        "a": "A worn flapper, fill valve, or other tank component may be involved. Diagnosis is needed to confirm the cause."
      },
      {
        "q": "Can I choose a new fixture?",
        "a": "Yes. Discuss fit, finish, accessibility, and maintenance needs before installation."
      }
    ],
    "related": [
      "leak-repair",
      "drain-cleaning"
    ],
    "seoTitle": "Toilet, Faucet, Sink & Shower Repairs | Plumbing Service Guide",
    "metaDescription": "Learn about toilet, faucet, sink & shower repairs, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "water-heaters",
    "slug": "water-heaters",
    "bookingId": "water-heaters",
    "title": "Water Heater Installation & Repair",
    "short": "Tank heater assessment and practical guidance for your plumbing system.",
    "intro": "Explore water heater installation & repair. Fuel, electrical and pressure systems require qualified assessment; no efficiency or savings outcome is promised.",
    "image": "service-water-heater",
    "hero": "service-water-heater",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "thermometer",
    "problems": [
      "Insufficient hot water",
      "Leaks",
      "Temperature problems"
    ],
    "benefits": [
      "Tank heater assessment",
      "Repair or replacement",
      "Tankless options where supported and maintenance"
    ],
    "solutions": [
      "Tank heater assessment",
      "Repair or replacement",
      "Tankless options where supported and maintenance"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Fuel, electrical and pressure systems require qualified assessment; no efficiency or savings outcome is promised.",
    "faqs": [
      {
        "q": "Should I repair or replace my water heater?",
        "a": "The answer depends on its condition, age, repair needs, and your hot water demand. A qualified technician can evaluate it."
      },
      {
        "q": "Is a leaking water heater urgent?",
        "a": "Yes. If safe, shut off its water supply and power or fuel according to the manufacturer’s instructions, then seek professional help."
      }
    ],
    "related": [
      "leak-repair",
      "drain-cleaning"
    ],
    "seoTitle": "Water Heater Installation & Repair | Plumbing Service Guide",
    "metaDescription": "Learn about water heater installation & repair, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "sewer-line-repair",
    "slug": "sewer-line-repair",
    "bookingId": "sewer-line-repair",
    "title": "Sewer Line Repair & Camera Inspection",
    "short": "Camera inspection where accessible and practical guidance for your plumbing system.",
    "intro": "Explore sewer line repair & camera inspection. Avoid affected fixtures during a backup. Inspection informs repair choices; trenchless availability is not verified.",
    "image": "service-pipe-repair",
    "hero": "service-pipe-repair",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "pipe",
    "problems": [
      "Recurring sewer backups",
      "Root intrusion",
      "Damaged or blocked sewer pipes"
    ],
    "benefits": [
      "Camera inspection where accessible",
      "Repair planning",
      "Replacement assessment"
    ],
    "solutions": [
      "Camera inspection where accessible",
      "Repair planning",
      "Replacement assessment"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Avoid affected fixtures during a backup. Inspection informs repair choices; trenchless availability is not verified.",
    "faqs": [
      {
        "q": "What does this service cover?",
        "a": "Camera inspection where accessible, Repair planning, Replacement assessment. Actual company availability must be confirmed."
      },
      {
        "q": "What should I consider before requesting this service?",
        "a": "Avoid affected fixtures during a backup. Inspection informs repair choices; trenchless availability is not verified."
      }
    ],
    "related": [
      "drain-cleaning",
      "repiping"
    ],
    "seoTitle": "Sewer Line Repair & Camera Inspection | Plumbing Service Guide",
    "metaDescription": "Learn about sewer line repair & camera inspection, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "garbage-disposal",
    "slug": "garbage-disposal",
    "bookingId": "garbage-disposal",
    "title": "Garbage Disposal Repair & Replacement",
    "short": "Disposal diagnosis and practical guidance for your plumbing system.",
    "intro": "Explore garbage disposal repair & replacement. Do not reach into a disposal. Electrical isolation and installation should be handled safely by a qualified professional.",
    "image": "service-drain-cleaning",
    "hero": "service-drain-cleaning",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "wrench",
    "problems": [
      "Jammed disposal",
      "Unusual noises or leaks",
      "Poor drainage or motor failure"
    ],
    "benefits": [
      "Disposal diagnosis",
      "Connection assessment",
      "Compatible replacement installation"
    ],
    "solutions": [
      "Disposal diagnosis",
      "Connection assessment",
      "Compatible replacement installation"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Do not reach into a disposal. Electrical isolation and installation should be handled safely by a qualified professional.",
    "faqs": [
      {
        "q": "What does this service cover?",
        "a": "Disposal diagnosis, Connection assessment, Compatible replacement installation. Actual company availability must be confirmed."
      },
      {
        "q": "What should I consider before requesting this service?",
        "a": "Do not reach into a disposal. Electrical isolation and installation should be handled safely by a qualified professional."
      }
    ],
    "related": [
      "leak-repair",
      "drain-cleaning"
    ],
    "seoTitle": "Garbage Disposal Repair & Replacement | Plumbing Service Guide",
    "metaDescription": "Learn about garbage disposal repair & replacement, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "sump-pumps",
    "slug": "sump-pumps",
    "bookingId": "sump-pumps",
    "title": "Sump Pump Installation & Repair",
    "short": "Pump assessment and practical guidance for your plumbing system.",
    "intro": "Explore sump pump installation & repair. Keep away from standing water near electrical equipment. A pump cannot guarantee prevention of flooding.",
    "image": "service-sump-pump",
    "hero": "service-sump-pump",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "gauge",
    "problems": [
      "Pump malfunction",
      "Basement water accumulation",
      "Float switch or discharge concerns"
    ],
    "benefits": [
      "Pump assessment",
      "Repair or replacement",
      "Backup options where available"
    ],
    "solutions": [
      "Pump assessment",
      "Repair or replacement",
      "Backup options where available"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Keep away from standing water near electrical equipment. A pump cannot guarantee prevention of flooding.",
    "faqs": [
      {
        "q": "How often should a sump pump be checked?",
        "a": "Check it periodically and before wet seasons, following the manufacturer’s instructions. A professional can assess concerns."
      },
      {
        "q": "What if the pump stops during a storm?",
        "a": "Keep away from electrical hazards and seek urgent professional help if water is rising."
      }
    ],
    "related": [
      "leak-repair",
      "drain-cleaning"
    ],
    "seoTitle": "Sump Pump Installation & Repair | Plumbing Service Guide",
    "metaDescription": "Learn about sump pump installation & repair, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "repiping",
    "slug": "repiping",
    "bookingId": "repiping",
    "title": "Water Line Replacement & Repiping",
    "short": "Partial repiping and practical guidance for your plumbing system.",
    "intro": "Explore water line replacement & repiping. Material selection, access, local requirements and the condition of remaining pipes affect the plan.",
    "image": "commercial-pipe-system",
    "hero": "commercial-pipe-system",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "pipe",
    "problems": [
      "Aging or corroded pipes",
      "Repeated leaks",
      "Water supply line damage"
    ],
    "benefits": [
      "Partial repiping",
      "Whole-home planning",
      "Material and access assessment"
    ],
    "solutions": [
      "Partial repiping",
      "Whole-home planning",
      "Material and access assessment"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Material selection, access, local requirements and the condition of remaining pipes affect the plan.",
    "faqs": [
      {
        "q": "What does this service cover?",
        "a": "Partial repiping, Whole-home planning, Material and access assessment. Actual company availability must be confirmed."
      },
      {
        "q": "What should I consider before requesting this service?",
        "a": "Material selection, access, local requirements and the condition of remaining pipes affect the plan."
      }
    ],
    "related": [
      "leak-repair",
      "drain-cleaning"
    ],
    "seoTitle": "Water Line Replacement & Repiping | Plumbing Service Guide",
    "metaDescription": "Learn about water line replacement & repiping, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "gas-line",
    "slug": "gas-line",
    "bookingId": "gas-line",
    "title": "Gas Line Installation & Repair",
    "short": "Demo guide only: gas services, qualifications and permissions remain unverified.",
    "intro": "Explore gas line installation & repair. Demo category only: gas work is not advertised as available until qualifications, legal permissions and actual service provision are verified. Suspected leak: leave the area, avoid switches and equipment, and contact your gas emergency service from a safe location.",
    "image": "company-service-van",
    "hero": "company-service-van",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "shield",
    "problems": [
      "Damaged gas piping",
      "Appliance connection needs",
      "Planned gas line replacement"
    ],
    "benefits": [
      "Qualified piping inspection",
      "Installation planning",
      "Authorized repair or replacement"
    ],
    "solutions": [
      "Qualified piping inspection",
      "Installation planning",
      "Authorized repair or replacement"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Demo category only: gas work is not advertised as available until qualifications, legal permissions and actual service provision are verified. Suspected leak: leave the area, avoid switches and equipment, and contact your gas emergency service from a safe location.",
    "faqs": [
      {
        "q": "What does this service cover?",
        "a": "Qualified piping inspection, Installation planning, Authorized repair or replacement. Actual company availability must be confirmed."
      },
      {
        "q": "What should I consider before requesting this service?",
        "a": "Demo category only: gas work is not advertised as available until qualifications, legal permissions and actual service provision are verified. Suspected leak: leave the area, avoid switches and equipment, and contact your gas emergency service from a safe location."
      }
    ],
    "related": [
      "water-heaters",
      "repiping"
    ],
    "seoTitle": "Gas Line Installation & Repair | Plumbing Service Guide",
    "metaDescription": "Learn about gas line installation & repair, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  },
  {
    "id": "water-filtration",
    "slug": "water-filtration",
    "bookingId": "water-filtration",
    "title": "Water Filtration & Softener Systems",
    "short": "Water quality assessment and practical guidance for your plumbing system.",
    "intro": "Explore water filtration & softener systems. Select treatment based on assessed water quality and documented equipment capabilities. No contaminant-removal or drinking-water-safety guarantee is made.",
    "image": "hero-running-faucet",
    "hero": "hero-running-faucet",
    "imageAlt": "Illustrative plumbing reference image; not a completed company project",
    "icon": "droplets",
    "problems": [
      "Hard-water concerns",
      "Filter maintenance needs",
      "Questions about water quality"
    ],
    "benefits": [
      "Water quality assessment",
      "Whole-home or point-of-use options",
      "Softener installation and filter replacement"
    ],
    "solutions": [
      "Water quality assessment",
      "Whole-home or point-of-use options",
      "Softener installation and filter replacement"
    ],
    "process": [
      "Discuss the symptoms and service requirements",
      "Arrange a qualified assessment and review suitable options",
      "Agree the scope before work and discuss follow-up care"
    ],
    "safety": "Select treatment based on assessed water quality and documented equipment capabilities. No contaminant-removal or drinking-water-safety guarantee is made.",
    "faqs": [
      {
        "q": "What does this service cover?",
        "a": "Water quality assessment, Whole-home or point-of-use options, Softener installation and filter replacement. Actual company availability must be confirmed."
      },
      {
        "q": "What should I consider before requesting this service?",
        "a": "Select treatment based on assessed water quality and documented equipment capabilities. No contaminant-removal or drinking-water-safety guarantee is made."
      }
    ],
    "related": [
      "repiping",
      "fixture-repair"
    ],
    "seoTitle": "Water Filtration & Softener Systems | Plumbing Service Guide",
    "metaDescription": "Learn about water filtration & softener systems, common symptoms, assessment options and service preparation. Demonstration catalog; availability unverified."
  }
];
