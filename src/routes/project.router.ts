import { Router } from "express";

import { parseUser } from "../controllers/shared.controller";
import {
    createProject,
    getProjects,
    setTeam,
} from "../controllers/project.controller";

const router = Router();

router.get("/", parseUser, getProjects);

router.post("/create", parseUser, createProject);

router.post("/set-team", parseUser, setTeam);

export default router;
