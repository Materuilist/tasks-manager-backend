import { Router } from "express";

import { parseUser } from "../controllers/shared.controller";
import { getAuth } from "../controllers/test-app.controller";

const router = Router();

router.get("/auth", getAuth);

export default router;
