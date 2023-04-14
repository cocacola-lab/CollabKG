import "./Project.css";
import "react-contexify/dist/ReactContexify.css";
import { Col, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Paginator } from "./paginator/paginator";
import { Sidebar } from "./sidebar/sidebar";
import { Table as AnnotationTable } from "./table/Table";
import {
  selectShowToast,
  selectShowCluster,
  selectAnnotationMode,
} from "../../app/dataSlice"; //"./text/textSlice";
import { AnnotationToast } from "./toast/Toast";
import { ClusterActionBar } from "./cluster/ClusterActionBar";
import backgroundImage from "../../media/landing2.jpg";

export const Project = () => {
  const showToast = useSelector(selectShowToast);
  const annotationMode = useSelector(selectAnnotationMode);
  const showCluster = useSelector(selectShowCluster);

  // AnnotationToast是一种通知框，通常用于向用户显示简短的、非致命的消息，例如操作成功，提醒等。它通常显示在应用程序的界面上方或下方，一段时间后自动消失。
  // sideBar应该是左边显示标签的部分
  // Paginator 是分页器
  // AnnotationTable 是文本标注块；重要。
  return (
    <>
      {showToast && <AnnotationToast />}
      <Container fluid style={{ 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover", 
      }}>
        <Row>
          <Col id="top-paginator-container"></Col>
        </Row>
        <Row className="justify-content-center">
          <Col
            className="sidebar"
            xs={12}
            sm={12}
            md={3}
            lg={3}
            xl={3}
            xxl={3}
            relationmode={annotationMode === "relation" ? "true" : "false"}
          >
            <Sidebar />
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              maxWidth: "1200px",
            }}
          >
            <div id="main-header-container">
              {showCluster ? (
                <div id="main-cluster-container">
                  {showCluster && <ClusterActionBar />}
                </div>
              ) : (
                <div></div>
              )}
              <div id="main-paginator-container">
                <Paginator />
              </div>
            </div>
            <div className="main">
              <AnnotationTable />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};
