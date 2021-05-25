import { Router } from "express";

import { parseUser } from "../controllers/shared.controller";
import { getProjects } from "../controllers/project.controller";

const router = Router();

router.get("/", parseUser, getProjects);

export default router;
