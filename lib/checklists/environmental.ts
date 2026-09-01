import { ChecklistTemplate } from "@/types/checklist";

export const environmentalChecklist: ChecklistTemplate = {
  key: "environmental",
  title: "Environmental Checklist",
  sections: [
    {
      id: "A",
      title: "Dust Control & Air Emission",
      questions: [
        {
          id: "A1",
          text: "Are areas of the site and unpaved internal roadway are damped down using watering truck or sprinkler daily and dust suppression adequate?",
          defaultPossible: "2",
        },
        {
          id: "A2",
          text: "Are stockpiles Dampened/ Covered/Controlled to minimize dust?",
          defaultPossible: "N/A",
        },
        {
          id: "A3",
          text: "Are dust controlled during percussive drilling or rock breaking?",
          defaultPossible: "N/A",
        },
        {
          id: "A4",
          text: "Are vehicles at site moving at controlled speed to minimized the dust omission?",
          defaultPossible: "2",
        },
        {
          id: "A5",
          text: "Are all trucks logging-in or logging-out the site with excavation or backfill material are covered properly?",
          defaultPossible: "N/A",
        },
        {
          id: "A6",
          text: "Is water is sprayed during loading or unloading excavation or backfill material at site to prevent dust emission?",
          defaultPossible: "N/A",
        },
        {
          id: "A7",
          text: "Is the sensitive areas cleaned of dust/mud (roads and residents)?",
          defaultPossible: "N/A",
        },
        {
          id: "A8",
          text: "Are excessive dark exhaust controlled(equipment's/vehicles/ Generators)?",
          defaultPossible: "2",
        },
        {
          id: "A9",
          text: "Is visual monitoring of dust generation undertaken on a regular basis?",
          defaultPossible: "2",
        },
        {
          id: "A10",
          text: "Is the site free of odors, in Mess Hall, Toilet etc.?",
          defaultPossible: "2",
        },
      ],
    },
    {
      id: "B",
      title: "Environmental Signage & Notice Boards (Non-life critical items)",
      questions: [
        {
          id: "B1",
          text: "Are environmental policy and awareness photos display at environmental dashboard at site? Is the ENV policy updated?",
          defaultPossible: "2",
        },
      ],
    },
    {
      id: "C",
      title: "Sewage Waste Management",
      questions: [
        {
          id: "C1",
          text: "Records of sewage disposal/tanker pump out are kept?",
          defaultPossible: "N/A",
        },
        {
          id: "C2",
          text: "Toilets facilities are sufficient (1 toilet/20 workers), clean and in good condition?",
          defaultPossible: "2",
        },
        {
          id: "C3",
          text: "Is there a designated areas for food wastes disposal?",
          defaultPossible: "2",
        },
        {
          id: "C4",
          text: "Are all waste disposal bins clearly labeled?",
          defaultPossible: "2",
        },
        {
          id: "C5",
          text: "Is the site neat, tidy and free from litter?",
          defaultPossible: "2",
        },
        {
          id: "C6",
          text: "All waste containers are removed timely and communication contact list with waste vendor is posted on site?",
          defaultPossible: "2",
        },
        {
          id: "C7",
          text: "Do all food bins have lids?",
          defaultPossible: "2",
        },
        {
          id: "C8",
          text: "Is recyclable waste stored separately- cardboard, scrap, metal, used batteries, use oil?",
          defaultPossible: "2",
        },
        {
          id: "C9",
          text: "No overfull bins or skips, or waste stockpiling?",
          defaultPossible: "2",
        },
        {
          id: "C10",
          text: "Are records kept of disposal, storage and recycling on site?",
          defaultPossible: "N/A",
        },
        {
          id: "C11",
          text: "Are appropriate Waste Transfer Logs in use?",
          defaultPossible: "N/A",
        },
      ],
    },
    {
      id: "D",
      title: "Hazardous Material Storage",
      questions: [
        {
          id: "D1",
          text: "Are hazardous wastes collected and disposed by licensed collectors?",
          defaultPossible: "N/A",
        },
        {
          id: "D2",
          text: "Are records off all hazardous chemicals used and disposed at site have a register log?",
          defaultPossible: "N/A",
        },
        {
          id: "D3",
          text: "Are SDS in place and up to date?",
          defaultPossible: "N/A",
        },
        {
          id: "D4",
          text: "Is emergency spill kit available?",
          defaultPossible: "1",
        },
        {
          id: "D5",
          text: "All containers stored and have suitable hazardous material labels?",
          defaultPossible: "1",
        },
        {
          id: "D6",
          text: "Are hazardous materials stored with adequate spill containment (i.e. bund wall with 110% capacity by volume)",
          defaultPossible: "1",
        },
        {
          id: "D7",
          text: "Is combustible materials separated from flammable chemicals?",
          defaultPossible: "2",
        },
        {
          id: "D8",
          text: "No other items stored in the bund, other then tank/drums and fuel dispensing hose?",
          defaultPossible: "N/A",
        },
        {
          id: "D9",
          text: "The chemical store is away from sources of ignition, sewers, drains, traffic, office, trees and washable areas?",
          defaultPossible: "1",
        },
      ],
    },
    {
      id: "E",
      title: "Non-Hazardous Waste Management",
      questions: [
        {
          id: "E1",
          text: "Are waste being separated into non-hazardous and hazardous wastes and food waste being separated from construction waste?",
          defaultPossible: "1",
        },
        {
          id: "E2",
          text: "Are there adequate numbers of labelled waste receptacles around site?",
          defaultPossible: "2",
        },
        {
          id: "E3",
          text: "Is there a designated areas for food wastes disposal?",
          defaultPossible: "2",
        },
        {
          id: "E4",
          text: "Are records kept of disposal, storage and recycling on site?",
          defaultPossible: "N/A",
        },
        {
          id: "E5",
          text: "Are appropriate Waste Transfer Logs in use?",
          defaultPossible: "N/A",
        },
      ],
    },
    {
      id: "F",
      title: "Environmental Spills & Soil Protection",
      questions: [
        {
          id: "F1",
          text: "Are generators and portable plant(s) on suitable drip trays?",
          defaultPossible: "2",
        },
        {
          id: "F2",
          text: "Steel braided fuel dispensing hose equipped with automatic fuel dispensing nozzle to be used instead of rubber hose.",
          defaultPossible: "N/A",
        },
        {
          id: "F3",
          text: "Did any environmental incidents occur this week?",
          defaultPossible: "0",
        },
        {
          id: "F4",
          text: "Generators and pumps are located on a concrete pad or within a metal drip tray?",
          defaultPossible: "N/A",
        },
        {
          id: "F5",
          text: "Concrete trucks/ equipment are washed into a purpose-built wash bay, or off-site at a proper facility?",
          defaultPossible: "N/A",
        },
        {
          id: "F6",
          text: "Any visible signs of soil contamination or other potential sources of contamination?",
          defaultPossible: "1",
        },
        {
          id: "F7",
          text: "Does site have relevant erosion and sedimentation control measure in place?",
          defaultPossible: "1",
        },
        {
          id: "F8",
          text: "Are all excavated material, soil, surplus materials and rubbish are removed from site to approved disposal areas?",
          defaultPossible: "1",
        },
        {
          id: "F9",
          text: "Are spill kits available at site and well maintained?",
          defaultPossible: "1",
        },
        {
          id: "F10",
          text: "Are Generators & Diesel Tank with adequate spill containment (i.e. bund wall with 110% capacity by volume).",
          defaultPossible: "1",
        },
      ],
    },
    {
      id: "G",
      title: "Laydown Areas & Work Sites",
      questions: [
        {
          id: "G1",
          text: "Are environmental policy and awareness photos display at environmental dashboard at site?",
          defaultPossible: "2",
        },
        {
          id: "G2",
          text: "Are the boundaries of site kept in a clean and tidy condition?",
          defaultPossible: "2",
        },
        {
          id: "G3",
          text: "Are the site hoarding and fencing are erected and maintained in good and clean conditions?",
          defaultPossible: "2",
        },
      ],
    },
  ],
};
