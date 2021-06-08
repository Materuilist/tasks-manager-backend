import { Router } from "express";

import {
    getAuth,
    getTasksPage,
    postAuth,
} from "../controllers/test-app.controller";

const router = Router();

router.get("/auth", getAuth);
router.post("/auth", postAuth);
router.get("/tasks", getTasksPage);

export default router;
