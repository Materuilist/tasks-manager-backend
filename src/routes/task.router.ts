import { parseUser } from "../controllers/shared.controller";
import { createTask, getTasks } from "../controllers/task.controller";
import { Router } from "express";

const router = Router();

router.get("/", parseUser, getTasks);
router.post("/create", parseUser, createTask);

export default router;
