import React, { FC, Fragment } from "react";
import { AutoComplete } from "@react-md/autocomplete";
import { Avatar } from "@react-md/avatar";

import dessertsList from "constants/desserts";
import statesList from "constants/states";

import ExampleGrid from "./ExampleGrid";

const data = [
  { label: "This is a result", value: "This is a result" },
  {
    // if children is defined, `label` isn't required
    children: (
      <Fragment>
        No, <strong>this</strong> is a result
      </Fragment>
    ),
    // still need a search string
    value: "No, this is a result",
  },
  {
    label: (
      <Fragment>
        I am not sure. <i>This</i> also seems like a <strong>result</strong>
      </Fragment>
    ),
    value: "I am not sure. This also seems like a result",
  },
];

function getColor(type: string): string {
  switch (type) {
    case "Ice cream":
      return "blue";
    case "Pastry":
      return "orange";
    default:
      return "blue-grey";
  }
}

const desserts = dessertsList.map(({ name, type, calories }, i) => ({
  label: (
    <Fragment>
      {`${name} `}(<i>{`${calories} kcal`}</i>)
    </Fragment>
  ),
  value: name,
  leftIcon: (
    <Avatar style={{ fontSize: ".85rem" }} color={getColor(type)}>
      {type.substring(0, 3)}
    </Avatar>
  ),
  rightMedia: (
    <img
      role="presentation"
      alt=""
      src={`https://picsum.photos/56?image=${30 + i}`}
    />
  ),
}));

// just slicing since `statesList` is readonly
const states = statesList.slice();

const UsingObjectDataSets: FC = () => (
  <ExampleGrid>
    <AutoComplete
      id="object-dataset-1"
      label="Results"
      placeholder="Search..."
      data={data}
    />
    <AutoComplete
      id="object-dataset-2"
      label="Desserts"
      placeholder="Cupcake"
      data={desserts}
    />
    <AutoComplete
      id="object-dataset-3"
      label="State"
      placeholder="Search..."
      data={states}
      labelKey="name"
      valueKey="name"
    />
  </ExampleGrid>
);

export default UsingObjectDataSets;
