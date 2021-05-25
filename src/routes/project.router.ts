import { Router } from "express";

import { parseUser } from "../controllers/shared.controller";
import { createProject, getProjects } from "../controllers/project.controller";

const router = Router();

router.get("/", parseUser, getProjects);

router.post("/create", parseUser, createProject);

export default router;
