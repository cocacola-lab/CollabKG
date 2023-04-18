import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  status: "idle",
  error: null,
  steps: {
    details: {
      number: 0,
      saved: false,
      data: {
        name: "",
        description: "",
        performRelationAnnotation: false,
        relationAnnotationType: "",
        isEvent: false,
        performClustering: false,
        modelUpdate: false,
      },
      valid: false,
    },
    upload: {
      number: 1,
      saved: false,
      data: {
        corpus: [], // 就是文本列表
        corpusFileName: null,
      },
      valid: false,
    },
    preprocessing: {
      number: 2,
      saved: false,
      data: {
        lowercase: false,
        removeDuplicates: false,
        removeChars: false,
        removeCharSet: '~",?;!:()[]_{}*.$',
      },
      valid: true, // No mandatory steps here, all optional.
    },
    schema: {
      number: 3,
      saved: false,
      data: {
        entityName: "", // Custom等数据集名字
        entityLabels: [], //里面存放 {name: 'Person', fullName: 'Person', isEntity: true, description: '', children: Array(0), colour: '#E79584', ...}
        relationName: "",
        relationLabels: [],// 与entityLabels类似，见client/src/features/projectcreation/data/ontologies.js
      },
      valid: false,
    },
    preannotation: {
      number: 4,
      saved: false,
      data: {
        entityDictionary: [],
        entityDictionaryFileName: null,
        typedTripleDictionary: [],
        typedTripleDictionaryFileName: null,
      },
      valid: true, // No mandatory steps here, all optional.
    },
    review: {
      number: 5,
      saved: false,
      data: { name: "", description: "" },
      valid: false,
    },
  },
  activeStep: "details", //当前步，到哪个小页面了
};

export const createStepSlice = createSlice({
  name: "create",
  initialState: initialState,
  reducers: {
    setStep: (state, action) => {
      state.steps = action.payload;
    },
    setStepData: (state, action) => { // 更改data中的元素
      // Sets a value for a key in the data associated with a step
      const newData = {
        ...state.steps[state.activeStep].data,
        ...action.payload,
      };

      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        data: newData,
      };
    },
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },
    incrementActiveStep: (state, action) => { //下一步
      const currentStepNo = state.steps[state.activeStep].number;
      const nextStepNo = currentStepNo + 1;

      state.activeStep = Object.keys(state.steps).filter(
        (stepName) => state.steps[stepName].number === nextStepNo
      )[0];
    },
    decrementActiveStep: (state, action) => { //上一步
      const currentStepNo = state.steps[state.activeStep].number;
      const nextStepNo = currentStepNo - 1;

      state.activeStep = Object.keys(state.steps).filter(
        (stepName) => state.steps[stepName].number === nextStepNo
      )[0];
    },
    resetSteps: (state, action) => {
      state.steps = initialState.steps;
      state.activeStep = Object.keys(initialState.steps)[0];
    },
    saveStep: (state, action) => {
      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        saved: true,
      };
    },
    setStepValid: (state, action) => {
      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        valid: action.payload,
      };
    },
  },
});

export const {
  setStep,
  setStepData,
  setActiveStep,
  resetSteps,
  saveStep,
  incrementActiveStep,
  decrementActiveStep,
  setStepValid,
} = createStepSlice.actions;

export const selectSteps = (state) => state.create.steps;
export const selectActiveStep = (state) => state.create.activeStep;
export const selectCorpus = (state) => state.create.steps.upload.data.corpus;
export const selectPreprocessingActions = (state) =>
  state.create.steps.preprocessing.data;
export const selectMetaTags = (state) =>
  state.create.steps.schema.data.metaTags;
export const selectPreannotationActions = (state) =>
  state.create.steps.preannotation.data;
export const selectPerformRelationAnnotation = (state) =>
  state.create.steps.details.data.performRelationAnnotation;

export default createStepSlice.reducer;
