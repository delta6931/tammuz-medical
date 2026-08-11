import { buildMetadata, ClinicSetupPage } from "../../../tools/clinic-setup/shared";

export const metadata = buildMetadata("TR");

export default function Page() {
  return <ClinicSetupPage locale="TR" />;
}
