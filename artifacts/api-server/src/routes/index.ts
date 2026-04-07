import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transcribeRouter from "./voicinne/transcribe";
import generatePersonaRouter from "./voicinne/generate-persona";
import cloneVoiceRouter from "./voicinne/clone-voice";
import createAgentRouter from "./voicinne/create-agent";
import getConversationTokenRouter from "./voicinne/get-conversation-token";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transcribeRouter);
router.use(generatePersonaRouter);
router.use(cloneVoiceRouter);
router.use(createAgentRouter);
router.use(getConversationTokenRouter);

export default router;
