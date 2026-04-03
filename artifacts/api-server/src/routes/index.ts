import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transcribeRouter from "./voicinne/transcribe";
import generatePersonaRouter from "./voicinne/generate-persona";
import cloneVoiceRouter from "./voicinne/clone-voice";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transcribeRouter);
router.use(generatePersonaRouter);
router.use(cloneVoiceRouter);

export default router;
