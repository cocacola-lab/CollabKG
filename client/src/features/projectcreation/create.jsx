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
import { getRandomColor } from "./data/utils";
import { v4 as uuidv4 } from "uuid";

import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import UploadIcon from '@mui/icons-material/Upload';
import NotesIcon from '@mui/icons-material/Notes';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PropTypes from 'prop-types';

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
    details: "Enter project details including task type, model update and clustering",
    upload: "Create or upload a corpus, Note: Words (including punctuation) should be separated by spaces, like \"I love Bob , which is my father .\"",
    preprocessing: "Apply text preprocessing to your corpus",
    schema: !steps.details.data.performRelationAnnotation? "Build an ontology/schema for entity annotation":
    !steps.details.data.isEvent? "Build an ontology/schema for entity-relation triples annotation. ps: the relation types format is \"relation@[subject, object], where subject/object refers to head/tail entity type in triples.\""
    :"Build an ontology/schema for event annotation. ps: 1. the event types only choice preset \"EE\", where \"Anything\" stands for event Argument, of course you can change it for you like. 2. the relation types format is \"event-type@[argument role 1, argument role 2, ...].\"",
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
      // input: "related@[PER, LOC]" output: ["PER", "LOC"]数组
      var aft = []; // 返回RE的subject，object类型等
      const index = pre.indexOf("@");
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
      // input: "related@[PER, LOC]" output: releated
      const index = pre.indexOf("@");
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

    const addextraEE = (orientitys, orirels) => {
      // process event 
      const temprels = [];
      const tempentitys = [];
      const temprole = {}; // {role: [event type 1, event type 2]}
  
      Object.values(orirels).forEach((item) => {
        //entity get
        const prefix = getprefix(item.name);
        tempentitys.push({
          children: [],
          colour: getRandomColor(),
          description: "",
          fullName: prefix,
          isEntity: true,
          name: prefix,
          _id: uuidv4()
        });
  
        // temprole get 
        const extra = getextra(item.name);
        Object.values(extra).forEach((role) => {
          if (role in temprole) {
            temprole[role].push(prefix);
          } else {
            temprole[role] = [prefix];
          }
        });
      });
  
      // console.log(temprole);
      // relation get
      Object.keys(temprole).forEach((key) => {
        temprels.push({
          children: [],
          colour: getRandomColor(),
          description: "",
          fullName: key,
          isEntity: false,
          name: key,
          extra: temprole[key],
          _id: uuidv4()
        });
      });
      return [[...orientitys, ...tempentitys], temprels];
    };
    
    let newrels, newentitys;
    if(!steps.details.data.performRelationAnnotation){
      // entity only, no process
      newentitys = steps.schema.data.entityLabels;
      newrels = steps.schema.data.relationLabels;
    }
    else if(!steps.details.data.isEvent){
      // relation and entity, process rels
      newentitys = steps.schema.data.entityLabels;
      newrels = addextra(steps.schema.data.relationLabels);
      //console.log(newrels);
      dispatch(
        setStepData({
          relationLabels: newrels,
        })
      );
    }else if(steps.details.data.isEvent){
      // event, prcess rels and add entitys
      const orientitys = steps.schema.data.entityLabels;
      const orirels = steps.schema.data.relationLabels;
      const result = addextraEE(orientitys, orirels);
      newentitys = result[0];
      newrels = result[1];
      console.log(newentitys);
      console.log(newrels);
    }
    

    const payload = {
      name: steps.details.data.name,
      description: steps.details.data.description,
      tasks: {
        entityAnnotation: true,
        relationAnnotation: steps.details.data.performRelationAnnotation,
        relationAnnotationType: steps.details.data.relationAnnotationType,
        isEvent: steps.details.data.isEvent,
        modelUpdate: steps.details.data.modelUpdate,
      },
      performClustering: steps.details.data.performClustering,
      texts: steps.upload.data.corpus,
      entityDictionary: steps.preannotation.data.entityDictionary,
      typedTripleDictionary: steps.preannotation.data.typedTripleDictionary,
      entityOntology: newentitys,
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

  // 连接线样式
  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
        borderLeftStyle: "solid",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#784af4',
        borderLeftStyle: "solid",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderRadius: 1,
      height: "40px", // 设置连接线的高度
      borderColor: "grey",
      borderWidth: "2.5px",
      borderLeftStyle: "dashed",
    },
  }));
  
  //stepper label样式
  const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#3c3c3c',
    zIndex: 1,
    color: '#fff',
    width: 35,
    height: 35,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
      backgroundImage:
        'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
      boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
      backgroundImage:
        'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
    }),
  }));
  
  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;
  
    const icons = {
      1: <SettingsIcon />,
      2: <UploadIcon />,
      3: <GroupAddIcon />,
      4: <VideoLabelIcon />,
      5: <NotesIcon />,
      6: <VisibilityIcon />,
    };
  
    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }
  
  ColorlibStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
  };

  // Step 是多表单“进度条”，即到哪个子步骤了
  // steps[activeStep].valid控制下一步按键是否disable
  return (
    <Grid container style={{ width: "100vw", height: "100vh" }}>
      <Grid item style={{ width: "80%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Card variant="outlined" style={{ flex: 1, paddingLeft: "1rem", paddingRight: "2rem"}}>
          <CardHeader
            title={activeStep}
            subheader={descriptions[activeStep]}
            style={{ textTransform: "capitalize" }}
          />
          <CardContent style={{ flex: 1 }}>
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
      <Grid item style={{ width: "20%", display: "flex", flexDirection: "column" }}>
        <Card variant="outlined" style={{ flex: 1, paddingLeft: "3rem" }}>
          <CardContent style={{ overflowY: "auto"}}>
            <Stepper activeStep={activeStep} orientation="vertical" connector={<QontoConnector />}>
              {Object.keys(steps).map((label, index) => {
                const stepProps = { completed: steps[label].saved };
                const labelProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel StepIconComponent={ColorlibStepIcon}><strong>{index+1+". "+label}</strong></StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
