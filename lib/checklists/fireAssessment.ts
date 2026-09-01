import { ChecklistTemplate } from "@/types/checklist";

export const fireAssessmentChecklist: ChecklistTemplate = {
  key: "fireAssessment",
  title: "Fire Assessment Checklist",
  sections: [
    {
      id: "A",
      title: "Fire Prevention & Protection",
      questions: [
        {
          id: "A1",
          text: "Is there an Emergency Response Plan (ERP) in place to respond to fire and other emergencies?",
          defaultPossible: "2",
        },
        {
          id: "A2",
          text: "Is the ERP plan up to date and has it been communicated to all employees.",
          defaultPossible: "2",
        },
        {
          id: "A3",
          text: "Have the nominated personnel in the plan such as fire wardens and incident commander's undergone training on the plan?",
          defaultPossible: "2",
        },
        {
          id: "A4",
          text: "Has the Site carried out a fire risk assessment?",
          defaultPossible: "2",
        },
        {
          id: "A5",
          text: "Has a fire risk assessment been developed and reviewed at least 6 months and updated when the risk profile of the project changes?",
          defaultPossible: "2",
        },
        {
          id: "A6",
          text: "Is emergency evacuation drill conducted/performed? report available?",
          defaultPossible: "2",
        },
        {
          id: "A7",
          text: "Is designated assemble point provided and in safe place?",
          defaultPossible: "2",
        },
        {
          id: "A8",
          text: "Has the site a copy of civil defense pack?",
          defaultPossible: "N/A",
        },
        {
          id: "A9",
          text: "Has the civil defense Pack been updated?",
          defaultPossible: "N/A",
        },
        {
          id: "A10",
          text: "Are flammable/combustible materials stored away from occupied buildings?",
          defaultPossible: "2",
        },
        {
          id: "A11",
          text: "Are general warning signs posted designating fire risk areas? No smoking signs posted in area where combustible materials/hot works are being performed?",
          defaultPossible: "2",
        },
        {
          id: "A12",
          text: "Is adequate access/egress from work areas in place should an evacuation be required?",
          defaultPossible: "2",
        },
        {
          id: "A13",
          text: "Are flammable/combustible materials kept clear from ignitable sources and is equipment shut off prior to refueling?",
          defaultPossible: "2",
        },
        {
          id: "A14",
          text: "Are fire extinguishers of the correct type, maintained regularly, visually inspected & recorded, strategically placed and not obstructed, in good condition and is signage placed to inform others of their location?",
          defaultPossible: "2",
        },
        {
          id: "A15",
          text: "Are safety cans with self-closing lid and flash arrestor used for gasoline?",
          defaultPossible: "2",
        },
        {
          id: "A16",
          text: "Are Fire / Smoke / Gas detection system available and regularly inspected?",
          defaultPossible: "2",
        },
        {
          id: "A17",
          text: "Are Alarms in place and audible in all areas?",
          defaultPossible: "2",
        },
        {
          id: "A18",
          text: "Are emergency route plans available and displayed?",
          defaultPossible: "2",
        },
        {
          id: "A19",
          text: "Are emergency illuminated exit signs available on the main access routes?",
          defaultPossible: "N/A",
        },
        {
          id: "A20",
          text: "Are trained fire warden available day shift and night shift?",
          defaultPossible: "2",
        },
        {
          id: "A21",
          text: "Are no smoking signs posted in areas where smoking is prohibited?",
          defaultPossible: "2",
        },
        {
          id: "A22",
          text: "Are all materials stored so as not to obstruct access to fire protection equipment, control valves, fire doors, alarm devices or panels, electrical panels or aisles and hallways that serve as a means of exit?",
          defaultPossible: "2",
        },
        {
          id: "A23",
          text: "Is a minimum clearance of 36 inches (91 cm) maintained in all aisle ways leading to an exit?",
          defaultPossible: "2",
        },
        {
          id: "A24",
          text: "Does the project ensure that a temporary or permanent water supply of sufficient volume, pressure and duration is available?",
          defaultPossible: "N/A",
        },
        {
          id: "A25",
          text: "Do you enforce good housekeeping to prevent the accumulation of flammable waste materials? Waste accumulated at the project site that has potential of fire risk be removed within 24 hrs.",
          defaultPossible: "2",
        },
        {
          id: "A26",
          text: "Are minimum quantities of flammable material kept on site with full precautions required?",
          defaultPossible: "2",
        },
      ],
    },
  ],
};
