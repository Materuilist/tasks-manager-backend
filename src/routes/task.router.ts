import { Router } from "express";

import { parseUser } from "../controllers/shared.controller";
import {
    createTask,
    getProjectTasks,
    getTasks,
} from "../controllers/task.controller";

const router = Router();

router.get("/project-tasks/:projectId", parseUser, getProjectTasks);
router.get("/", parseUser, getTasks);
router.post("/create", parseUser, createTask);

export default router;
