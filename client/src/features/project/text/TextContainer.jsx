import { useEffect, useState } from "react";
import { IoColorWand, IoGitCompare, IoSave, IoBrush } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  saveAnnotations,
  selectPage,
  selectPageLimit,
  selectRelations,
  selectTexts,
  selectTextsStatus,
  selectAnnotationMode,
  applyAnnotation,
  selectlastestAutoEId,
} from "../../../app/dataSlice";
import { selectUserId } from "../../auth/userSlice";
import { ClusterIcon } from "../cluster/ClusterIcon";
import { selectProject } from "../projectSlice";
import { Text } from "./Text";
import "./Text.css";
import axios from "../../utils/api-interceptor";
import history from "../../utils/history";

export const TextContainer = ({ textId, textIndex }) => {
  const project = useSelector(selectProject);
  const texts = useSelector(selectTexts);
  const annotationMode = useSelector(selectAnnotationMode);
  const textsStatus = useSelector(selectTextsStatus);
  const relations = useSelector(selectRelations);
  const userId = useSelector(selectUserId);
  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const [saved, setSaved] = useState();
  const [relationCount, setRelationCount] = useState();
  const [suggestedRelationCount, setSuggestedRelationCount] = useState();

  useEffect(() => {
    if (textsStatus === "succeeded") {
      setSaved(texts[textId].saved.map((s) => s.createdBy).includes(userId));
      setRelationCount(
        relations &&
          Object.keys(relations).includes(textId) &&
          relations[textId].filter((r) => !r.suggested).length
      );
      setSuggestedRelationCount(
        relations &&
          Object.keys(relations).includes(textId) &&
          relations[textId].filter((r) => r.suggested).length
      );
    }
  }, [textsStatus, texts, relations]);

  const docProps = {
    project,
    textIndex,
    saved,
    page,
    pageLimit,
    relationCount,
    suggestedRelationCount,
    textId,
    texts,
    annotationMode,
  };

  return (
    <div
      id={`text-container-${textIndex}`}
      className="text-container"
      annotated={saved ? "true" : "false"}
      key={textIndex}
    >
      <TextCard {...docProps} />
    </div>
  );
};

const TextCard = ({
  project,
  textIndex,
  saved,
  page,
  pageLimit,
  clusterExpanded,
  setClusterExpanded,
  relationCount,
  suggestedRelationCount,
  textId,
  texts,
  annotationMode
}) => {
  const dispatch = useDispatch();
  // const GetEntityid = () => {
  //   const temp = useSelector(selectlastestAutoEId);
  //   return temp;
  // }
  // const [entityId, setEntityId] = useState(null);
  // const latestAutoEId = useSelector(selectlastestAutoEId);

  // useEffect(() => {
  //   setEntityId(latestAutoEId);
  // }, [latestAutoEId]);

  //console.log(latestAutoEId);

  const handleautoAnnotate = async () => { 
    if (annotationMode === "entity"){
      const temptype = Object.values(project.ontology).filter( (ont) =>
          ont.isEntity
      );
      const payinput = {
          sentence: "",
          type: [],
          text: texts[textId],
          pretype: temptype,
          lang: "english",
          task: "entity",
      }
      //console.log(payinput);  
      try{
        const response = await axios
        .post("/api/text/autoannotate", payinput)
        
        if (response.status === 200) {
          const result = response.data;
          console.log(result);
          if(result.markup.length === 0){
            return;
          }
          // Create payload
          for (const item of result.markup) {
            const payload = {
              entitySpanStart: item.entitySpanStart,
              entitySpanEnd: item.entitySpanEnd,
              entityLabel: item.entityLabel,
              entityLabelId: item.entityLabelId,
              textId: textId,
              projectId: project._id,
              applyAll: false,
              annotationType: "entity",
              suggested: true,
              textIds: Object.keys(texts),
              entityText: item.entityText,
            };
            console.log(payload);

            await dispatch(applyAnnotation({ ...payload })); // 注意要await，不然标注结果会乱
            }
        }

      } catch(e){
        console.log(e); 
      }
    } else if(annotationMode === "relation"){
      const temptype = Object.values(project.ontology).filter( (ont) =>
          !ont.isEntity
      );
      const temptype2 = Object.values(project.ontology).filter( (ont) =>
          ont.isEntity
      );
      const payinput = {
          sentence: "",
          type: [],
          text: texts[textId],
          pretype: temptype,
          epretype: temptype2,
          lang: "english",
          task: "relation",
      }
      //console.log(payinput);  
      try{
        const response = await axios
          .post("/api/text/autoannotate", payinput);

        if (response.status === 200) {
          const result = response.data;
          console.log(result);
          if(result.markup.length === 0){
            return;
          }
          // Create payload
          for (const item of result.markup) {

            // 先后获得两个实体的id，关键:实时获取id。
            const payload = {
              entitySpanStart: item[0].entitySpanStart,
              entitySpanEnd: item[0].entitySpanEnd,
              entityLabel: item[0].entityLabel,
              entityLabelId: item[0].entityLabelId,
              textId: textId,
              projectId: project._id,
              applyAll: false,
              annotationType: "entity",
              suggested: true,
              textIds: Object.keys(texts),
              entityText: item[0].entityText,
            };
            console.log(payload);

            const temp = await dispatch(applyAnnotation({ ...payload }));
            //console.log(temp);
          
            const source = temp.payload.response.data._id;

            const payload2 = {
              entitySpanStart: item[1].entitySpanStart,
              entitySpanEnd: item[1].entitySpanEnd,
              entityLabel: item[1].entityLabel,
              entityLabelId: item[1].entityLabelId,
              textId: textId,
              projectId: project._id,
              applyAll: false,
              annotationType: "entity",
              suggested: true,
              textIds: Object.keys(texts),
              entityText: item[1].entityText,
            };
            console.log(payload2);

            const temp2 = await dispatch(applyAnnotation({ ...payload2 }));
            //console.log(temp2);
            const target = temp2.payload.response.data._id;
            
            // apply relation
            const reload = {
              projectId: project._id,
              textId: textId,
              sourceEntityId: source,
              targetEntityId: target,
              relationLabelId: item[2].relationLabelId,
              applyAll: false,
              suggested: true,
              annotationType: "relation",
              textIds: Object.keys(texts),//.map((t) => t._id),
            }
            console.log(reload);
            await dispatch(applyAnnotation({...reload}));
          }
        }
       
      } catch(e){
        console.log(e); 
      }
    }
  }  
  //包括一个左上角的序号、一个中间的文本块和一个右上角的工具栏:一个保存图标、关系计数图标。
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#eceff1ed",
        margin: "1rem 0rem",
        borderTop: "1px solid #90a4ae",
        borderBottom: "1px solid #90a4ae",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "#90a4ae",
            padding: "1rem 1rem 1rem 1rem",
          }}
        >
          {textIndex + 1 + (page - 1) * pageLimit}
        </span>
        <div
          style={{
            padding: "0.125rem 0.5rem",
            width: "auto",
            borderBottomLeftRadius: "0.25rem",
            backgroundColor: saved ? "#1b5e20" : "#37474f",
            color: "#eceff1",
          }}
        >
          <span>
            {relationCount > 0 && (
              <IoGitCompare
                style={{ margin: "0rem 0.25rem 0rem 0rem", cursor: "help" }}
                title={`This document has ${relationCount} ${
                  relationCount > 1 ? "relations" : "relation"
                }`}
              />
            )}
            {suggestedRelationCount > 0 && (
              <IoColorWand
                style={{ margin: "0rem 0.25rem 0rem 0rem", cursor: "help" }}
                title={`This document has ${suggestedRelationCount} suggested ${
                  suggestedRelationCount > 1 ? "relations" : "relation"
                }`}
              />
            )}
            <IoBrush
              title={"auto annotate"}
              style={{
                color: "#FFFFFF",
                margin: "0rem 0.25rem 0rem 0rem",
                cursor: "pointer",
              }}
              onClick={handleautoAnnotate}
            />
            <IoSave
              title={saved ? "Click to unsave" : "Click to save"}
              style={{
                color: saved ? "#eceff1" : "#607d8b",
                margin: "0rem 0.25rem 0rem 0rem",
                cursor: "pointer",
              }}
              onClick={() => {
                dispatch(
                  saveAnnotations({
                    textIds: [textId],
                  })
                );
              }}
            />
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: "0rem 0.25rem 0.5rem 1rem",
          justifyContent: "space-between",
        }}
      >
        <Text key={textIndex} textId={textId} textIndex={textIndex} />
        <div style={{ margin: "auto 0rem 0rem 0rem" }}>
          {project.settings.performClustering && !clusterExpanded && (
            <ClusterIcon textId={textId} />
          )}
        </div>
      </div>
    </div>
  );
};
