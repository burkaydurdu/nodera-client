import { useContext } from "react";
import ProjectContext from "./ProjectContext";

const useProjects = () => useContext(ProjectContext);

export default useProjects;
