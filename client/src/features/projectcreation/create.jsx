import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementActiveStep,
  incrementActiveStep,
  selectActiveStep,
  saveStep,
  setStepData,
} from "./createStepSlice";
import { setIdle } from "../feed/feedSlice";
import { Details } from "./steps/details";
import { Preannotation } from "./steps/preannotation";
import { Preprocessing } from "./steps/preprocessing";
import { Review } from "./steps/review";
import { Schema } from "./steps/schema";
import { Upload } from "./steps/upload";

import axios from "../utils/api-interceptor";
import history from "../utils/history";

// New
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { selectSteps } from "./createStepSlice";
import LoadingButton from "@mui/lab/LoadingButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
export const Create = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);

  const components = {// 表单子页面
    details: <Details />,
    upload: <Upload />,
    preprocessing: <Preprocessing />,
    schema: <Schema />,
    preannotation: <Preannotation />,
    review: <Review />,
  };

  const descriptions = {
    details: "Enter project details including task type and clustering",
    upload: "Create or upload a corpus",
    preprocessing: "Apply text preprocessing to your corpus",
    schema: "Build an ontology/schema for entity/relation annotation",
    preannotation: "Upload data for pre-annotation",
    review: "Review project before creation",
  };

  const activeStep = useSelector(selectActiveStep); // 当前步
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {//转到表单的下一个小步骤
    dispatch(saveStep());
    dispatch(incrementActiveStep());
  };

  const handleCreate = async () => { // 多表单都填完，提交后，传到server进行交互处理。
    const getextra = (pre) => {
      // input: "related:[PER, LOC]" output: ["PER", "LOC"]数组
      var aft = []; // 返回RE的subject，object类型等
      const index = pre.indexOf(":");
      if(index < 0){
        return [];
      }

      var pre2 = pre.substring(index + 1).split(',');
      //console.log(pre2);
      aft = Object.values(pre2).map(
        v => v.trim().replace('[','').replace(']','')
      )
      //console.log(aft);
      return aft
    };

    const getprefix = (pre) => {
      // input: "related:[PER, LOC]" output: releated
      const index = pre.indexOf(":");
      if(index < 0){
        return pre;
      }
      return pre.substring(0, index).trim();
    };

    const addextra = (list) => {
      // 在relations添加extra值

      //const entitys = Object.values(list).filter(
      //  (v) => v.isEntity
      //)
      //const rels = Object.values(list).filter(
      //  (v) => !v.isEntity
      //)
      //console.log(entitys)
      //console.log(rels)
      //console.log(list);
      const newrels = Object.values(list).map(
        (v) => {
          const newV = Object.assign({}, v, { extra: getextra(v.name) }); // 因为v设置为了不可改变所以不能直接添加extra值；此外v存在extra值也会改变的
          newV.name = getprefix(v.name)
          newV.fullName = getprefix(v.fullName)
          return newV
        }
      )
      //console.log(newrels)
  
      //return [...entitys, ...newrels]
      return newrels
    }

    const newrels = addextra(steps.schema.data.relationLabels);
    console.log(newrels);
    dispatch(
      setStepData({
        relationLabels: newrels,
      })
    );

    const payload = {
      name: steps.details.data.name,
      description: steps.details.data.description,
      tasks: {
        entityAnnotation: true,
        relationAnnotation: steps.details.data.performRelationAnnotation,
        relationAnnotationType: steps.details.data.relationAnnotationType,
      },
      performClustering: steps.details.data.performClustering,
      texts: steps.upload.data.corpus,
      entityDictionary: steps.preannotation.data.entityDictionary,
      typedTripleDictionary: steps.preannotation.data.typedTripleDictionary,
      entityOntology: steps.schema.data.entityLabels,
      relationOntology: steps.details.data.performRelationAnnotation
        ? newrels
        : [],
      lowerCase: steps.preprocessing.data.lowercase,
      removeDuplicates: steps.preprocessing.data.removeDuplicates,
      charsRemove: steps.preprocessing.data.removeChars,
      charsetRemove: steps.preprocessing.data.removeCharSet,
    };

    // console.log("Form payload ->", payload);
    if (formSubmitted === false) {
      setIsSubmitting(true);
      await axios
        .post("/api/project/create", payload)
        .then((response) => {
          if (response.status === 200) {
            setFormSubmitted(true);
            setIdle(true);
            setTimeout(() => {
              history.push("/feed");
            }, 1000);
          }
        })
        .catch((error) => {
          if (error.response.status === 401 || 403) {
            history.push("/unauthorized");
          }
        });
    }
  };

  // Step 是多表单“进度条”，即到哪个子步骤了
  // steps[activeStep].valid控制下一步按键是否disable
  return (
    <Grid item style={{ width: "75vw", maxWidth: "1600px" }}>
      <Grid item style={{ margin: "1rem 0rem" }}>
        <Card variant="outlined">
          <CardContent>
            <Stepper activeStep={activeStep}>
              {Object.keys(steps).map((label, index) => {
                const stepProps = { completed: steps[label].saved };
                const labelProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </CardContent>
        </Card>
      </Grid>
      <Grid item style={{ margin: "1rem 0rem" }}>
        <Card variant="outlined">
          <CardHeader
            title={activeStep}
            subheader={descriptions[activeStep]}
            style={{ textTransform: "capitalize" }}
          />
          <CardContent>
            <Grid item xs={12}>
              <Stepper />
            </Grid>
            {components[activeStep]}
          </CardContent>
          <CardActions
            sx={{ m: 2 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIosIcon />}
              disabled={activeStep === "details"}
              onClick={() => dispatch(decrementActiveStep())}
            >
              Back
            </Button>
            {activeStep === Object.keys(steps).at(-1) ? (
              <LoadingButton
                loading={isSubmitting}
                variant="contained"
                endIcon={<AddCircleIcon />}
                loadingPosition="end"
                onClick={handleCreate}
              >
                Create
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIosIcon />}
                onClick={handleContinue}
                disabled={!steps[activeStep].valid}
              >
                Save and Continue
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};
