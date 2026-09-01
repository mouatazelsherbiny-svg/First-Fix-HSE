import { ChecklistTemplate } from "@/types/checklist";

export const tcEnergizationChecklist: ChecklistTemplate = {
  key: "tcEnergization",
  title: "T&C and Energization Checklist",
  sections: [
    {
      id: "A",
      title: "Energized Rooms (Under T&C Control)",
      questions: [
        { id: "A1", text: "Has the Testing & Commissioning (T&C) / Lockout–Tagout (LOTO) Procedure been established, submitted, and formally approved?", defaultPossible: "1" },
        { id: "A2", text: "Has the approved Risk Assessment and Method Statement (RAMS) been reviewed and communicated to all involved personnel?", defaultPossible: "2" },
        { id: "A3", text: "Are all Work Group/Permit Holder/Permit Requestor for Energized Room -trained and certified in related T&C procedure? Is there any badge/sticker to demonstrate competency?", defaultPossible: "2" },
        { id: "A4", text: "Is a entry Key available outside of the technical room for emergency purposes? And in good condition?", defaultPossible: "2" },
        { id: "A5", text: "Has temporary Ventilation provided in the Battery/Electrical rooms?", defaultPossible: "2" },
        { id: "A6", text: "Are all authorized and affected employees trained to the LOTO procedure?", defaultPossible: "2" },
        { id: "A7", text: "Are emergency contact details posted with personnel to contact in the event of an emergency?", defaultPossible: "2" },
        { id: "A8", text: "Are the technical rooms locked with adequate caution signage posted?", defaultPossible: "2" },
        { id: "A9", text: "Are competent LOTO Personnel available in Energized Room?", defaultPossible: "2" },
        { id: "A10", text: "Are Fire Fighting Equipment & Smoke Detector Systems available, visible, and regularly inspected?", defaultPossible: "2" },
        { id: "A11", text: "Does the LOTO Manager control & manage the Key Register on a daily basis? Are records or supportive documents available?", defaultPossible: "N/A" },
        { id: "A12", text: "Before Energization Start in all rooms, is there any Safety Checklist conducted?", defaultPossible: "2" },
        { id: "A13", text: "Is adequate PPE provided (includes, Boots, Gloves, High Visibility vests and overalls with Arc-flash Resistant Gears)? Are they used by Competent Persons during Testing and Commissioning?", defaultPossible: "2" },
        { id: "A14", text: "Are all Power/Hand Tools double insulated?-", defaultPossible: "2" },
        { id: "A15", text: "Is Electrical Panel equipped with ground-fault circuit interrupter (GFCI) breaker? Are the main electrical panels are fitted with lock to prevent unauthorized access to the main electrical distribution panels?", defaultPossible: "2" },
        { id: "A16", text: "Are non-metallic / fiber glass ladders or insulated mobile scaffolds used during operations where employees may come into contact with electrical circuits or systems/during testing and commissioning?", defaultPossible: "2" },
        { id: "A17", text: "Is there an Emergency Response Team in place to facilitate a safe evacuation and provide medical assistance when required in the event of an emergency inside the Energized Room?", defaultPossible: "2" },
        { id: "A18", text: "Has the lock/tag been installed on the correct part of the equipment to be isolated? Are tags with number using the LOTO Permit number and each tag's individual sequential number?", defaultPossible: "1" },
        { id: "A19", text: "Are the Work Party Supervisor presence in the work place? Ensuring compliance with the permit conditions, ensuring to prevent unauthorized entry?", defaultPossible: "2" },
        { id: "A20", text: "Are Work Party Supervisor ensuring the protection of assets during the work execution from any damage, reporting damage equipment's, confirmed and declared that the area is clean, without workers and / tools and all boundary conditions are met prior to closure of the PTW and departure from the work area?", defaultPossible: "2" },
      ],
    },
    {
      id: "B",
      title: "Energized Electrical Room",
      questions: [
        { id: "B1", text: "Is there a designated LOTO Team appointed, trained, and available on-site?", defaultPossible: "2" },
        { id: "B2", text: "Is a valid Work Permit for Energization / Isolation issued and displayed at the worksite?", defaultPossible: "2" },
        { id: "B3", text: "Are all circuit breakers, switches, and disconnecting devices locked and tagged in accordance with the approved procedure?", defaultPossible: "1" },
        { id: "B4", text: "Are the LOTO Maintains safety tagging records and master Lockout key register?", defaultPossible: "1" },
        { id: "B5", text: "Are the transformer room with digital termo-hygrometer available? Are the temperature inside the transformer room less than 25 degree Celsius?", defaultPossible: "N/A" },
      ],
    },
    {
      id: "C",
      title: "Other Checks",
      questions: [
        { id: "C1", text: "Periodic inspections of ongoing LOTO in place?", defaultPossible: "2" },
        { id: "C2", text: "Are All the rooms free from water, combustibles, and obstructions?", defaultPossible: "2" },
        { id: "C3", text: "Are all power-supplying cables secured, routed, and protected to prevent mechanical damage or accidental contact?", defaultPossible: "2" },
        { id: "C4", text: "Is shift handover procedure followed for LOTO continuity?", defaultPossible: "1" },
        { id: "C5", text: "Are workers wearing arc-rated clothing, insulated gloves, helmet with face shield, and safety shoes?", defaultPossible: "2" },
      ],
    },
  ],
};
