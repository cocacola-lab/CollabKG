import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Create.css";
import {
  selectActiveStep,
  selectSteps,
  setStepData,
  setStepValid,
} from "../createStepSlice";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  TextField,
} from "@mui/material";

export const Details = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  useEffect(() => {
    const valid = steps[activeStep].valid;
    const data = steps[activeStep].data;

    if (!valid && data.name !== "" && data.description !== "") {
      dispatch(setStepValid(true));
    }
    if (valid && (data.name === "" || data.description === "")) {
      dispatch(setStepValid(false));
    }
  }, [steps]);

  // setStepData设置当前表单子页面对应的state值。
  return (
    <Grid item xs={12}>
      <Grid item container xs={12} spacing={4}>
        <Grid item xs={6}>
          <TextField
            required
            id="project-name-text-field"
            label="Project Name"
            helperText="This can be modified at any time"
            placeholder="Enter project name"
            variant="standard"
            fullWidth
            value={steps[activeStep].data.name}
            onChange={(e) => dispatch(setStepData({ name: e.target.value }))}
            autoComplete="off"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            id="project-description-text-field"
            label="Project Description"
            helperText="This can be modified at any time"
            placeholder="Enter project description"
            variant="standard"
            fullWidth
            value={steps[activeStep].data.description}
            onChange={(e) =>
              dispatch(setStepData({ description: e.target.value }))
            }
            autoComplete="off"
          />
        </Grid>
      </Grid>
      <Grid item container xs={12} spacing={4}>
        <Grid item xs={6}>
          <FormControl sx={{ mt: 4 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Multi-task Configuration</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      steps[activeStep].data.performRelationAnnotation &&
                      steps[activeStep].data.relationAnnotationType === "closed" &&
                      !steps[activeStep].data.isEvent
                    }
                    onChange={(e) => {
                      dispatch(
                        setStepData({
                          performRelationAnnotation: true,
                          relationAnnotationType: "closed",
                          isEvent: false,
                        })
                      );
                    }}
                    name="ea-ra-closed"
                  />
                }
                label="Entity-Relation Triples Annotation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      steps[activeStep].data.performRelationAnnotation &&
                      steps[activeStep].data.relationAnnotationType === "closed" &&
                      steps[activeStep].data.isEvent
                    }
                    onChange={(e) => {
                      dispatch(
                        setStepData({
                          performRelationAnnotation: true,
                          relationAnnotationType: "closed",
                          isEvent: true,
                        })
                      );
                    }}
                    name="ea-ra-event"
                  />
                }
                label="Event Annotation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!steps[activeStep].data.performRelationAnnotation}
                    onChange={(e) => {
                      dispatch(
                        setStepData({
                          performRelationAnnotation: false,
                          isEvent: false,
                        })
                      );
                    }}
                    name="ea-only"
                  />
                }
                label="Entity Annotation Only"
              />
            </FormGroup>
            <FormHelperText>
              Be careful as this choice is irreversible.
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6} direction="column" style={{ display: "flex", flexDirection: "column"}}>
        <FormControl sx={{ mt: 4 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Model Update</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={steps[activeStep].data.modelUpdate}
                    onChange={(e) => {
                      dispatch(
                        setStepData({
                          modelUpdate:
                            !steps[activeStep].data.modelUpdate,
                        })
                      );
                    }}
                    name="modelupdate"
                  />
                }
                label="Perform model update"
              />
            </FormGroup>
            <FormHelperText>
              Be careful as this choice is irreversible.
            </FormHelperText>
          </FormControl>
          <FormControl sx={{ mt: 4 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Document Clustering</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={steps[activeStep].data.performClustering}
                    onChange={(e) => {
                      dispatch(
                        setStepData({
                          performClustering:
                            !steps[activeStep].data.performClustering,
                        })
                      );
                    }}
                    name="gilad"
                  />
                }
                label="Perform document clustering"
              />
            </FormGroup>
            <FormHelperText>
              Be careful as this choice is irreversible.
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};