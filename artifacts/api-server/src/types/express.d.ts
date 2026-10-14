import "express";

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
      /** Set by requireVendor: the authenticated vendor's store name. */
      vendorStore?: string;
      /** Set by requireVendor: the authenticated vendor's user id. */
      vendorUserId?: number;
    }
  }
}
