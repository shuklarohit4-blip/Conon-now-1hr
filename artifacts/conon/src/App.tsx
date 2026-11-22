import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@workspace/auth-web";
import { UIProvider } from "@/context/UIContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { LocationProvider } from "@/context/LocationContext";
import { WalletProvider } from "@/context/WalletContext";
import { LocationConfirmSheet } from "@/components/LocationConfirmSheet";
import { GlobalLoader } from "@/components/GlobalLoader";

import { Splash }            from "./pages/Splash";
import { Home }              from "./pages/Home";
import { Categories }        from "./pages/Categories";
import { Services }          from "./pages/Services";
import { Orders }            from "./pages/Orders";
import { Profile }           from "./pages/Profile";
import { Login }             from "./pages/Login";
import { VendorDashboard }   from "./pages/VendorDashboard";
import { AdminDashboard }    from "./pages/AdminDashboard";
import { DriverApp }         from "./pages/DriverApp";
import { Parcha }            from "./pages/Parcha";
import { KhataManager }      from "./pages/KhataManager";
import { CononBuild }         from "./pages/CononBuild";
import { HeavyRentals }       from "./pages/HeavyRentals";
import { BuilderKits }        from "./pages/BuilderKits";
import { ProjectTimeline }   from "./pages/ProjectTimeline";
import { DesignersHub }      from "./pages/DesignersHub";
import { BulkRewards }       from "./pages/BulkRewards";
import { DeliveryTracker }   from "./pages/DeliveryTracker";
import { LiveTracking }      from "./pages/LiveTracking";
import AIEstimator           from "./pages/AIEstimator";
import SmartDraftAI          from "./pages/SmartDraftAI";
import { ArchGenius }        from "./pages/ArchGenius";
import { SmartBuild3D }      from "./pages/SmartBuild3D";
import { Contact }           from "./pages/Contact";
import { ProductDetail }     from "./pages/ProductDetail";
import { PrivacyPolicy }     from "./pages/PrivacyPolicy";
import { Terms }             from "./pages/Terms";
import { RefundPolicy }      from "./pages/RefundPolicy";
import { ShippingPolicy }    from "./pages/ShippingPolicy";
import { DeleteAccount }     from "./pages/DeleteAccount";
import NotFound              from "./pages/not-found";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function AuthBridge() {
  const { isAuthenticated, user } = useAuth();
  const { role, setRole, setName } = useUser();

  useEffect(() => {
    if (isAuthenticated && user && !role) {
      setRole("customer");
      const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email ||
        "";
      if (fullName) setName(fullName);
    }
  }, [isAuthenticated, user, role, setRole, setName]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/"        component={Splash}          />
      <Route path="/home"    component={Home}            />
      <Route path="/categories" component={Categories}   />
      <Route path="/collections/cement-1" component={Categories} />
      <Route path="/collections/plywood-blockboard" component={Categories} />
      <Route path="/collections/wood-adhesives" component={Categories} />
      <Route path="/collections/hinges" component={Categories} />
      <Route path="/collections/mechanical-locks" component={Categories} />
      <Route path="/collections/electrical-wires" component={Categories} />
      <Route path="/collections/wires-mcb-electrical" component={Categories} />
      <Route path="/collections/ss-sinks" component={Categories} />
      <Route path="/collections/kitchen-sinks-faucets" component={Categories} />
      <Route path="/collections/interior-emulsions" component={Categories} />
      <Route path="/collections/painting" component={Categories} />
      <Route path="/collections/cameras" component={Categories} />
      <Route path="/collections/cctv-networking" component={Categories} />
      <Route path="/collections/cctv" component={Categories} />
      <Route path="/collections/tile-adhesives" component={Categories} />
      <Route path="/collections/tile-stone-installation" component={Categories} />
      <Route path="/collections/ceiling-panel-lights" component={Categories} />
      <Route path="/collections/lighting" component={Categories} />
      <Route path="/collections/shoes-gloves" component={Categories} />
      <Route path="/collections/safety-workwear" component={Categories} />
      <Route path="/collections/safety" component={Categories} />
      <Route path="/collections/cpvc-pipes-hardware" component={Categories} />
      <Route path="/collections/cpvc-plumbing-tanks" component={Categories} />
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
      <Route path="/collections/:slug" component={Categories} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/services"component={Services}        />
      <Route path="/orders"  component={Orders}          />
      <Route path="/profile" component={Profile}         />
      <Route path="/login"   component={Login}           />
      <Route path="/vendor"  component={VendorDashboard} />
      <Route path="/admin"   component={AdminDashboard}  />
      <Route path="/driver"  component={DriverApp}       />
      <Route path="/parcha"    component={Parcha}          />
      <Route path="/khata"     component={KhataManager}    />
      <Route path="/build"     component={CononBuild}      />
      <Route path="/rentals"   component={HeavyRentals}    />
      <Route path="/kits"      component={BuilderKits}     />
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
      <Route                 component={NotFound}        />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LocationProvider>
          <WalletProvider>
            <UIProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <GlobalLoader />
                <AuthBridge />
                <Router />
                <LocationConfirmSheet />
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
            </UIProvider>
          </WalletProvider>
        </LocationProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
