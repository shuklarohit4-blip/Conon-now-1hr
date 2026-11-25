import React, { useEffect, useState, Suspense } from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AdminCommandProvider } from "@/context/AdminCommandContext";
import { FourPanelRelayProvider } from "@/context/FourPanelRelayContext";
import { KycProvider } from "@/context/KycContext";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";
import { UIProvider } from "@/context/UIContext";
import { LiveCatalogProvider } from "@/context/LiveCatalogContext";
import { VendorThemeProvider } from "@/context/VendorThemeContext";
import { VendorLanguageProvider } from "@/context/VendorLanguageContext";
import { DriverThemeProvider } from "@/context/DriverThemeContext";
import { DriverLanguageProvider } from "@/context/DriverLanguageContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { LocationProvider } from "@/context/LocationContext";
import { WalletProvider } from "@/context/WalletContext";
import { LocationConfirmSheet } from "@/components/LocationConfirmSheet";
import { AuthModal } from "@/components/AuthModal";
import { GlobalLoader } from "@/components/GlobalLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Splash }            from "./pages/Splash";
import { Home }              from "./pages/Home";

// Secondary & non-critical routes are dynamically loaded on-demand for maximum mobile speed
const Categories = React.lazy(() => import("./pages/Categories").then(m => ({ default: m.Categories })));
const Services = React.lazy(() => import("./pages/Services").then(m => ({ default: m.Services })));
const Orders = React.lazy(() => import("./pages/Orders"));
const Profile = React.lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Login = React.lazy(() => import("./pages/Login"));
const VendorDashboard = React.lazy(() => import("./pages/VendorDashboard").then(m => ({ default: m.VendorDashboard })));
const VendorRegisterPage = React.lazy(() => import("./pages/VendorRegisterPage"));
const DriverRegisterPage = React.lazy(() => import("./pages/DriverRegisterPage"));

const AdminDashboard = IS_LOCAL_ADMIN
  ? React.lazy(() => import("./pages/AdminDashboard"))
  : null;
const ImageQA = IS_LOCAL_ADMIN
  ? React.lazy(() => import("./pages/ImageQA"))
  : null;
const DriverApp = React.lazy(() => import("./pages/DriverApp"));
const Parcha = React.lazy(() => import("./pages/Parcha").then(m => ({ default: m.Parcha })));
const KhataManager = React.lazy(() => import("./pages/KhataManager").then(m => ({ default: m.KhataManager })));
const CononBuild = React.lazy(() => import("./pages/CononBuild").then(m => ({ default: m.CononBuild })));
const HeavyRentals = React.lazy(() => import("./pages/HeavyRentals").then(m => ({ default: m.HeavyRentals })));
const BuilderKitPage = React.lazy(() => import("./pages/BuilderKitPage").then(m => ({ default: m.BuilderKitPage })));
const ProjectTimeline = React.lazy(() => import("./pages/ProjectTimeline").then(m => ({ default: m.ProjectTimeline })));
const DesignersHub = React.lazy(() => import("./pages/DesignersHub").then(m => ({ default: m.DesignersHub })));
const BulkRewards = React.lazy(() => import("./pages/BulkRewards").then(m => ({ default: m.BulkRewards })));
const DeliveryTracker = React.lazy(() => import("./pages/DeliveryTracker").then(m => ({ default: m.DeliveryTracker })));
const LiveTracking = React.lazy(() => import("./pages/LiveTracking").then(m => ({ default: m.LiveTracking })));
const AIEstimator = React.lazy(() => import("./pages/AIEstimator"));
const SmartDraftAI = React.lazy(() => import("./pages/SmartDraftAI"));
const ArchGenius = React.lazy(() => import("./pages/ArchGenius").then(m => ({ default: m.ArchGenius })));
const SmartBuild3D = React.lazy(() => import("./pages/SmartBuild3D"));
const Contact = React.lazy(() => import("./pages/Contact"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = React.lazy(() => import("./pages/ShippingPolicy"));
const DeleteAccount = React.lazy(() => import("./pages/DeleteAccount"));
const CartPage = React.lazy(() => import("./pages/Cart"));
const NotFound = React.lazy(() => import("./pages/not-found"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-amber-400 font-bold gap-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">CONON-NOW • Loading…</p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
      <Route path="/"        component={Splash}          />
      <Route path="/home"    component={Home}            />
      <Route path="/categories" component={Categories}   />
      <Route path="/collections/power-tools-safety" component={Categories} />
      <Route path="/collections/power-tools" component={Categories} />
      <Route path="/collections/hand-measuring-tools" component={Categories} />
      <Route path="/collections/site-safety-ppe" component={Categories} />
      <Route path="/collections/tools-hardware" component={Categories} />
      <Route path="/collections/safety-workwear" component={Categories} />
      <Route path="/collections/cement-1" component={Categories} />
      <Route path="/collections/bricks-sand-gitti-aac" component={Categories} />
      <Route path="/collections/red-clay-fly-ash-bricks" component={Categories} />
      <Route path="/collections/aac-concrete-blocks" component={Categories} />
      <Route path="/collections/sand-morang-stone-dust" component={Categories} />
      <Route path="/collections/stone-aggregates-gitti" component={Categories} />
      <Route path="/collections/paver-blocks-cover-blocks" component={Categories} />
      <Route path="/collections/bricks" component={Categories} />
      <Route path="/collections/sand" component={Categories} />
      <Route path="/collections/morang" component={Categories} />
      <Route path="/collections/gitti" component={Categories} />
      <Route path="/collections/aac" component={Categories} />
      <Route path="/collections/cement" component={Categories} />
      <Route path="/collections/cement-white-cement" component={Categories} />
      <Route path="/collections/tmt-sariya" component={Categories} />
      <Route path="/collections/binding-wire-accessories" component={Categories} />
      <Route path="/collections/waterproofing-chemicals" component={Categories} />
      <Route path="/collections/tile-adhesives-block-mortar" component={Categories} />
      <Route path="/collections/sand-plaster-mortars" component={Categories} />
      <Route path="/collections/masonry-tools-hardware" component={Categories} />
      <Route path="/collections/chemicals" component={Categories} />
      <Route path="/collections/cement-civil-works" component={Categories} />
      <Route path="/collections/plywood-blockboard" component={Categories} />
      <Route path="/collections/plywood-8x4" component={Categories} />
      <Route path="/collections/flush-doors-30mm" component={Categories} />
      <Route path="/collections/laminates-1mm" component={Categories} />
      <Route path="/collections/hardware-locks-hinges" component={Categories} />
      <Route path="/collections/plywood-doors-hardware" component={Categories} />
      <Route path="/collections/hdhmr-mdf-boilo" component={Categories} />
      <Route path="/collections/laminates" component={Categories} />
      <Route path="/collections/wpc-flush-doors" component={Categories} />
      <Route path="/collections/plywood-boards" component={Categories} />
      <Route path="/collections/wood-adhesives" component={Categories} />
      <Route path="/collections/hinges" component={Categories} />
      <Route path="/collections/mechanical-locks" component={Categories} />
      <Route path="/collections/electrical-wires" component={Categories} />
      <Route path="/collections/wires-mcb-electrical" component={Categories} />
      <Route path="/collections/ss-sinks" component={Categories} />
      <Route path="/collections/kitchen-sinks-faucets" component={Categories} />
      <Route path="/collections/interior-emulsions" component={Categories} />
      <Route path="/collections/painting" component={Categories} />
      <Route path="/collections/paints-putty-primer" component={Categories} />
      <Route path="/collections/wall-putty" component={Categories} />
      <Route path="/collections/wall-metal-primers" component={Categories} />
      <Route path="/collections/interior-paints-distempers" component={Categories} />
      <Route path="/collections/exterior-paints" component={Categories} />
      <Route path="/collections/enamels-tools" component={Categories} />
      <Route path="/collections/enamels-thinners-tools" component={Categories} />
      <Route path="/collections/cameras" component={Categories} />
      <Route path="/collections/cctv-cameras" component={Categories} />
      <Route path="/collections/cctv-networking" component={Categories} />
      <Route path="/collections/cctv" component={Categories} />
      <Route path="/collections/dvr-nvr-recorders" component={Categories} />
      <Route path="/collections/surveillance-storage" component={Categories} />
      <Route path="/collections/cctv-lan-cables" component={Categories} />
      <Route path="/collections/power-poe-switches" component={Categories} />
      <Route path="/collections/routers-racks-accessories" component={Categories} />
      <Route path="/collections/nvr-dvr-switches" component={Categories} />
      <Route path="/collections/wifi-networking" component={Categories} />
      <Route path="/collections/cctv-cat6-cable" component={Categories} />
      <Route path="/collections/cctv-accessories" component={Categories} />
      <Route path="/collections/rack-connectors-hardware" component={Categories} />
      <Route path="/collections/tiles-marble-granite" component={Categories} />
      <Route path="/collections/vitrified-floor-tiles" component={Categories} />
      <Route path="/collections/ceramic-wall-parking-tiles" component={Categories} />
      <Route path="/collections/granite-slabs" component={Categories} />
      <Route path="/collections/marble-natural-stones" component={Categories} />
      <Route path="/collections/grouts-tools" component={Categories} />
      <Route path="/collections/tile-adhesives" component={Categories} />
      <Route path="/collections/tile-stone-installation" component={Categories} />
      <Route path="/collections/ceiling-panel-lights" component={Categories} />
      <Route path="/collections/lighting" component={Categories} />
      <Route path="/collections/shoes-gloves" component={Categories} />
      <Route path="/collections/safety-workwear" component={Categories} />
      <Route path="/collections/safety" component={Categories} />
      <Route path="/collections/cpvc-pipes-hardware" component={Categories} />
      <Route path="/collections/cpvc-plumbing-tanks" component={Categories} />
      <Route path="/collections/cpvc-pipes" component={Categories} />
      <Route path="/collections/upvc-pipes-fittings" component={Categories} />
      <Route path="/collections/swr-drainage-pipes" component={Categories} />
      <Route path="/collections/cpvc-fittings-valves" component={Categories} />
      <Route path="/collections/solvent-cements-adhesives" component={Categories} />
      <Route path="/collections/overhead-water-tanks" component={Categories} />
      <Route path="/collections/plumbing" component={Categories} />
      <Route path="/collections/complete-sanitary-sets" component={Categories} />
      <Route path="/collections/wc-concealed-cisterns" component={Categories} />
      <Route path="/collections/concealed-systems" component={Categories} />
      <Route path="/collections/wash-basins-faucets-1" component={Categories} />
      <Route path="/collections/wash-basins-taps" component={Categories} />
      <Route path="/collections/mixers-diverters-shower" component={Categories} />
      <Route path="/collections/bathroom-fittings-accessories" component={Categories} />
      <Route path="/collections/urinals" component={Categories} />
      <Route path="/collections/sanitary-bath-fittings" component={Categories} />
      <Route path="/collections/sanitary" component={Categories} />
      <Route path="/collections/home-appliances" component={Categories} />
      <Route path="/collections/ceiling-fans" component={Categories} />
      <Route path="/collections/chimney" component={Categories} />
      <Route path="/collections/pedestal-fans" component={Categories} />
      <Route path="/collections/exhaust" component={Categories} />
      <Route path="/collections/water-heater-geyser" component={Categories} />
      <Route path="/collections/ups-inverter-batteries" component={Categories} />
      <Route path="/collections/pumps-motors" component={Categories} />
      <Route path="/collections/:slug" component={Categories} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart"    component={CartPage}        />
      <Route path="/services"component={Services}        />
      <Route path="/orders"  component={Orders}          />
      <Route path="/profile" component={Profile}         />
      <Route path="/login"   component={Login}           />
      <Route path="/vendor"  component={VendorDashboard} />
      <Route path="/vendor/register" component={VendorRegisterPage} />
      {IS_LOCAL_ADMIN && AdminDashboard && (
        <Route path="/admin">
          {() => (
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center text-amber-400 font-bold gap-3">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm uppercase tracking-widest">Loading Admin Command OS…</p>
                </div>
              }
            >
              <AdminDashboard />
            </Suspense>
          )}
        </Route>
      )}
      {IS_LOCAL_ADMIN && ImageQA && (
        <Route path="/admin/image-qa">
          {() => <ImageQA />}
        </Route>
      )}
      <Route path="/driver"  component={DriverApp}       />
      <Route path="/driver/register" component={DriverRegisterPage} />
      <Route path="/parcha"    component={Parcha}          />
      <Route path="/khata"     component={KhataManager}    />
      <Route path="/build"     component={CononBuild}      />
      <Route path="/rentals"   component={HeavyRentals}    />
      <Route path="/builder-kit" component={BuilderKitPage} />
      <Route path="/kits"      component={BuilderKitPage}  />
      <Route path="/project"   component={ProjectTimeline} />
      <Route path="/designers" component={DesignersHub}    />
      <Route path="/rewards"   component={BulkRewards}    />
      <Route path="/track"     component={DeliveryTracker} />
      <Route path="/live-track" component={LiveTracking}    />
      <Route path="/estimator" component={AIEstimator}     />
      <Route path="/smart-draft" component={SmartDraftAI}  />
      <Route path="/arch-genius" component={ArchGenius}    />
      <Route path="/smart-build" component={SmartBuild3D}  />
      <Route path="/contact"   component={Contact}         />
      <Route path="/privacy-policy" component={PrivacyPolicy}   />
      <Route path="/terms"          component={Terms}           />
      <Route path="/refund-policy"  component={RefundPolicy}    />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      <Route path="/delete-account" component={DeleteAccount}   />

      {/* Safety Alias Redirects (Prevents /home/vendor, /home/driver, /delivery-tracker 404 bugs) */}
      <Route path="/home/vendor">{() => <Redirect to="/vendor" replace />}</Route>
      <Route path="/home/vendor/register">{() => <Redirect to="/vendor/register" replace />}</Route>
      <Route path="/home/driver">{() => <Redirect to="/driver" replace />}</Route>
      <Route path="/home/driver/register">{() => <Redirect to="/driver/register" replace />}</Route>
      <Route path="/home/admin">{() => <Redirect to={IS_LOCAL_ADMIN ? "/admin" : "/"} replace />}</Route>
      <Route path="/delivery-tracker">{() => <Redirect to="/track" replace />}</Route>

      <Route                 component={NotFound}        />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AuthProvider>
          <AdminCommandProvider>
            <FourPanelRelayProvider>
              <KycProvider>
                <LocationProvider>
                  <WalletProvider>
                    <UIProvider>
                      <LiveCatalogProvider>
                        <VendorThemeProvider>
                          <VendorLanguageProvider>
                            <DriverThemeProvider>
                              <DriverLanguageProvider>
                                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                                  <GlobalLoader />
                                  <ErrorBoundary>
                                    <Router />
                                  </ErrorBoundary>
                                  <LocationConfirmSheet />
                                  <AuthModal />
                                  <Toaster
                                    position="top-center"
                                    richColors
                                    closeButton
                                    toastOptions={{
                                      style: {
                                        borderRadius: "20px",
                                        fontWeight: 700,
                                      },
                                    }}
                                  />
                                </WouterRouter>
                              </DriverLanguageProvider>
                            </DriverThemeProvider>
                          </VendorLanguageProvider>
                        </VendorThemeProvider>
                      </LiveCatalogProvider>
                    </UIProvider>
                  </WalletProvider>
                </LocationProvider>
              </KycProvider>
            </FourPanelRelayProvider>
          </AdminCommandProvider>
        </AuthProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
