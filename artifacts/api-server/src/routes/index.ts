import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import otpAuthRouter from "./otpAuth";
import materialsRouter from "./materials";
import cartRouter from "./cart";
import servicesRouter from "./services";
import ordersRouter from "./orders";
import mandiRouter from "./mandi";
import adminRouter from "./admin";
import mapsRouter from "./maps";
import vendorRouter from "./vendor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(otpAuthRouter);
router.use(materialsRouter);
router.use(cartRouter);
router.use(servicesRouter);
router.use(ordersRouter);
router.use(mandiRouter);
router.use(adminRouter);
router.use(mapsRouter);
router.use(vendorRouter);

export default router;
