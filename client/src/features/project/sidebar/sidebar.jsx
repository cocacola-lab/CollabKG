import "./Sidebar.css";
import { GiClick } from "react-icons/gi";
import { useSelector } from "react-redux";
import { selectProjectStatus, selectProject } from "../projectSlice";
import { SelectHierarchy } from "./SelectHierarchy";
import { FormHelperText } from "@mui/material";

export const Sidebar = () => {
  return <LabelContainer />;
};

const LabelContainer = () => {
  const projectStatus = useSelector(selectProjectStatus);
  const project = useSelector(selectProject);

  if (projectStatus !== "succeeded") {
    return <div>loading...</div>;
  } else {
    return (
      <div className="complex-tree-container">
        {project.tasks.isEvent ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0rem 1rem",
                fontWeight: "bold",
                color: "rgb(55, 71, 79)",
                userSelect: "none",
              }}
            >  
              <span>Events</span>
              <GiClick />
            </div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0rem 1rem",
                fontWeight: "bold",
                color: "rgb(55, 71, 79)",
                userSelect: "none",
              }}>
              <FormHelperText>
                Notice: <strong>Anything</strong> for <strong>Argument</strong> and <strong>Others</strong> for <strong>trigger/event</strong> type.
              </FormHelperText> 
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0rem 1rem",
              fontWeight: "bold",
              color: "rgb(55, 71, 79)",
              userSelect: "none",
            }}
          >  
            <span>Entitys</span>
            <GiClick />
          </div>
        )}
        <div style={{ marginLeft: "1rem" }}>
          <SelectHierarchy />
        </div>
      </div>
    );
  }
};
