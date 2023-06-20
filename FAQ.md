# Frequency Asked Questions (FAQ)

### How do I add an ontology to the presets?

Currently, CollabKG does not have facilities to save custom ontologies or load ontologies from the user-interface. Instead, you can go to the `ontologies.js` file in the client directory `client/src/features/projectcreation/data`. Here, entity ontologies can be created by extending the `entityOntologies` object. The structure of the entity ontologies object is:

```
    "<entity_ontology_name>": [
        {
            name:"<entity_class_name>",
            fullName: "<entity_class_name>",
            description: "<description_of_class>",  // Optional; leave as empty string if not used. Will be used in the future.
            children: [], // not used
            colour: "<class_colour>"    // hex value e.g. "#E91E63" or getRandomColor() or muiColorPalettee500[n],
            _id: uuidv4(),
            isEntity: true
        }
    ]
```
Example:
```
conllpp: [
    {
      name: "PER",
      fullName: "PER",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    {
      name: "LOC",
      fullName: "LOC",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    {
      name: "ORG",
      fullName: "ORG",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    {
      name: "MISC",
      fullName: "MISC",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
  ],
```

Similarly, additional relation ontologies can be created by extending the `relationOntology` object. The structure of the relation ontologies object is:

### For RE

```
    "<relation_ontology_name>": [
        {
            name:"<relation_name>@[subject_type, object_type]",
            fullName: "<relation_name>@[subject_type, object_type]",
            description: "<description_of_class>",  // Optional; leave as empty string if not used. Will be used in the future.
            domain: ["<entity_class_name>"], // relation constraints
            range: ["<entity_class_name>"], // relation constraints
            children: [],
            _id: uuidv4(),
            isEntity: false
        }
    ]
```
Example:
```
NYT11_HRL: [
    {
      name: "location-located_in@[location, location]",
      fullName: "location-located_in@[location, location]",
      description: "",
      domain: [], // ["location"] constriant location-located_in can only appear between (location, location); namely (location, location-located_in, location)
      range: [], // ["location"]
      _id: uuidv4(),
      isEntity: false,
    },
    {
      name: "administrative_division-country@[location, country]",
      fullName: "administrative_division-country@[location, country]",
      description: "",
      domain: [], // ["location"]
      range: [], // ["country"]
      _id: uuidv4(),
      isEntity: false,
    },
    ...
```
Note corresponding entity:
```
NYT11_HRL_entity: [
    {
      name: "person",
      fullName: "person",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    {
      name: "organization",
      fullName: "organization",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    {
      name: "location",
      fullName: "location",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
    ...
```

### For EE

```
    "<event_ontology_name>": [
        {
            name:"<event_type_name>@[role_type_1, role_type_2, ...]",
            fullName: "<event_type_name>@[role_type_1, role_type_2, ...]",
            description: "<description_of_class>",  // Optional; leave as empty string if not used. Will be used in the future.
            domain: [], // not used for EE
            range: [], // not used for EE
            children: [],
            _id: uuidv4(),
            isEntity: false
        }
    ]
```
Example:
```
ACE05_EE: [
    {
      name: "Justice:Appeal@[Defendant, Adjudicator, Crime, Time, Place]",
      fullName: "Justice:Appeal@[Defendant, Adjudicator, Crime, Time, Place]",
      description: "",
      domain: [],
      range: [],
      _id: uuidv4(),
      isEntity: false,
    },
    {
      name: "Justice:Extradite@[Agent, Person, Destination, Origin, Crime, Time]",
      fullName: "Justice:Extradite@[Agent, Person, Destination, Origin, Crime, Time]",
      description: "",
      domain: [],
      range: [],
      _id: uuidv4(),
      isEntity: false,
    },
    ...
```

Note fixed `entityOntologies` for all event extaction:
```
EE: [
    {
      name: "Anything", // Anything denotes Arguments
      fullName: "Anything",
      description: "",
      children: [],
      colour: getRandomColor(),
      _id: uuidv4(),
      isEntity: true,
    },
  ],
```